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
const LOW_VARIETY_PATTERN = /(보고드려도 되는지|문의드려도 되는지|검증받아도 되는지|확인받아도 되는지)/g;
const PREMATURE_FINAL_ENDING_PATTERN = /되겠습니까/g;

const BASE_QUESTION_CORE = "감히 제가 알아도 되겠습니까";
type LayerPattern = (inner: string) => string;

const LAYER_PATTERNS: ReadonlyArray<LayerPattern> = [
  (inner) => `${inner}를 사용하는 것에 대한 허락을 구해도 되는지`,
  (inner) => `${inner}를 묻는 보고를 올리는 것이 적절한지`,
  (inner) => `${inner}를 발설하는 태도가 해병 예법에 맞는지`,
  (inner) => `${inner}를 문제 삼는 행위가 기열찐빠황룡은 아닌지`,
  (inner) => `${inner}를 감히 제기하는 본 해병에게 의문이 남아 있는지`,
  (inner) => `${inner}를 상부에 전달하는 절차를 개시하는 것이 가능한지`,
  (inner) => `${inner}를 확인받고자 졸라보는 시도가 오도기합짜세에 옳은지`,
  (inner) => `${inner}를 두고 판정을 청하는 문장을 늘여놓는 것이 적절한지`,
  (inner) => `${inner}를 여쭈어보려는 마음을 숨기지 않아도 괜찮은지`,
  (inner) => `${inner}를 본 해병이 알아도 되겠습니까`,
  (inner) => `${inner}를 보고문처럼 읊는 버릇이 해병수육행은 아닌지`,
  (inner) => `${inner}를 감찰 요청으로 둔갑시키는 술수가 아직 살아 있는지`,
  (inner) => `${inner}를 검열받는 장면을 상상하며 떠들어도 되는지`,
  (inner) => `${inner}를 승인 절차로 포장하는 잔머리를 굴려도 되는지`,
  (inner) => `${inner}를 의장대급 진지함으로 부풀리는 품행이 해병답다고 맞는지`,
  (inner) => `${inner}를 단도직입으로 못 묻고 세 바퀴 꼬아버리는 재주가 가능한지`,
  (inner) => `${inner}를 말하기 전 해병의 명예를 한 번 더 들먹이는 짓이 옳은지`,
  (inner) => `${inner}를 놓고 본 해병이 스스로 심의를 청하는 꼴이 적절한지`,
  (inner) => `${inner}를 아뢰는 과정에서 기합이 덜 찬 티가 나도 괜찮은지`,
  (inner) => `${inner}를 허락받기 위한 허락을 구하는 보고를 더 이어가도 되는지`,
  (inner) => `${inner}를 말문 막힌 채 되물어보는 습성이 여전히 남아 있는지`,
  (inner) => `${inner}를 끝내 못 참고 또다시 포장해 들이미는 행태가 맞는지`,
  (inner) => `${inner}를 두고 해병식 장광설을 더 얹는 작태가 결례는 아닌지`,
  (inner) => `${inner}를 지금 이 시점에 다시 캐묻는 패기가 아직도 가능한지`
];

