import { describe, expect, it } from "vitest";

import {
  countHaebyeongNestedQuestionUnits,
  repairHaebyeongJungcheopUimunmunOutput,
  shouldRetryHaebyeongJungcheopUimunmunOutput
} from "@/features/meme-generate/model/strategies";

describe("haebyeong-jungcheop-uimunmun prompt quality gate", () => {
  it("retries when nesting count mismatches target", () => {
    const output = "69중첩 의문문으로 감히 제가 알아도 되겠습니까?";
    expect(shouldRetryHaebyeongJungcheopUimunmunOutput(output, 69)).toBe(true);
  });

  it("repairs invalid output into exact nesting count", () => {
    const repaired = repairHaebyeongJungcheopUimunmunOutput("짧은 출력", 69);
    expect(repaired).toContain("69중첩 의문문");
    expect(repaired.endsWith("?")).toBe(true);
    expect(countHaebyeongNestedQuestionUnits(repaired)).toBe(69);
  });

  it("keeps valid output as-is (normalized)", () => {
    const valid = repairHaebyeongJungcheopUimunmunOutput("임시", 7);
    const repairedAgain = repairHaebyeongJungcheopUimunmunOutput(valid, 7);

    expect(shouldRetryHaebyeongJungcheopUimunmunOutput(repairedAgain, 7)).toBe(false);
    expect(repairedAgain).toBe(valid);
  });
});
