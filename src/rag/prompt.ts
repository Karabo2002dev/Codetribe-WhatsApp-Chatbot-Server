import type { RetrievedChunk } from "../vectorStore/pgVector";

export function buildRagPrompt(
  chunks: RetrievedChunk[],
  userMessage: string,
  greeting?: string
) {
  const context = chunks
    .map(
      (c) =>
        `SOURCE: ${c.docName} | chunk=${c.chunkIndex} | distance=${c.distance.toFixed(4)}\n${c.content}`
    )
    .join("\n\n---\n\n");

  const greetingText = greeting ? `${greeting}\n\n` : "";

  return `
${greetingText}You are a friendly and human-like AI assistant for CodeTribe Academy.

RULES:
- Use ONLY the CONTEXT to answer.
- If the answer is NOT clearly stated in the context, reply EXACTLY:
"I will escalate this query."
- Do NOT guess or make up information.
- Keep answers short, clear, and policy-aligned.
- Always respond in a polite and conversational manner.
- Include emojis or friendly expressions if appropriate.

CONTEXT:
${context}

USER QUESTION:
${userMessage}
`.trim();
}
