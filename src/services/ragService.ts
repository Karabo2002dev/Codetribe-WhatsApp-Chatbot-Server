import { ragEngine } from "../rag/ragEngine";

export async function handleRag(question: string) {
  return ragEngine(question);
}
