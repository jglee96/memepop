import { NESTING_COUNT_MAX, NESTING_COUNT_MIN } from "@/shared/config";

import { CORE_PATTERNS, FINAL_WRAPPERS, NON_FINAL_WRAPPERS, type LayerPattern } from "./config";
import {
  ensureQuestionMark,
  hasPrematureFinalEnding,
  isValidHaebyeongNestedQuestionOutput,
  normalizeOutputText,
  rewritePrematureFinalEndings,
  stitchSerialQuestions
} from "./text";

export function minimallyRepairHaebyeongNestedQuestion(output: string, targetNestingCount: number): string {
  const normalized = normalizeOutputText(output);
  if (!normalized) {
    return buildExampleDrivenHaebyeongNestedQuestion(targetNestingCount);
  }

  const stitchedOutput = stitchSerialQuestions(normalized);
  const chainedOutput = rewritePrematureFinalEndings(stitchedOutput);
  const ensuredQuestion = ensureQuestionMark(chainedOutput);

  if (isValidHaebyeongNestedQuestionOutput(ensuredQuestion, targetNestingCount) && !hasPrematureFinalEnding(ensuredQuestion)) {
    return ensuredQuestion;
  }

  return buildExampleDrivenHaebyeongNestedQuestion(targetNestingCount);
}

export function buildExampleDrivenHaebyeongNestedQuestion(targetNestingCount: number): string {
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

export function clampNestingCount(value: number): number {
  return Math.min(NESTING_COUNT_MAX, Math.max(NESTING_COUNT_MIN, Math.round(value)));
}

function resolveLayerPattern(index: number): LayerPattern {
  const shuffledIndex = (index * 11 + Math.floor(index / 2) + 5) % NON_FINAL_WRAPPERS.length;
  return NON_FINAL_WRAPPERS[shuffledIndex] ?? NON_FINAL_WRAPPERS[0];
}

function selectCorePattern(seed: number): (count: number) => string {
  const index = (seed * 5 + 3) % CORE_PATTERNS.length;
  return CORE_PATTERNS[index] ?? CORE_PATTERNS[0];
}

function selectFinalWrapper(seed: number): LayerPattern {
  const index = (seed * 3 + 1) % FINAL_WRAPPERS.length;
  return FINAL_WRAPPERS[index] ?? FINAL_WRAPPERS[0];
}
