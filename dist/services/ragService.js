"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleRag = handleRag;
const ragEngine_1 = require("../rag/ragEngine");
async function handleRag(question) {
    return (0, ragEngine_1.ragEngine)(question);
}
