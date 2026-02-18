import { describe, expect, it } from "vitest";

import { generateEotteokharagoStyle, generateMemeOutput } from "@/features/meme-generate/model/generateMeme";

describe("generateMeme", () => {
  it("includes original input and multiple variations", () => {
    const result = generateEotteokharagoStyle("배고프다고");
    expect(result[0]).toBe("배고프다고");
    expect(result.length).toBeGreaterThan(3);
  });

  it("returns comma separated output for known slug", () => {
    const output = generateMemeOutput("eotteokharago", "배고프다고");
    expect(output).toContain(",");
  });
});
