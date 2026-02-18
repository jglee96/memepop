import type { PromptEnvelope } from "@/shared/security/promptPolicy";
import { buildCompactStyleContext } from "@/shared/prompts/compactContext";

export function buildDefaultMemePrompt(envelope: PromptEnvelope): string {
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
}
