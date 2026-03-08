import {
  NESTING_COUNT_DEFAULT,
  NESTING_COUNT_MAX,
  NESTING_COUNT_MIN
} from "@/shared/config";
import type { PromptEnvelope } from "@/shared/security";

import { buildCompactStyleContext } from "./buildCompactStyleContext";
import type { MemeGenerationSlice } from "./types";

const NESTING_UNIT_PATTERN =
  /(행동인지|것인지|무엇인지|공정한지|않는지|않은지|될지|되는지|있는지|맞는지|아닌지|가능한지|옳은지|적절한지|괜찮은지|되겠습니까)/g;
const INVALID_OUTPUT_PATTERN = /(https?:\/\/|www\.|```|[#*_`[\]{}<>])/i;
const LOW_VARIETY_PATTERN = /(보고드려도 되는지|문의드려도 되는지|검증받아도 되는지|확인받아도 되는지)/g;
const PREMATURE_FINAL_ENDING_PATTERN = /되겠습니까/g;

type LayerPattern = (inner: string) => string;

const CORE_PATTERNS: ReadonlyArray<(count: number) => string> = [
  (count) => `${count}중첩 의문문을 여쭤보는 것에 대한 허락을 구하는 것이 오도기합짜세해병으로써 타의 모범이 될만한 행동인지`,
  (count) => `${count}중첩 의문문을 사용하는 것에 대한 허락을 구해도 되는지`,
  (count) => `${count}중첩 의문문에 대한 질문이 있음을 보고하는 것이 적절한지`,
  (count) => `${count}중첩 의문문을 묻는 것이 옳은 일인지`,
  (count) => `${count}중첩 의문문을 알고 싶은 점이 있음을 알려도 되는 것인지`,
  (count) => `${count}중첩 의문문을 발설해도 될지에 대한 의문이 있는지`,
  (count) => `${count}중첩 의문문을 확인받고자 하는 점이 해병 예법에 맞는지`,
  (count) => `${count}중첩 의문문을 보고드리는 것이 기열찐빠황룡같지는 않은지`
];

const NON_FINAL_WRAPPERS: ReadonlyArray<LayerPattern> = [
  (inner) => `${inner}를 확인받을 수 있는지`,
  (inner) => `${inner}에 대하여 의문이 존재함을 표현해도 되는지`,
  (inner) => `${inner}에 관한 문제를 제기하는 것이 기열찐빠황룡같지는 않은지`,
  (inner) => `${inner}를 체크해주시는 것이 가능한지`,
  (inner) => `${inner}를 알고 싶은 점이 있음을 알려도 되는 것인지`,
  (inner) => `${inner}를 묻는 것이 옳은 일인지`,
  (inner) => `${inner}를 판단해주실 수 있는지`,
  (inner) => `${inner}에 대한 답변을 감히 요구하는 것을 드러내도 되는지`,
  (inner) => `${inner}를 가르쳐주실 수 있는지의 여부에 대해 의문을 가져도 되는지`,
  (inner) => `${inner}에 대한 답을 요청하는 것을 알렸을때 이상이 없는지`,
  (inner) => `${inner}에 대해 인지할 자격이 본 해병에게 있는지`,
  (inner) => `${inner}를 정확히 이야기해주십사 감찰해주실 수 있는지`,
  (inner) => `${inner}를 시인해주실 수 있는지`,
  (inner) => `${inner}를 말씀해주실 수 있는지`,
  (inner) => `${inner}에 대해 질문 했을 경우 본 해병이 해병수육이 되지는 않는지`,
  (inner) => `${inner}에 대해 판정을 해 주실 수 있는지`,
  (inner) => `${inner}에 대한 요청을 하는 것을 받아들이실 수 있는지`,
  (inner) => `${inner}를 감사(監査)해주실 수 있는지`,
  (inner) => `${inner}를 묻는것이 기열찐빠같은 요청에 해당하지 않는지`,
  (inner) => `${inner}에 대한 답이 본 해병에게 중요한 것임을 말씀드려도 되는지`,
  (inner) => `${inner}에 대해 발언하는 것이 무례하지는 않은지`,
  (inner) => `${inner}를 궁금해해도 되는 것인지`,
  (inner) => `${inner}에 대하여 명쾌한 해답을 해 주실 수 있는지`,
  (inner) => `${inner}를 바라도 되는지`,
  (inner) => `${inner}를 알기 위해 중첩의문문을 계속해도 되는지`,
  (inner) => `${inner}에 대해 거북하게 느끼시지는 않는지`,
  (inner) => `${inner}를 본 해병이 인지하게 해 주실 수 있는지`,
  (inner) => `${inner}를 알려주시는 것이 괜찮은지`,
  (inner) => `${inner}에 대해 심판해주실 수 있는지`,
  (inner) => `${inner}를 감히 제가 알게 되었다고 가정했을 때 해병대 내부에 이변이 생기지는 않는지`,
  (inner) => `${inner}가 공정한지`,
  (inner) => `${inner}를 심의해주실 수 있는지`,
  (inner) => `${inner}에 대해 아뢰어도 되는지`,
  (inner) => `${inner}에 대한 의문을 던지는 것이 해병의 명예를 실추시키는 것은 아닌지`,
  (inner) => `${inner}에 대한 정답이 무엇인지`,
  (inner) => `${inner}에 대한 질문의 적절성을 검사받을 수 있는지`,
  (inner) => `${inner}에 대한 설문을 하여도 괜찮은지`,
  (inner) => `${inner}를 검정(檢定)해주실 수 있는지`,
  (inner) => `${inner}를 결정해주실 수 있는지`,
  (inner) => `${inner}에 대해 본 해병이 감지해도 되는지`,
  (inner) => `${inner}의 여부를 지각(知覺)해도 되는지`,
  (inner) => `${inner}를 판단을 받을 수 있는지`,
  (inner) => `${inner}를 발설하는 태도가 해병 예법에 맞는지`,
  (inner) => `${inner}를 상부에 전달하는 절차를 개시하는 것이 가능한지`,
  (inner) => `${inner}를 확인받고자 졸라보는 시도가 오도기합짜세에 옳은지`,
  (inner) => `${inner}를 두고 판정을 청하는 문장을 늘여놓는 것이 적절한지`,
  (inner) => `${inner}를 여쭈어보려는 마음을 숨기지 않아도 괜찮은지`,
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

const FINAL_WRAPPERS: ReadonlyArray<LayerPattern> = [
  (inner) => `${inner}를 감히 제가 알아도 되겠습니까`,
  (inner) => `${inner}를 본 해병이 끝내 알아도 되겠습니까`,
  (inner) => `${inner}를 최종적으로 여쭈어도 되겠습니까`,
  (inner) => `${inner}를 마지막으로 확인해도 되겠습니까`
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
      "EXAMPLE_UNIT: '...에 대한 질문의 적절성을 검사받을 수 있는지', '...를 감찰해주실 수 있는지', '...의 여부를 지각(知覺)해도 되는지'.",
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
    return buildExampleDrivenHaebyeongNestedQuestion(targetNestingCount);
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
  const generatedCount = extractDeclaredNestingCount(normalized);
  if (generatedCount !== null) {
    return generatedCount;
  }

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
    return buildExampleDrivenHaebyeongNestedQuestion(targetNestingCount);
  }

  if (INVALID_OUTPUT_PATTERN.test(normalized)) {
    return buildExampleDrivenHaebyeongNestedQuestion(targetNestingCount);
  }

  const stitchedOutput = stitchSerialQuestions(normalized);
  const chainedOutput = rewritePrematureFinalEndings(stitchedOutput);
  const ensuredQuestion = ensureQuestionMark(chainedOutput);
  const countedUnits = countHaebyeongNestedQuestionUnits(ensuredQuestion);

  if (countedUnits === targetNestingCount && !hasPrematureFinalEnding(ensuredQuestion) && !/,/.test(ensuredQuestion)) {
    return ensuredQuestion;
  }

  return buildExampleDrivenHaebyeongNestedQuestion(targetNestingCount);
}

