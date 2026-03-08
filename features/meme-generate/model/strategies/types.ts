import type { PromptEnvelope } from "@/shared/security";

export interface MemeGenerationSlice {
  slug: string;
  buildPrompt: (envelope: PromptEnvelope, strictMode: boolean) => string;
  shouldRetry?: (envelope: PromptEnvelope, output: string) => boolean;
  repairOutput?: (envelope: PromptEnvelope, output: string) => string;
  buildFallbackOutput?: (envelope: PromptEnvelope) => string;
  estimateMaxOutputTokens?: (envelope: PromptEnvelope, strictMode: boolean) => number;
}
