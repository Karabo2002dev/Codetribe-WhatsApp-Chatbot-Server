import { hfGenerate } from "../config/huggingface";
import { similaritySearch } from "../vectorStore/pgVector";
import { buildRagPrompt } from "./prompt";

const MAX_DISTANCE = 0.82;
const MIN_CLOSE_MATCHES = 2;

export type RagResult = {
  answer: string | null;
  shouldEscalate: boolean;
  reason?: string;
  debug?: {
    bestDistance?: number;
    averageDistance?: number;
    retrievedCount?: number;
  };
};

export async function ragEngine(
  userMessage: string
): Promise<RagResult> {
  const normalizedMessage = userMessage?.toLowerCase().trim();

  if (!normalizedMessage) {
    return {
      answer: null,
      shouldEscalate: true,
      reason: "empty_message",
    };
  }

  const wantsHuman =
    normalizedMessage.includes("human") ||
    normalizedMessage.includes("agent") ||
    normalizedMessage.includes("facilitator");

  if (wantsHuman) {
    return {
      answer: null,
      shouldEscalate: true,
      reason: "user_requested_human",
    };
  }

  const retrieved = await similaritySearch(userMessage);

  if (!retrieved || retrieved.length === 0) {
    return {
      answer: null,
      shouldEscalate: true,
      reason: "no_context",
    };
  }

  const bestDistance = retrieved[0].distance;

  const averageDistance =
    retrieved.reduce((sum, r) => sum + r.distance, 0) /
    retrieved.length;

  const closeMatches = retrieved.filter(
    (r) => r.distance <= MAX_DISTANCE
  );

  if (
    bestDistance > MAX_DISTANCE ||
    closeMatches.length < MIN_CLOSE_MATCHES
  ) {
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

  const prompt = buildRagPrompt(retrieved, userMessage);
  const rawAnswer = await hfGenerate(prompt);

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

  const modelLowConfidence =
    normalizedAnswer.includes("i don't know") ||
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