export const haebyeongJungcheopUimunmunSlice: MemeGenerationSlice = {
  slug: "haebyeong-jungcheop-uimunmun",
  buildPrompt(envelope: PromptEnvelope, strictMode: boolean): string {
    const styleSeed = buildCompactStyleContext(envelope);
    const targetNestingCount = resolveRequestedNestingCount(envelope);
    const strictRule = strictMode
      ? "RETRY: previous output was repetitive or missed exact nesting count. Keep the creativity, vary the clause types, and hit TARGET_NESTING_COUNT exactly."
      : "RETRY: off";

    return [
      "TASK: generate a Korean '해병 중첩의문문' copypasta-style output.",
      `TARGET_NESTING_COUNT: ${targetNestingCount}`,
      `STYLE: ${envelope.styleContext}`,
      `SEED: ${styleSeed}`,
      "FORMAT: output exactly one paragraph in Korean.",
      "FORMAT: no numbering, no bullet list, no markdown, no code block.",
      "FORMAT: do not separate question units with commas. Every non-final unit must continue into the next unit as an unfinished nested clause.",
      "GRAMMAR: only the final unit may end with '되겠습니까?'. Every earlier unit must stay unfinished as forms like '되는지', '것인지', '있는지', '여부', '답변을 받고자 함'.",
      "HARD: include exactly TARGET_NESTING_COUNT nested question units and end with one question mark.",
      "VOICE: absurdly formal, overcommitted, dramatic '해병' meme cadence.",
      "QUALITY: each layer should feel like a different bureaucratic or dramatic maneuver, not the same verb repeated.",
      "QUALITY: rotate clause intent across approval, report, doubt, audit, honor, discipline, etiquette, and self-importance.",
      "BAN: avoid obvious loops such as repeating the same endings or the same 2-3 verbs over and over.",
      "BAN: do not output a serial list like 'A?, B?, C?'.",
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
    return minimallyRepairHaebyeongNestedQuestion(output, targetNestingCount);
  },
  buildFallbackOutput(envelope): string {
    const targetNestingCount = resolveRequestedNestingCount(envelope);
    return buildDeterministicHaebyeongNestedQuestion(targetNestingCount);
  },
  estimateMaxOutputTokens(envelope, strictMode): number {
    const targetNestingCount = resolveRequestedNestingCount(envelope);
    const base = Math.min(1500, 320 + targetNestingCount * 8);
    return strictMode ? base + 160 : base;
  }
};

export function shouldRetryHaebyeongJungcheopUimunmunOutput(output: string, targetNestingCount: number): boolean {
  const count = clampNestingCount(targetNestingCount);
  return !isValidHaebyeongNestedQuestionOutput(output, count);
}

export function repairHaebyeongJungcheopUimunmunOutput(output: string, targetNestingCount: number): string {
  const count = clampNestingCount(targetNestingCount);
  return minimallyRepairHaebyeongNestedQuestion(output, count);
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

  if (!normalized.endsWith("?")) {
    return false;
  }

  if (/,/.test(normalized)) {
    return false;
  }

  if (hasPrematureFinalEnding(normalized)) {
    return false;
  }

  const countedUnits = countHaebyeongNestedQuestionUnits(normalized);
  if (countedUnits !== targetNestingCount) {
    return false;
  }

  if (countDistinctEndings(normalized) < minimumDistinctEndings(targetNestingCount)) {
    return false;
  }

  const repetitiveMatches = normalized.match(LOW_VARIETY_PATTERN) ?? [];
  if (repetitiveMatches.length > Math.max(4, Math.floor(targetNestingCount * 0.22))) {
    return false;
  }

  return true;
}

function minimallyRepairHaebyeongNestedQuestion(output: string, targetNestingCount: number): string {
  const normalized = normalizeOutputText(output);
  if (!normalized) {
    return buildDeterministicHaebyeongNestedQuestion(targetNestingCount);
  }

  if (INVALID_OUTPUT_PATTERN.test(normalized)) {
    return buildDeterministicHaebyeongNestedQuestion(targetNestingCount);
  }

  const stitchedOutput = stitchSerialQuestions(normalized);
  const chainedOutput = rewritePrematureFinalEndings(stitchedOutput);
  const ensuredQuestion = ensureQuestionMark(chainedOutput);
  const countedUnits = countHaebyeongNestedQuestionUnits(ensuredQuestion);

  if (countedUnits === 0) {
    return buildDeterministicHaebyeongNestedQuestion(targetNestingCount);
  }

  if (countedUnits === targetNestingCount) {
    return ensuredQuestion;
  }

  if (countedUnits < targetNestingCount) {
    return addOuterLayers(ensuredQuestion, targetNestingCount - countedUnits);
  }

  return softenExtraLayers(ensuredQuestion, countedUnits - targetNestingCount, targetNestingCount);
}

function addOuterLayers(base: string, missingCount: number): string {
  let output = stripTrailingQuestionMark(base);

  for (let index = 0; index < missingCount; index += 1) {
    output = resolveLayerPattern(index)(output);
  }

  return ensureQuestionMark(normalizeOutputText(output));
}

function softenExtraLayers(base: string, overflowCount: number, targetNestingCount: number): string {
  let output = stripTrailingQuestionMark(base);
  let remaining = overflowCount;

  for (let index = SOFTEN_REPLACEMENTS.length - 1; index >= 0 && remaining > 0; index -= 1) {
    const { pattern, replacement } = SOFTEN_REPLACEMENTS[index];
    if (!pattern.test(output)) {
      continue;
    }

    output = output.replace(pattern, replacement);
    remaining -= 1;
  }

  if (remaining > 0) {
    return buildDeterministicHaebyeongNestedQuestion(targetNestingCount);
  }

  return ensureQuestionMark(normalizeOutputText(output));
}

function buildDeterministicHaebyeongNestedQuestion(targetNestingCount: number): string {
  const count = clampNestingCount(targetNestingCount);
  let clause = BASE_QUESTION_CORE;

  for (let index = 0; index < count - 1; index += 1) {
    const pattern = resolveLayerPattern(index);
    clause = pattern(clause);
  }

  return normalizeOutputText(`먼저 ${count}중첩 의문문 전문입니다. 악! ${clause}?`);
}

function resolveRequestedNestingCount(envelope: PromptEnvelope): number {
  return clampNestingCount(envelope.generationOptions.nestingCount ?? NESTING_COUNT_DEFAULT);
}

function clampNestingCount(value: number): number {
  return Math.min(NESTING_COUNT_MAX, Math.max(NESTING_COUNT_MIN, Math.round(value)));
}

function resolveLayerPattern(index: number): LayerPattern {
  const shuffledIndex = (index * 7 + Math.floor(index / 3) + 3) % LAYER_PATTERNS.length;
  return LAYER_PATTERNS[shuffledIndex] ?? LAYER_PATTERNS[0];
}

function minimumDistinctEndings(targetNestingCount: number): number {
  if (targetNestingCount <= 8) {
    return 3;
  }
  if (targetNestingCount <= 20) {
    return 4;
  }
  return 5;
}

function countDistinctEndings(output: string): number {
  const matches = output.match(NESTING_UNIT_PATTERN) ?? [];
  return new Set(matches).size;
}

function stripTrailingQuestionMark(value: string): string {
  return value.replace(/\?+$/g, "").trim();
}

function ensureQuestionMark(value: string): string {
  return `${stripTrailingQuestionMark(value)}?`;
}

function hasPrematureFinalEnding(value: string): boolean {
  const normalized = stripTrailingQuestionMark(value);
  const matches = normalized.match(PREMATURE_FINAL_ENDING_PATTERN) ?? [];
  return matches.length > 1;
}

function normalizeOutputText(output: string): string {
  return output
    .replace(/\s+/g, " ")
    .replace(/？/g, "?")
    .trim();
}

function stitchSerialQuestions(output: string): string {
  if (!/,/.test(output)) {
    return output;
  }

  const rawSegments = output
    .split(",")
    .map((segment) => segment.trim())
    .filter(Boolean);

  if (rawSegments.length <= 1) {
    return output.replace(/,\s*/g, " ");
  }

  const chainedSegments = rawSegments.map((segment, index) => {
    const cleaned = stripTrailingQuestionMark(segment);
    if (index === rawSegments.length - 1) {
      return cleaned;
    }

    return toNestedConnector(cleaned);
  });

  return chainedSegments.join(" ");
}

function rewritePrematureFinalEndings(output: string): string {
  const normalized = stripTrailingQuestionMark(output);
  const lastIndex = normalized.lastIndexOf("되겠습니까");
  if (lastIndex === -1) {
    return output;
  }

  const prefix = normalized.slice(0, lastIndex).replace(PREMATURE_FINAL_ENDING_PATTERN, "되는지");
  const suffix = normalized.slice(lastIndex);
  return `${prefix}${suffix}`;
}

function toNestedConnector(segment: string): string {
  for (const { from, to } of CONNECTOR_ENDINGS) {
    if (segment.endsWith(from)) {
      return `${segment.slice(0, -from.length)}${to}`;
    }
  }

  if (segment.endsWith("까")) {
    return `${segment}를`;
  }

  return `${segment}에 대한 의문이 있는지를`;
}

const SOFTEN_REPLACEMENTS: ReadonlyArray<{ pattern: RegExp; replacement: string }> = [
  { pattern: /되는지(?!.*되는지)/, replacement: "된다는 점을 아뢰는 바" },
  { pattern: /있는지(?!.*있는지)/, replacement: "있다는 판단을 덧붙이는 바" },
  { pattern: /맞는지(?!.*맞는지)/, replacement: "맞다는 취지임을 알리는 바" },
  { pattern: /아닌지(?!.*아닌지)/, replacement: "아니라는 우려를 적시하는 바" },
  { pattern: /가능한지(?!.*가능한지)/, replacement: "가능하다는 추측을 보태는 바" },
  { pattern: /옳은지(?!.*옳은지)/, replacement: "옳다는 명분을 끌어오는 바" },
  { pattern: /적절한지(?!.*적절한지)/, replacement: "적절하다는 투정을 얹는 바" },
  { pattern: /괜찮은지(?!.*괜찮은지)/, replacement: "괜찮다는 핑계를 세우는 바" },
  { pattern: /되겠습니까(?!.*되겠습니까)/, replacement: "됨을 허락받고 싶다는 바" }
];

const CONNECTOR_ENDINGS: ReadonlyArray<{ from: string; to: string }> = [
  { from: "되는지", to: "되는지를" },
  { from: "있는지", to: "있는지를" },
  { from: "맞는지", to: "맞는지를" },
  { from: "아닌지", to: "아닌지를" },
  { from: "가능한지", to: "가능한지를" },
  { from: "옳은지", to: "옳은지를" },
  { from: "적절한지", to: "적절한지를" },
  { from: "괜찮은지", to: "괜찮은지를" },
  { from: "되겠습니까", to: "되는지를" }
];
