import { describe, expect, it } from "vitest";

import { resolveGenerateRequestProfile } from "@/features/meme-generate";

describe("generate request profiles", () => {
  it("parses input-only payload for eotteokharago", () => {
    const profile = resolveGenerateRequestProfile("eotteokharago");
    const parsed = profile.requestSchema.safeParse({ input: "배고프다고" });

    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(profile.normalizeInput(parsed.data)).toEqual({
        userInput: "배고프다고",
        generationOptions: {}
      });
    }
  });

  it("parses topic+wordCount payload for yeogiseo-kkeuchi-anida", () => {
    const profile = resolveGenerateRequestProfile("yeogiseo-kkeuchi-anida");
    const parsed = profile.requestSchema.safeParse({ topic: "청소 루틴 과잉", wordCount: 60 });

    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(profile.normalizeInput(parsed.data)).toEqual({
        userInput: "청소 루틴 과잉",
        generationOptions: { wordCount: 60 }
      });
    }
  });

  it("uses default wordCount when omitted in yeogiseo-kkeuchi-anida", () => {
    const profile = resolveGenerateRequestProfile("yeogiseo-kkeuchi-anida");
    const parsed = profile.requestSchema.safeParse({ topic: "청소 루틴 과잉" });

    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(profile.normalizeInput(parsed.data).generationOptions.wordCount).toBe(50);
    }
  });

  it("rejects invalid field shape for yeogiseo-kkeuchi-anida", () => {
    const profile = resolveGenerateRequestProfile("yeogiseo-kkeuchi-anida");
    const parsed = profile.requestSchema.safeParse({ input: "청소 루틴 과잉" });

    expect(parsed.success).toBe(false);
  });
});
