import {
  INVALID_OUTPUT_PATTERN,
  LOW_VARIETY_PATTERN,
  NESTING_UNIT_PATTERN,
  PREMATURE_FINAL_ENDING_PATTERN
} from "./config";

export function countHaebyeongNestedQuestionUnits(output: string): number {
  const normalized = normalizeOutputText(output);
  const generatedCount = extractDeclaredNestingCount(normalized);
  if (generatedCount !== null) {
    return generatedCount;
  }

  const matches = normalized.match(NESTING_UNIT_PATTERN);
  return matches?.length ?? 0;
}

export function isValidHaebyeongNestedQuestionOutput(output: string, targetNestingCount: number): boolean {
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
  return repetitiveMatches.length <= Math.max(4, Math.floor(targetNestingCount * 0.22));
}

export function normalizeOutputText(output: string): string {
  return output
    .replace(/\s+/g, " ")
    .replace(/？/g, "?")
    .trim();
}

export function stripTrailingQuestionMark(value: string): string {
  return value.replace(/\?+$/g, "").trim();
}

export function ensureQuestionMark(value: string): string {
  return `${stripTrailingQuestionMark(value)}?`;
}

export function hasPrematureFinalEnding(value: string): boolean {
  const normalized = stripTrailingQuestionMark(value);
  const matches = normalized.match(PREMATURE_FINAL_ENDING_PATTERN) ?? [];
  return matches.length > 1;
}

export function stitchSerialQuestions(output: string): string {
  if (!/,/.test(output)) {
    return output;
  }

  return output.replace(/,\s*/g, " ");
}

export function rewritePrematureFinalEndings(output: string): string {
  const normalized = stripTrailingQuestionMark(output);
  const lastIndex = normalized.lastIndexOf("되겠습니까");
  if (lastIndex === -1) {
    return output;
  }

  const prefix = normalized.slice(0, lastIndex).replace(PREMATURE_FINAL_ENDING_PATTERN, "되는지");
  const suffix = normalized.slice(lastIndex);
  return `${prefix}${suffix}`;
}

function countDistinctEndings(output: string): number {
  const matches = output.match(NESTING_UNIT_PATTERN) ?? [];
  return new Set(matches).size;
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

function extractDeclaredNestingCount(output: string): number | null {
  const matched = output.match(/(\d+)중첩 의문문/);
  if (!matched?.[1]) {
    return null;
  }

  const parsed = Number(matched[1]);
  return Number.isFinite(parsed) ? parsed : null;
}
