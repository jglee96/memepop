import type { PromptEnvelope } from "@/shared/security/promptPolicy";
import { buildCompactStyleContext } from "@/shared/prompts/compactContext";

interface EotteokharagoPromptOptions {
  strict?: boolean;
}

const JAMO_REGEX = /[ㄱ-ㅎㅏ-ㅣ]/;
const OBJECT_WORD_REGEX = /(로켓|냉장고|헬리콥터|우주선|전기밥솥|계산기|샌드위치|치킨무|택배상자|선풍기)/;

export function buildEotteokharagoPrompt(
  envelope: PromptEnvelope,
  options: EotteokharagoPromptOptions = {}
): string {
  const styleSeed = buildCompactStyleContext(envelope);
  const normalizedInput = normalize(envelope.userInput);
  const hotspot = deriveHotspot(envelope.userInput);
  const firstTwo = normalizedInput.slice(0, 2);
  const syllableCount = Array.from(normalizedInput).length;

  const lengthRule =
    syllableCount <= 3
      ? "LEN: 24-44 items."
      : syllableCount <= 5
        ? "LEN: 22-34 items."
        : "LEN: 24-36 items.";

  const diversityRule =
    syllableCount <= 3
      ? [
          "DIVERSITY(short): rotate first syllable in >=12 items.",
          "DIVERSITY(short): sound-stretch allowed (e.g., 꼬오시다) if pronunciation remains close.",
          "DIVERSITY(short): no isolated jamo (ㅂ/ㅍ etc)."
        ].join(" ")
      : [
          "DIVERSITY(long): mutate first 1-2 syllables in >=12 items.",
          "DIVERSITY(long): include >=4 items where beginning chunk is expanded by +1 syllable.",
          `DIVERSITY(long): do not keep "${firstTwo}" fixed; vary leading sound.`,
          "DIVERSITY(long): suffix-only edits <=30%."
        ].join(" ");

  const strictRule = options.strict
    ? "RETRY: output was monotone; increase beginning/middle diversity while staying phonetically close."
    : "RETRY: off";

  return [
    "TASK: generate eotteokharago-style Korean phonetic variants.",
    `INPUT: ${envelope.userInput}`,
    `STYLE: ${envelope.styleContext}`,
    `SEED: ${styleSeed}`,
    "FORMAT: exactly one line, comma+space separated variants.",
    lengthRule,
    "HARD: first item=INPUT; no duplicates; Hangul syllable blocks only; no URL/markdown/labels.",
    "PRIORITY: phonetic similarity > humor.",
    "HUMOR: only playful mishearing that still sounds close.",
    "BAN: do not replace core stem with unrelated object nouns.",
    `HOTSPOT: ${hotspot}`,
    diversityRule,
    strictRule
  ].join("\n");
}

