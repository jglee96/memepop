import type { PromptEnvelope } from "@/shared/security/promptPolicy";

interface EotteokharagoPromptOptions {
  strict?: boolean;
}

const JAMO_REGEX = /[ㄱ-ㅎㅏ-ㅣ]/;
const OBJECT_WORD_REGEX = /(로켓|냉장고|헬리콥터|우주선|전기밥솥|계산기|샌드위치|치킨무|택배상자|선풍기)/;

export function buildEotteokharagoPrompt(
  envelope: PromptEnvelope,
  options: EotteokharagoPromptOptions = {}
): string {
  const styleExampleBlock = envelope.styleExamples.length > 0 ? envelope.styleExamples.join("\n- ") : "(none)";
  const normalizedInput = normalize(envelope.userInput);
  const hotspot = deriveHotspot(envelope.userInput);
  const firstTwo = normalizedInput.slice(0, 2);
  const syllableCount = Array.from(normalizedInput).length;

  const listLengthRule =
    syllableCount <= 3
      ? "List length: 24 to 44 items."
      : syllableCount <= 5
        ? "List length: 22 to 34 items."
        : "List length: 24 to 36 items.";

  const structureRule =
    syllableCount <= 3
      ? [
          "Short-word mode:",
          "- Make at least 12 variants by rotating the FIRST syllable (onset/vowel changes).",
          "- You may stretch sounds (e.g., 꼬오시다, 꼬오숩다 style).",
          "- If the original has final consonant feel, preserve it naturally in many variants.",
          "- All outputs must be complete Hangul syllable blocks only (no isolated jamo like ㅂ, ㅍ)."
        ].join("\n")
      : [
          "Long-word mode:",
          "- At least 10 variants must mutate the first two syllables.",
          "- At least 10 variants must mutate the middle stem.",
          "- Suffix-only edits must stay under 35% of the list.",
          `- Do not over-fix \"${firstTwo}\"; diversify the leading sound.`
        ].join("\n");

  const strictBlock = options.strict
    ? [
        "Retry mode: previous output was too monotonous or too far from pronunciation.",
        "Increase beginning/middle diversity while keeping sound close.",
        "If many outputs are suffix-only, regenerate before answering.",
        "If any output contains isolated jamo, regenerate before answering."
      ].join("\n")
    : "Mode: normal";

  return [
    `Meme style context: ${envelope.styleContext}`,
    "Style examples:",
    `- ${styleExampleBlock}`,
    `User input: ${envelope.userInput}`,
    "Output format: exactly one line, comma + space separated Korean variants.",
    listLengthRule,
    "First item: must be exactly the user input.",
    "No duplicates.",
    "No explanations, labels, quotes, numbering, markdown, or URLs.",
    "Primary objective: phonetic similarity is mandatory and highest priority.",
    "Every variant should still sound like a slurred/misheard version of the original.",
    "Humor objective: playful mishearing is allowed only if pronunciation still stays close.",
    "Never replace the core stem with unrelated object nouns.",
    "Do not output unrelated substitutions like '로켓아프다고, 냉장고아프다고'.",
    `Mutation hotspot: \"${hotspot}\" (beginning/middle pronunciation core).`,
    structureRule,
    strictBlock
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

  const cut = Math.max(1, normalizedInput.length - 2);

  for (const variant of nonFirst) {
    if (JAMO_REGEX.test(variant) || !/^[가-힣]+$/.test(variant)) {
      brokenHangulCount += 1;
    }

    const similarity = phoneticSimilarity(normalizedInput, variant);

    if (similarity >= 0.4) {
      closeCount += 1;
    }

    if (similarity < 0.2) {
      farCount += 1;
    }

    if (variant.slice(0, cut) === normalizedInput.slice(0, cut)) {
      endingOnlyCount += 1;
    }

    if (OBJECT_WORD_REGEX.test(variant) && similarity < 0.35) {
      objectLikeCount += 1;
    }

    if (variant.length >= 2) {
      prefix2Set.add(variant.slice(0, 2));
    }

    if (variant.length >= 1) {
      firstSyllableSet.add(variant.slice(0, 1));
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

  if (objectLikeCount > 2) {
    return true;
  }

  if (inputLength <= 3) {
    if (firstSyllableSet.size < 6) {
      return true;
    }
    return false;
  }

  const prefixChangedCount = nonFirst.filter((variant) => variant.slice(0, 2) !== basePrefix2).length;
  const prefixChangedRatio = prefixChangedCount / nonFirst.length;

  if (prefix2Set.size < 4 || prefixChangedRatio < 0.35) {
    return true;
  }

  if (endingOnlyRatio > 0.45) {
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
