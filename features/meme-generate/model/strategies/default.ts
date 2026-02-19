import type { PromptEnvelope } from "@/shared/security";

import { buildCompactStyleContext } from "./buildCompactStyleContext";
import type { MemeGenerationSlice } from "./types";

export const defaultMemeSlice: MemeGenerationSlice = {
  slug: "__default__",
  buildPrompt(envelope: PromptEnvelope): string {
    const styleSeed = buildCompactStyleContext(envelope);

    return [
      "TASK: Create Korean phonetic meme variants.",
      `INPUT: ${envelope.userInput}`,
      `STYLE: ${envelope.styleContext}`,
      `SEED: ${styleSeed}`,
      "FORMAT: one line, comma+space separated; first item = INPUT; 24-36 items.",
      "HARD: Hangul syllable blocks only, no duplicates, no URLs/markdown/labels.",
      "QUALITY: pronunciation close, mutate beginning/middle (not suffix-only), include 2-4 playful mishearing variants."
    ].join("\n");
  },
  estimateMaxOutputTokens(envelope, strictMode): number {
    const length = Array.from(envelope.userInput.replace(/\s+/g, "")).length;
    const base = length <= 3 ? 260 : length <= 5 ? 300 : 340;
    return strictMode ? base + 60 : base;
  }
};
