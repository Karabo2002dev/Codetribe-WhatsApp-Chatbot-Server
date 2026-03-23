"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ragEngine = ragEngine;
const huggingface_1 = require("../config/huggingface");
const pgVector_1 = require("../vectorStore/pgVector");
const prompt_1 = require("./prompt");
const MAX_DISTANCE = 0.82;
const MIN_CLOSE_MATCHES = 2;
async function ragEngine(userMessage) {
    const normalizedMessage = userMessage?.toLowerCase().trim();
    if (!normalizedMessage) {
        return {
            answer: null,
            shouldEscalate: true,
            reason: "empty_message",
        };
    }
    const wantsHuman = normalizedMessage.includes("human") ||
        normalizedMessage.includes("agent") ||
        normalizedMessage.includes("facilitator");
    if (wantsHuman) {
        return {
            answer: null,
            shouldEscalate: true,
            reason: "user_requested_human",
        };
    }
    const retrieved = await (0, pgVector_1.similaritySearch)(userMessage);
    if (!retrieved || retrieved.length === 0) {
        return {
            answer: null,
            shouldEscalate: true,
            reason: "no_context",
        };
    }
    const bestDistance = retrieved[0].distance;
    const averageDistance = retrieved.reduce((sum, r) => sum + r.distance, 0) /
        retrieved.length;
    const closeMatches = retrieved.filter((r) => r.distance <= MAX_DISTANCE);
    if (bestDistance > MAX_DISTANCE ||
        closeMatches.length < MIN_CLOSE_MATCHES) {
        return {
            answer: null,
            shouldEscalate: true,
            reason: "low_similarity",
            debug: {
                bestDistance,
                averageDistance,
                retrievedCount: retrieved.length,
            },
        };
    }
    const prompt = (0, prompt_1.buildRagPrompt)(retrieved, userMessage);
    const rawAnswer = await (0, huggingface_1.hfGenerate)(prompt);
    if (!rawAnswer || rawAnswer.trim().length < 5) {
        return {
            answer: null,
            shouldEscalate: true,
            reason: "empty_or_short_answer",
            debug: {
                bestDistance,
                averageDistance,
                retrievedCount: retrieved.length,
            },
        };
    }
    const normalizedAnswer = rawAnswer.toLowerCase();
    const modelLowConfidence = normalizedAnswer.includes("i don't know") ||
        normalizedAnswer.includes("not sure") ||
        normalizedAnswer.includes("cannot answer");
    if (modelLowConfidence) {
        return {
            answer: null,
            shouldEscalate: true,
            reason: "model_low_confidence",
            debug: {
                bestDistance,
                averageDistance,
                retrievedCount: retrieved.length,
            },
        };
    }
    return {
        answer: rawAnswer.trim(),
        shouldEscalate: false,
        debug: {
            bestDistance,
            averageDistance,
            retrievedCount: retrieved.length,
        },
    };
}
