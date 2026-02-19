import type { PromptEnvelope } from "@/shared/security";

import { buildCompactStyleContext } from "./buildCompactStyleContext";
import type { MemeGenerationSlice } from "./types";

const REQUIRED_MARKERS: RegExp[] = [
  /한계/,
  /탓하지\s*마라|탓하지마라/,
  /기다려줬/,
  /이게 뭐냐|뭐냐\?/,
  /지쳤/,
  /알아서/
];

export const appaDoIjeHangyedaSlice: MemeGenerationSlice = {
  slug: "appa-do-ije-hangyeda",
  buildPrompt(envelope: PromptEnvelope, strictMode: boolean): string {
    const styleSeed = buildCompactStyleContext(envelope);
    const strictRule = strictMode
      ? "RETRY: previous output missed the monologue arc. Keep one-message format and strengthen progression."
      : "RETRY: off";

    return [
      "TASK: rewrite the user's situation into a Korean '아빠도 이제 한계다' meme monologue.",
      `SITUATION: ${envelope.userInput}`,
      `STYLE: ${envelope.styleContext}`,
      `SEED: ${styleSeed}`,
      "FORMAT: single Korean message in one paragraph; no bullets, no markdown, no labels.",
      "LENGTH: 280-460 characters.",
      "VOICE: exhausted, sarcastic, dramatic complaint tone.",
      "STRUCTURE: opening exhaustion -> 'OO 탓 XX 탓 하지 마라' -> waited/helped enough narrative -> rhetorical reality-check questions -> final ultimatum.",
      "HARD: no URLs, no code, no private data requests, no hate speech, no violent threats.",
      strictRule
    ].join("\n");
  },
  shouldRetry(_envelope, output): boolean {
    return shouldRetryAppaDoIjeHangyedaOutput(output);
  },
  estimateMaxOutputTokens(_envelope, strictMode): number {
    return strictMode ? 620 : 520;
  }
};

export function shouldRetryAppaDoIjeHangyedaOutput(output: string): boolean {
  const normalized = output.replace(/\s+/g, " ").trim();
  if (!normalized) {
    return true;
  }

  if (normalized.length < 160 || normalized.length > 650) {
    return true;
  }

  if (/```|^\s*[-*]\s/m.test(normalized)) {
    return true;
  }

  const commaCount = normalized.split(",").length - 1;
  if (commaCount >= 16 && normalized.length < 220) {
    return true;
  }

  const markerCount = REQUIRED_MARKERS.reduce(
    (count, marker) => (marker.test(normalized) ? count + 1 : count),
    0
  );

  return markerCount < 3;
}
