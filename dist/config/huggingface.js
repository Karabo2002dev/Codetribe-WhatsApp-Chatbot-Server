"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hfGenerate = exports.hfEmbedding = exports.GENERATION_MODEL = exports.EMBEDDING_MODEL = exports.hf = void 0;
const inference_1 = require("@huggingface/inference");
if (!process.env.HF_API_KEY) {
    throw new Error("HF_API_KEY not set");
}
exports.hf = new inference_1.InferenceClient(process.env.HF_API_KEY);
// Models
exports.EMBEDDING_MODEL = "BAAI/bge-base-en-v1.5";
exports.GENERATION_MODEL = "mistralai/Mistral-7B-Instruct-v0.2:featherless-ai";
// Timeouts (ms) — important for WhatsApp webhook speed
const EMBEDDING_TIMEOUT_MS = 20000;
const GENERATION_TIMEOUT_MS = 8000;
// Generation tuning for speed (lower tokens = faster)
const MAX_TOKENS = 160;
const TEMPERATURE = 0.2;
const EMBED_CACHE = new Map();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const CACHE_MAX = 500;
function cacheGet(key) {
    const item = EMBED_CACHE.get(key);
    if (!item)
        return null;
    if (Date.now() > item.expiresAt) {
        EMBED_CACHE.delete(key);
        return null;
    }
    return item.vec;
}
function cacheSet(key, vec) {
    if (EMBED_CACHE.size >= CACHE_MAX) {
        // delete oldest (simple strategy)
        const firstKey = EMBED_CACHE.keys().next().value;
        if (firstKey)
            EMBED_CACHE.delete(firstKey);
    }
    EMBED_CACHE.set(key, { vec, expiresAt: Date.now() + CACHE_TTL_MS });
}
// --------------------
// Generic timeout wrapper
// --------------------
function withTimeout(promise, ms, label) {
    return new Promise((resolve, reject) => {
        const id = setTimeout(() => reject(new Error(label)), ms);
        promise
            .then((val) => {
            clearTimeout(id);
            resolve(val);
        })
            .catch((err) => {
            clearTimeout(id);
            reject(err);
        });
    });
}
// ---------- Embeddings ----------
const hfEmbedding = async (text) => {
    const key = text.trim().toLowerCase();
    const cached = cacheGet(key);
    if (cached)
        return cached;
    const maxRetries = 5;
    const timeoutMs = 60000; // 60 seconds (ingestion needs this)
    let lastErr;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            console.log(`🔎 HF embedding attempt ${attempt}/${maxRetries}`);
            const embeddingPromise = exports.hf.featureExtraction({
                model: exports.EMBEDDING_MODEL,
                inputs: text,
            });
            const embedding = await withTimeout(embeddingPromise, timeoutMs, "HF_EMBEDDING_TIMEOUT");
            // HF can return number[] OR number[][] depending on model/pipeline.
            const vec = Array.isArray(embedding) && typeof embedding[0] === "number"
                ? embedding
                : Array.isArray(embedding) && Array.isArray(embedding[0])
                    ? embedding[0]
                    : null;
            if (!vec || !vec.every((v) => typeof v === "number")) {
                throw new Error("Invalid embedding format from Hugging Face");
            }
            cacheSet(key, vec);
            return vec;
        }
        catch (err) {
            lastErr = err;
            // backoff: 2s, 4s, 6s, 8s...
            const waitMs = attempt * 2000;
            console.warn(`⚠️ Embedding failed (attempt ${attempt}). Retrying in ${waitMs}ms...`);
            await new Promise((r) => setTimeout(r, waitMs));
        }
    }
    throw lastErr;
};
exports.hfEmbedding = hfEmbedding;
// ---------- Generation (Chat) ----------
const hfGenerate = async (prompt) => {
    const completionPromise = exports.hf.chatCompletion({
        model: exports.GENERATION_MODEL,
        messages: [
            {
                role: "system",
                content: "You are a helpful assistant for Codetribe learners. " +
                    "Answer clearly using the provided context. " +
                    "If the question requires human help, say it will be escalated.",
            },
            {
                role: "user",
                content: prompt,
            },
        ],
        max_tokens: MAX_TOKENS,
        temperature: TEMPERATURE,
    });
    const completion = await withTimeout(completionPromise, GENERATION_TIMEOUT_MS, "HF_GENERATION_TIMEOUT");
    return completion.choices?.[0]?.message?.content;
};
exports.hfGenerate = hfGenerate;
