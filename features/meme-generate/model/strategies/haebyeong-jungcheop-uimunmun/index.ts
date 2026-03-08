import { NESTING_COUNT_DEFAULT } from "@/shared/config";
import type { PromptEnvelope } from "@/shared/security";

import { buildCompactStyleContext } from "../buildCompactStyleContext";
import type { MemeGenerationSlice } from "../types";
import { buildExampleDrivenHaebyeongNestedQuestion, clampNestingCount, minimallyRepairHaebyeongNestedQuestion } from "./generator";
import { countHaebyeongNestedQuestionUnits, isValidHaebyeongNestedQuestionOutput } from "./text";

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
    return !isValidHaebyeongNestedQuestionOutput(output, resolveRequestedNestingCount(envelope));
  },
  repairOutput(envelope, output): string {
    return minimallyRepairHaebyeongNestedQuestion(output, resolveRequestedNestingCount(envelope));
  },
  buildFallbackOutput(envelope): string {
    return buildExampleDrivenHaebyeongNestedQuestion(resolveRequestedNestingCount(envelope));
  },
  estimateMaxOutputTokens(envelope, strictMode): number {
    const targetNestingCount = resolveRequestedNestingCount(envelope);
    const base = Math.min(1500, 320 + targetNestingCount * 8);
    return strictMode ? base + 160 : base;
  }
};

export function shouldRetryHaebyeongJungcheopUimunmunOutput(output: string, targetNestingCount: number): boolean {
  return !isValidHaebyeongNestedQuestionOutput(output, clampNestingCount(targetNestingCount));
}

export function repairHaebyeongJungcheopUimunmunOutput(output: string, targetNestingCount: number): string {
  return minimallyRepairHaebyeongNestedQuestion(output, clampNestingCount(targetNestingCount));
}

export { countHaebyeongNestedQuestionUnits };

function resolveRequestedNestingCount(envelope: PromptEnvelope): number {
  return clampNestingCount(envelope.generationOptions.nestingCount ?? NESTING_COUNT_DEFAULT);
}
