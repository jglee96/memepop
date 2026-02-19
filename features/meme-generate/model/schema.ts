import { z } from "zod";

import { MAX_INPUT_LENGTH } from "@/shared/config";

export const generateRequestSchema = z.object({
  input: z
    .string()
    .min(1, "입력값이 비어 있습니다.")
    .max(MAX_INPUT_LENGTH, `입력은 최대 ${MAX_INPUT_LENGTH}자까지 허용됩니다.`)
});

export type GenerateRequest = z.infer<typeof generateRequestSchema>;
