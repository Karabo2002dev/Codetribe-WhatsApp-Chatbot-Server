import pool from "../config/db";
import { createEmbedding } from "./embeddings";

export type InsertVectorArgs = {
  content: string;
  source?: string;
  docName?: string;
  chunkIndex?: number;
};

export async function insertVector(args: InsertVectorArgs) {
  const {
    content,
    source = "manual",
    docName = "unknown",
    chunkIndex = -1,
  } = args;

  const embedding = await createEmbedding(content);

  if (embedding.length !== 768) {
    throw new Error(`Embedding dim mismatch: ${embedding.length}`);
  }

  const vectorString = `[${embedding.join(",")}]`;

  await pool.query(
    `
    INSERT INTO knowledge_base (content, embedding, source, doc_name, chunk_index)
    VALUES ($1, $2::vector, $3, $4, $5)
    `,
    [content, vectorString, source, docName, chunkIndex]
  );
}

export type RetrievedChunk = {
  content: string;
  source: string;
  docName: string;
  chunkIndex: number;
  distance: number;
};

export async function similaritySearch(
  query: string,
  limit = 5
): Promise<RetrievedChunk[]> {
  // Timing (helps you confirm if embedding or DB is slow)
  console.time("⏱️ createEmbedding(query)");
  const embedding = await createEmbedding(query);
  console.timeEnd("⏱️ createEmbedding(query)");

  const vectorString = `[${embedding.join(",")}]`;

  console.time("⏱️ pgvector query");
  const res = await pool.query(
    `
    SELECT
      content,
      source,
      doc_name as "docName",
      chunk_index as "chunkIndex",
      (embedding <-> $1::vector) as distance
    FROM knowledge_base
    ORDER BY embedding <-> $1::vector
    LIMIT $2
    `,
    [vectorString, limit]
  );
  console.timeEnd("⏱️ pgvector query");

  console.log(
    "Top distances:",
    res.rows.map((r) => r.distance)
  );

  return res.rows as RetrievedChunk[];
}