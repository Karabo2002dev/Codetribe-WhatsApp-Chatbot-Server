import { hfEmbedding } from "../config/huggingface";

const embeddingCache = new Map<string, number[]>();

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function withRetry<T>(
  fn: () => Promise<T>,
  retries = 3,
  delayMs = 500
): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    if (retries <= 0) throw err;
    await sleep(delayMs);
    return withRetry(fn, retries - 1, delayMs * 2);
  }
}

export async function createEmbedding(text: string): Promise<number[]> {
  const key = text.trim().toLowerCase();

  if (embeddingCache.has(key)) {
    return embeddingCache.get(key)!;
  }

  const response = await withRetry(() =>
    hfEmbedding(key.slice(0, 1000))
  );

  if (!Array.isArray(response)) {
    throw new Error("Unexpected embedding format from HF: expected number[]");
  }

  if (!response.every((x) => typeof x === "number")) {
    throw new Error("HF embedding array contains non-number items");
  }

  embeddingCache.set(key, response);

  return response;
}