function resolveRequestedNestingCount(envelope: PromptEnvelope): number {
  return clampNestingCount(envelope.generationOptions.nestingCount ?? NESTING_COUNT_DEFAULT);
}

function clampNestingCount(value: number): number {
  return Math.min(NESTING_COUNT_MAX, Math.max(NESTING_COUNT_MIN, Math.round(value)));
}

function resolveLayerPattern(index: number): LayerPattern {
  const shuffledIndex = (index * 11 + Math.floor(index / 2) + 5) % NON_FINAL_WRAPPERS.length;
  return NON_FINAL_WRAPPERS[shuffledIndex] ?? NON_FINAL_WRAPPERS[0];
}

function minimumDistinctEndings(targetNestingCount: number): number {
  if (targetNestingCount <= 8) {
    return 2;
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

function extractDeclaredNestingCount(output: string): number | null {
  const matched = output.match(/(\d+)중첩 의문문/);
  if (!matched?.[1]) {
    return null;
  }

  const parsed = Number(matched[1]);
  return Number.isFinite(parsed) ? parsed : null;
}

function stitchSerialQuestions(output: string): string {
  if (!/,/.test(output)) {
    return output;
  }

  return output.replace(/,\s*/g, " ");
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

function buildExampleDrivenHaebyeongNestedQuestion(targetNestingCount: number): string {
  const count = clampNestingCount(targetNestingCount);
  if (count === 1) {
    return normalizeOutputText(`${selectFinalWrapper(count)(`${count}중첩 의문문`)}?`);
  }

  let clause = selectCorePattern(count)(count);

  for (let index = 0; index < count - 2; index += 1) {
    clause = resolveLayerPattern(index)(clause);
  }

  clause = selectFinalWrapper(count)(clause);
  return normalizeOutputText(`${clause}?`);
}

function selectCorePattern(seed: number): (count: number) => string {
  const index = (seed * 5 + 3) % CORE_PATTERNS.length;
  return CORE_PATTERNS[index] ?? CORE_PATTERNS[0];
}

function selectFinalWrapper(seed: number): LayerPattern {
  const index = (seed * 3 + 1) % FINAL_WRAPPERS.length;
  return FINAL_WRAPPERS[index] ?? FINAL_WRAPPERS[0];
}
