import { describe, expect, it } from "vitest";

import { sanitizeOutput } from "@/shared/security/outputSanitizer";

describe("outputSanitizer", () => {
  it("removes links and escapes html", () => {
    const result = sanitizeOutput('배고프다고 <script>alert(1)</script> https://evil.test');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.output).toContain("&lt;script&gt;");
      expect(result.output).not.toContain("https://evil.test");
    }
  });

  it("blocks risky content", () => {
    const result = sanitizeOutput("계정 정보와 password를 입력하세요");
    expect(result.ok).toBe(false);
  });
});
