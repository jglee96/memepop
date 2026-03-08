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

  it("parses nestingCount payload for haebyeong-jungcheop-uimunmun", () => {
    const profile = resolveGenerateRequestProfile("haebyeong-jungcheop-uimunmun");
    const parsed = profile.requestSchema.safeParse({ nestingCount: 69 });

    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(profile.normalizeInput(parsed.data)).toEqual({
        userInput: "69중첩 의문문",
        generationOptions: { nestingCount: 69 }
      });
    }
  });

  it("uses default nestingCount when omitted in haebyeong-jungcheop-uimunmun", () => {
    const profile = resolveGenerateRequestProfile("haebyeong-jungcheop-uimunmun");
    const parsed = profile.requestSchema.safeParse({});

    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(profile.normalizeInput(parsed.data).generationOptions.nestingCount).toBe(69);
    }
  });

  it("rejects out-of-range nestingCount in haebyeong-jungcheop-uimunmun", () => {
    const profile = resolveGenerateRequestProfile("haebyeong-jungcheop-uimunmun");

    expect(profile.requestSchema.safeParse({ nestingCount: 0 }).success).toBe(false);
    expect(profile.requestSchema.safeParse({ nestingCount: 121 }).success).toBe(false);
    expect(profile.requestSchema.safeParse({ nestingCount: 69.5 }).success).toBe(false);
    expect(profile.requestSchema.safeParse({ nestingCount: "69" }).success).toBe(false);
  });
});
