import type { PromptEnvelope } from "@/shared/security";

export interface MemeGenerationSlice {
  slug: string;
  buildPrompt: (envelope: PromptEnvelope, strictMode: boolean) => string;
  shouldRetry?: (envelope: PromptEnvelope, output: string) => boolean;
  estimateMaxOutputTokens?: (envelope: PromptEnvelope, strictMode: boolean) => number;
}
