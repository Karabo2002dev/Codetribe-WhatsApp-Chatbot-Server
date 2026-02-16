import { InferenceClient } from "@huggingface/inference";

if (!process.env.HF_API_KEY) {
  throw new Error("HF_API_KEY not set");
}

export const hf = new InferenceClient(process.env.HF_API_KEY);

// Models
export const EMBEDDING_MODEL = "BAAI/bge-base-en-v1.5";
export const GENERATION_MODEL = "mistralai/Mistral-7B-Instruct-v0.2:featherless-ai";

// ---------- Embeddings ----------
export const hfEmbedding = async (text: string): Promise<number[]> => {
  const embedding = await hf.featureExtraction({
    model: EMBEDDING_MODEL,
    inputs: text,
  });

  if (!Array.isArray(embedding) || !embedding.every(v => typeof v === "number")) {
    throw new Error("Invalid embedding format from Hugging Face");
  }

  return embedding;
};

// ---------- Generation (Chat) ----------
export const hfGenerate = async (prompt: string): Promise<string | undefined> => {
  const completion = await hf.chatCompletion({
    model: GENERATION_MODEL,
    messages: [
      {
        role: "system",
        content:
          "You are a helpful assistant for Codetribe learners. " +
          "Answer clearly using the provided context. " +
          "If the question requires human help, say it will be escalated.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    max_tokens: 300,
    temperature: 0.2,
  });

  return completion.choices[0].message.content;
};