export function shouldRetryEotteokharagoOutput(userInput: string, output: string): boolean {
  const variants = output
    .split(",")
    .map((item) => normalize(item))
    .filter(Boolean);

  const minCount = minimumVariantCount(userInput);
  if (variants.length < minCount) {
    return true;
  }

  const uniqueCount = new Set(variants).size;
  if (uniqueCount < variants.length - 1) {
    return true;
  }

  const normalizedInput = normalize(userInput);
  const inputLength = Array.from(normalizedInput).length;
  const nonFirst = variants.slice(1);
  if (nonFirst.length === 0) {
    return true;
  }

  let closeCount = 0;
  let farCount = 0;
  let endingOnlyCount = 0;
  let objectLikeCount = 0;
  let brokenHangulCount = 0;

  const basePrefix2 = normalizedInput.slice(0, 2);
  const prefix2Set = new Set<string>();
  const firstSyllableSet = new Set<string>();
  let expandedPrefixMutationCount = 0;

  const cut = Math.max(1, normalizedInput.length - 2);

  for (const variant of nonFirst) {
    if (JAMO_REGEX.test(variant) || !/^[가-힣]+$/.test(variant)) {
      brokenHangulCount += 1;
    }

    const similarity = phoneticSimilarity(normalizedInput, variant);
    if (similarity >= 0.36) {
      closeCount += 1;
    }

    if (similarity < 0.18) {
      farCount += 1;
    }

    if (variant.slice(0, cut) === normalizedInput.slice(0, cut)) {
      endingOnlyCount += 1;
    }

    if (OBJECT_WORD_REGEX.test(variant) && similarity < 0.33) {
      objectLikeCount += 1;
    }

    if (variant.length >= 2) {
      prefix2Set.add(variant.slice(0, 2));
    }

    if (variant.length >= 1) {
      firstSyllableSet.add(variant.slice(0, 1));
    }

    if (variant.length > normalizedInput.length && variant.slice(0, 2) !== basePrefix2) {
      expandedPrefixMutationCount += 1;
    }
  }

  const closeRatio = closeCount / nonFirst.length;
  const endingOnlyRatio = endingOnlyCount / nonFirst.length;

  if (brokenHangulCount > 0) {
    return true;
  }

  if (closeRatio < 0.68 || farCount > Math.max(3, Math.floor(nonFirst.length * 0.25))) {
    return true;
  }

  if (objectLikeCount > 1) {
    return true;
  }

  if (inputLength <= 3) {
    return firstSyllableSet.size < 7;
  }

  const prefixChangedCount = nonFirst.filter((variant) => variant.slice(0, 2) !== basePrefix2).length;
  const prefixChangedRatio = prefixChangedCount / nonFirst.length;

  const prefixSetThreshold = inputLength >= 6 ? 6 : 5;
  const prefixChangedThreshold = inputLength >= 6 ? 0.5 : 0.45;
  const endingOnlyThreshold = inputLength >= 6 ? 0.38 : 0.42;

  if (prefix2Set.size < prefixSetThreshold || prefixChangedRatio < prefixChangedThreshold) {
    return true;
  }

  if (inputLength >= 6) {
    if (expandedPrefixMutationCount < 2 && prefixChangedRatio < 0.6) {
      return true;
    }
  } else if (expandedPrefixMutationCount < 1 && prefixChangedRatio < 0.55) {
    return true;
  }

  if (endingOnlyRatio > endingOnlyThreshold) {
    return true;
  }

  return false;
}

function deriveHotspot(input: string): string {
  const normalized = normalize(input);
  if (!normalized) {
    return "";
  }

  const chars = Array.from(normalized);
  const hotspotLength = Math.min(3, Math.max(2, chars.length - 2));
  return chars.slice(0, hotspotLength).join("");
}

function minimumVariantCount(input: string): number {
  const length = Array.from(normalize(input)).length;
  if (length <= 3) {
    return 18;
  }
  if (length <= 5) {
    return 20;
  }
  return 22;
}

function phoneticSimilarity(base: string, candidate: string): number {
  const maxLength = Math.max(base.length, candidate.length);
  if (maxLength === 0) {
    return 1;
  }

  const distance = levenshteinDistance(base, candidate);
  return 1 - distance / maxLength;
}

function levenshteinDistance(a: string, b: string): number {
  const rows = a.length + 1;
  const cols = b.length + 1;
  const table: number[][] = Array.from({ length: rows }, () => Array(cols).fill(0));

  for (let i = 0; i < rows; i += 1) {
    table[i][0] = i;
  }

  for (let j = 0; j < cols; j += 1) {
    table[0][j] = j;
  }

  for (let i = 1; i < rows; i += 1) {
    for (let j = 1; j < cols; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      table[i][j] = Math.min(table[i - 1][j] + 1, table[i][j - 1] + 1, table[i - 1][j - 1] + cost);
    }
  }

  return table[a.length][b.length];
}

function normalize(value: string): string {
  return value.replace(/\s+/g, "").trim();
}
