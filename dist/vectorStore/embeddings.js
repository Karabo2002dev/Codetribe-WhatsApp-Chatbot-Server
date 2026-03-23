"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createEmbedding = createEmbedding;
const huggingface_1 = require("../config/huggingface");
const embeddingCache = new Map();
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
async function withRetry(fn, retries = 3, delayMs = 500) {
    try {
        return await fn();
    }
    catch (err) {
        if (retries <= 0)
            throw err;
        await sleep(delayMs);
        return withRetry(fn, retries - 1, delayMs * 2);
    }
}
async function createEmbedding(text) {
    const key = text.trim().toLowerCase();
    if (embeddingCache.has(key)) {
        return embeddingCache.get(key);
    }
    const response = await withRetry(() => (0, huggingface_1.hfEmbedding)(key.slice(0, 1000)));
    if (!Array.isArray(response)) {
        throw new Error("Unexpected embedding format from HF: expected number[]");
    }
    if (!response.every((x) => typeof x === "number")) {
        throw new Error("HF embedding array contains non-number items");
    }
    embeddingCache.set(key, response);
    return response;
}
