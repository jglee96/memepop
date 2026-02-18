const HANGUL_BASE = 0xac00;
const HANGUL_END = 0xd7a3;
const JUNGSEONG_COUNT = 21;
const JONGSEONG_COUNT = 28;

const INITIAL_SHIFT: Record<number, number> = {
  0: 15, // ㄱ -> ㅋ
  2: 16, // ㄴ -> ㅌ
  3: 16, // ㄷ -> ㅌ
  7: 8, // ㅂ -> ㅃ
  9: 10, // ㅅ -> ㅆ
  11: 12, // ㅇ -> ㅈ
  12: 14, // ㅈ -> ㅊ
  15: 0, // ㅋ -> ㄱ
  16: 3 // ㅌ -> ㄷ
};

const VOWEL_SHIFT: Record<number, number> = {
  0: 4, // ㅏ -> ㅓ
  1: 5, // ㅐ -> ㅔ
  4: 8, // ㅓ -> ㅗ
  8: 13, // ㅗ -> ㅜ
  13: 18 // ㅜ -> ㅡ
};

const LEADING_SWAP: Record<string, string> = {
  어: "오",
  오: "우",
  우: "모",
  모: "머",
  배: "앱"
};

interface Decomposed {
  initial: number;
  vowel: number;
  final: number;
}

export function generateMemeOutput(slug: string, input: string): string {
  switch (slug) {
    case "eotteokharago":
      return generateEotteokharagoStyle(input).join(", ");
    default:
      return input;
  }
}

export function generateEotteokharagoStyle(input: string): string[] {
  const base = input.trim();
  const words = base.split(/\s+/).filter(Boolean);
  if (words.length === 0) {
    return [];
  }

  const candidates = new Set<string>();
  const tokenList = [
    mapWords(words, phoneticShift),
    mapWords(words, vowelBlur),
    mapWords(words, swapStartSound),
    mapWords(words, insertFillerSyllable),
    mapWords(words, softenEnding),
    mapWords(words, combinedBlur),
    mapWords(words, transposeNearbySyllable),
    mapWords(words, dropOneSyllable)
  ];

  candidates.add(base);
  for (const token of tokenList) {
    if (token && token.length > 1) {
      candidates.add(token);
    }
  }

  return Array.from(candidates).slice(0, 12);
}

function mapWords(words: string[], mutator: (word: string) => string): string {
  return words.map(mutator).join(" ");
}

function phoneticShift(word: string): string {
  const chars = [...word];
  return chars
    .map((char, index) => {
      if (index % 2 === 0) {
        return mutateSyllable(char, { shiftInitial: true });
      }
      return char;
    })
    .join("");
}

function vowelBlur(word: string): string {
  const chars = [...word];
  return chars
    .map((char, index) => {
      if (index % 2 === 1) {
        return mutateSyllable(char, { shiftVowel: true });
      }
      return char;
    })
    .join("");
}

function swapStartSound(word: string): string {
  if (word.length === 0) {
    return word;
  }
  const first = word[0];
  const swapped = LEADING_SWAP[first];
  if (!swapped) {
    return mutateSyllable(first, { shiftInitial: true }) + word.slice(1);
  }
  return swapped + word.slice(1);
}

function insertFillerSyllable(word: string): string {
  if (word.length < 2) {
    return word;
  }
  return `${word.slice(0, 1)}프${word.slice(1)}`;
}

function softenEnding(word: string): string {
  if (word.endsWith("다")) {
    return `${word.slice(0, -1)}다구`;
  }
  if (word.endsWith("고")) {
    return `${word.slice(0, -1)}구`;
  }
  return `${word}라구`;
}

function combinedBlur(word: string): string {
  return vowelBlur(phoneticShift(word));
}

function transposeNearbySyllable(word: string): string {
  const chars = [...word];
  if (chars.length < 3) {
    return word;
  }
  [chars[1], chars[2]] = [chars[2], chars[1]];
  return chars.join("");
}

function dropOneSyllable(word: string): string {
  const chars = [...word];
  if (chars.length < 4) {
    return word;
  }
  chars.splice(2, 1);
  return chars.join("");
}

function mutateSyllable(
  char: string,
  opts: { shiftInitial?: boolean; shiftVowel?: boolean }
): string {
  const decomposed = decomposeHangul(char);
  if (!decomposed) {
    return char;
  }

  const initial = opts.shiftInitial
    ? (INITIAL_SHIFT[decomposed.initial] ?? decomposed.initial)
    : decomposed.initial;
  const vowel = opts.shiftVowel ? (VOWEL_SHIFT[decomposed.vowel] ?? decomposed.vowel) : decomposed.vowel;

  return composeHangul({
    initial,
    vowel,
    final: decomposed.final
  });
}

function decomposeHangul(char: string): Decomposed | null {
  const code = char.charCodeAt(0);
  if (code < HANGUL_BASE || code > HANGUL_END) {
    return null;
  }

  const offset = code - HANGUL_BASE;
  const initial = Math.floor(offset / (JUNGSEONG_COUNT * JONGSEONG_COUNT));
  const vowel = Math.floor((offset % (JUNGSEONG_COUNT * JONGSEONG_COUNT)) / JONGSEONG_COUNT);
  const final = offset % JONGSEONG_COUNT;

  return { initial, vowel, final };
}

function composeHangul(parts: Decomposed): string {
  const code =
    HANGUL_BASE + (parts.initial * JUNGSEONG_COUNT + parts.vowel) * JONGSEONG_COUNT + parts.final;
  return String.fromCharCode(code);
}
