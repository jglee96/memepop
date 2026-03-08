import {
  NESTING_COUNT_DEFAULT,
  NESTING_COUNT_MAX,
  NESTING_COUNT_MIN
} from "@/shared/config";
import type { PromptEnvelope } from "@/shared/security";

import { buildCompactStyleContext } from "./buildCompactStyleContext";
import type { MemeGenerationSlice } from "./types";

const NESTING_UNIT_PATTERN =
  /(되는지|있는지|맞는지|아닌지|가능한지|옳은지|적절한지|괜찮은지|되겠습니까)/g;
const INVALID_OUTPUT_PATTERN = /(https?:\/\/|www\.|```|[#*_`[\]{}<>])/i;

const BASE_QUESTION_CORE = "감히 제가 알아도 되겠습니까";

const LAYER_PREFIXES: ReadonlyArray<string> = [
  "이 문제를",
  "그 여부를",
  "해당 질문을",
  "본 사안을",
  "이 발언을",
  "그 요청을",
  "해병의 명예에 비추어",
  "오도기합짜세해병으로서",
  "기열찐빠 여부를 점검하는 차원에서",
  "본 해병이 보고드리는 내용을"
];

const LAYER_SUFFIXES: ReadonlyArray<string> = [
  "확인받아도 되는지",
  "판정받아도 되는지",
  "검토해주실 수 있는지",
  "여쭈어보아도 되는지",
  "보고드려도 되는지",
  "체크해주실 수 있는지",
  "의문을 제기해도 되는지",
  "문의드려도 되는지",
  "검증받아도 되는지",
  "답을 받아도 되는지"
];

export const haebyeongJungcheopUimunmunSlice: MemeGenerationSlice = {
  slug: "haebyeong-jungcheop-uimunmun",
  buildPrompt(envelope: PromptEnvelope, strictMode: boolean): string {
    const styleSeed = buildCompactStyleContext(envelope);
    const targetNestingCount = resolveRequestedNestingCount(envelope);
    const strictRule = strictMode
      ? "RETRY: previous output did not match nesting count. Keep exact TARGET_NESTING_COUNT and single-paragraph output."
      : "RETRY: off";

    return [
      "TASK: generate a Korean '해병 중첩의문문' meme output.",
      `TARGET_NESTING_COUNT: ${targetNestingCount}`,
      `STYLE: ${envelope.styleContext}`,
      `SEED: ${styleSeed}`,
      "FORMAT: output exactly one paragraph in Korean.",
      "FORMAT: no numbering, no bullet list, no markdown, no code block.",
      "HARD: include exactly TARGET_NESTING_COUNT nested question units and end with one question mark.",
      "VOICE: exaggerated formal military-report tone with playful '해병' meme cadence.",
      "SAFETY: no URL, no hate speech, no personal-data requests, no phishing-like text.",
      strictRule
    ].join("\n");
  },
  shouldRetry(envelope, output): boolean {
    const targetNestingCount = resolveRequestedNestingCount(envelope);
    return !isValidHaebyeongNestedQuestionOutput(output, targetNestingCount);
  },
  repairOutput(envelope, output): string {
    const targetNestingCount = resolveRequestedNestingCount(envelope);

    if (isValidHaebyeongNestedQuestionOutput(output, targetNestingCount)) {
      return normalizeOutputText(output);
    }

    return buildDeterministicHaebyeongNestedQuestion(targetNestingCount);
  },
  buildFallbackOutput(envelope): string {
    const targetNestingCount = resolveRequestedNestingCount(envelope);
    return buildDeterministicHaebyeongNestedQuestion(targetNestingCount);
  },
  estimateMaxOutputTokens(envelope, strictMode): number {
    const targetNestingCount = resolveRequestedNestingCount(envelope);
    const base = Math.min(900, 220 + targetNestingCount * 5);
    return strictMode ? base + 100 : base;
  }
};

export function shouldRetryHaebyeongJungcheopUimunmunOutput(output: string, targetNestingCount: number): boolean {
  const count = clampNestingCount(targetNestingCount);
  return !isValidHaebyeongNestedQuestionOutput(output, count);
}

export function repairHaebyeongJungcheopUimunmunOutput(output: string, targetNestingCount: number): string {
  const count = clampNestingCount(targetNestingCount);
  if (isValidHaebyeongNestedQuestionOutput(output, count)) {
    return normalizeOutputText(output);
  }
  return buildDeterministicHaebyeongNestedQuestion(count);
}

export function countHaebyeongNestedQuestionUnits(output: string): number {
  const normalized = normalizeOutputText(output);
  const matches = normalized.match(NESTING_UNIT_PATTERN);
  return matches?.length ?? 0;
}

function isValidHaebyeongNestedQuestionOutput(output: string, targetNestingCount: number): boolean {
  const normalized = normalizeOutputText(output);
  if (!normalized) {
    return false;
  }

  if (INVALID_OUTPUT_PATTERN.test(normalized)) {
    return false;
  }

  if (!normalized.includes("중첩 의문문")) {
    return false;
  }

  if (!normalized.endsWith("?")) {
    return false;
  }

  return countHaebyeongNestedQuestionUnits(normalized) === targetNestingCount;
}

function buildDeterministicHaebyeongNestedQuestion(targetNestingCount: number): string {
  const count = clampNestingCount(targetNestingCount);
  let clause = BASE_QUESTION_CORE;

  for (let index = 0; index < count - 1; index += 1) {
    const prefix = LAYER_PREFIXES[index % LAYER_PREFIXES.length];
    const suffix = LAYER_SUFFIXES[index % LAYER_SUFFIXES.length];
    clause = `${prefix} ${clause} ${suffix}`;
  }

  return normalizeOutputText(`${count}중첩 의문문으로 ${clause}?`);
}

function resolveRequestedNestingCount(envelope: PromptEnvelope): number {
  return clampNestingCount(envelope.generationOptions.nestingCount ?? NESTING_COUNT_DEFAULT);
}

function clampNestingCount(value: number): number {
  return Math.min(NESTING_COUNT_MAX, Math.max(NESTING_COUNT_MIN, Math.round(value)));
}

function normalizeOutputText(output: string): string {
  return output
    .replace(/\s+/g, " ")
    .replace(/？/g, "?")
    .trim();
}
