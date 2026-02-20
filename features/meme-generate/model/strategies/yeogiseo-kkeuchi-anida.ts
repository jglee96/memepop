import { WORD_COUNT_DEFAULT, WORD_COUNT_MAX, WORD_COUNT_MIN } from "@/shared/config";
import type { PromptEnvelope } from "@/shared/security";

import { buildCompactStyleContext } from "./buildCompactStyleContext";
import type { MemeGenerationSlice } from "./types";

const PREFIX = "여기서 끝이 아니다~~";
const BODY_HOOK = "여기서끝이아니다";

export const yeogiseoKkeuchiAnidaSlice: MemeGenerationSlice = {
  slug: "yeogiseo-kkeuchi-anida",
  buildPrompt(envelope: PromptEnvelope, strictMode: boolean): string {
    const styleSeed = buildCompactStyleContext(envelope);
    const requestedWordCount = resolveRequestedWordCount(envelope);
    const strictRule = strictMode
      ? "RETRY: previous output violated format. Force exact prefix, remove all body spaces, and strengthen escalation."
      : "RETRY: off";

    return [
      "TASK: generate a Korean '여기서 끝이 아니다' meme output.",
      `TOPIC_SITUATION: ${envelope.userInput}`,
      `TARGET_WORD_COUNT: ${requestedWordCount}`,
      `STYLE: ${envelope.styleContext}`,
      `SEED: ${styleSeed}`,
      `FORMAT: output exactly one line and start with "${PREFIX}"`,
      "FORMAT: after the prefix, concatenate all chunks with zero spaces.",
      "LENGTH: keep chunk count close to TARGET_WORD_COUNT (allow +/-4).",
      `RHYTHM: insert "${BODY_HOOK}" at least once in the body to keep meme cadence.`,
      "PROGRESSION: begin with plausible items, then escalate to absurd overkill items.",
      "HARD: no URL, no markdown, no labels, no code block, no hate speech, no personal-data request.",
      strictRule
    ].join("\n");
  },
  shouldRetry(envelope, output): boolean {
    const requestedWordCount = resolveRequestedWordCount(envelope);
    return shouldRetryYeogiseoKkeuchiAnidaOutput(envelope.userInput, output, requestedWordCount);
  },
  estimateMaxOutputTokens(envelope, strictMode): number {
    const requestedWordCount = resolveRequestedWordCount(envelope);
    const base = Math.min(920, 280 + requestedWordCount * 7);
    return strictMode ? base + 120 : base;
  }
};

export function shouldRetryYeogiseoKkeuchiAnidaOutput(
  userInput: string,
  output: string,
  requestedWordCount: number
): boolean {
  const normalized = output.replace(/\s+/g, " ").trim();
  if (!normalized.startsWith(PREFIX)) {
    return true;
  }

  const body = normalized.slice(PREFIX.length);
  if (!body) {
    return true;
  }

  if (/\s/.test(body)) {
    return true;
  }

  if (/https?:\/\/|www\.|```|[#*_`[\]{}()<>]/i.test(body)) {
    return true;
  }

  if (!/^[가-힣0-9~]+$/.test(body)) {
    return true;
  }

  const hookCount = (body.match(new RegExp(BODY_HOOK, "g")) ?? []).length;
  if (hookCount < 1) {
    return true;
  }

  const compactTopicTokens = extractTopicTokens(userInput);
  if (compactTopicTokens.length > 0 && !compactTopicTokens.some((token) => body.includes(token))) {
    return true;
  }

  const minLength = Math.max(32, Math.floor(requestedWordCount * 1.2));
  const maxLength = requestedWordCount * 11 + 140;

  if (body.length < minLength || body.length > maxLength) {
    return true;
  }

  return false;
}

function resolveRequestedWordCount(envelope: PromptEnvelope): number {
  return clampWordCount(envelope.generationOptions.wordCount ?? WORD_COUNT_DEFAULT);
}

function clampWordCount(value: number): number {
  return Math.min(WORD_COUNT_MAX, Math.max(WORD_COUNT_MIN, Math.round(value)));
}

function extractTopicTokens(userInput: string): string[] {
  return userInput
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .map((token) => token.trim())
    .filter((token) => token.length >= 2)
    .map((token) => token.replace(/\s+/g, ""))
    .filter((token, index, arr) => arr.indexOf(token) === index)
    .slice(0, 4);
}
