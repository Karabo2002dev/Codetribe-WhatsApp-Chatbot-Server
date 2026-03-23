"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertVector = insertVector;
exports.similaritySearch = similaritySearch;
const db_1 = __importDefault(require("../config/db"));
const embeddings_1 = require("./embeddings");
async function insertVector(args) {
    const { content, source = "manual", docName = "unknown", chunkIndex = -1, } = args;
    const embedding = await (0, embeddings_1.createEmbedding)(content);
    if (embedding.length !== 768) {
        throw new Error(`Embedding dim mismatch: ${embedding.length}`);
    }
    const vectorString = `[${embedding.join(",")}]`;
    await db_1.default.query(`
    INSERT INTO knowledge_base (content, embedding, source, doc_name, chunk_index)
    VALUES ($1, $2::vector, $3, $4, $5)
    `, [content, vectorString, source, docName, chunkIndex]);
}
async function similaritySearch(query, limit = 5) {
    // Timing (helps you confirm if embedding or DB is slow)
    console.time("⏱️ createEmbedding(query)");
    const embedding = await (0, embeddings_1.createEmbedding)(query);
    console.timeEnd("⏱️ createEmbedding(query)");
    const vectorString = `[${embedding.join(",")}]`;
    console.time("⏱️ pgvector query");
    const res = await db_1.default.query(`
    SELECT
      content,
      source,
      doc_name as "docName",
      chunk_index as "chunkIndex",
      (embedding <-> $1::vector) as distance
    FROM knowledge_base
    ORDER BY embedding <-> $1::vector
    LIMIT $2
    `, [vectorString, limit]);
    console.timeEnd("⏱️ pgvector query");
    console.log("Top distances:", res.rows.map((r) => r.distance));
    return res.rows;
}
