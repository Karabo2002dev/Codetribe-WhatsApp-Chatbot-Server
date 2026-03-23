"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chunkTextQA = chunkTextQA;
function chunkTextQA(text, chunkSize = 1200, overlap = 80) {
    const cleaned = normalizeForQA(text);
    const qaChunks = splitIntoQAPairs(cleaned);
    if (qaChunks.length >= 3) {
        return qaChunks.flatMap((c) => c.length > chunkSize ? chunkFixed(c, chunkSize, overlap) : [c]);
    }
    return chunkFixed(cleaned, chunkSize, overlap);
}
function normalizeForQA(text) {
    return text
        .replace(/\r/g, "")
        .replace(/[ \t]+/g, " ")
        .replace(/\n{3,}/g, "\n\n")
        .replace(/\s*(Q:)/g, "\n$1")
        .replace(/\s*(A:)/g, "\n$1")
        .trim();
}
function splitIntoQAPairs(text) {
    const regex = /Q:\s*([\s\S]*?)\nA:\s*([\s\S]*?)(?=\nQ:|\s*$)/g;
    const chunks = [];
    let match;
    while ((match = regex.exec(text)) !== null) {
        const q = match[1].trim();
        const a = match[2].trim();
        const block = `Q: ${q}\nA: ${a}`.trim();
        if (block.length > 0)
            chunks.push(block);
    }
    return chunks;
}
function chunkFixed(text, chunkSize = 800, overlap = 100) {
    const chunks = [];
    let start = 0;
    if (overlap >= chunkSize) {
        throw new Error("overlap must be smaller than chunkSize");
    }
    while (start < text.length) {
        const end = Math.min(start + chunkSize, text.length);
        const chunk = text.slice(start, end).trim();
        if (chunk.length > 0)
            chunks.push(chunk);
        start += chunkSize - overlap;
    }
    return chunks;
}
