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
    expect(repaired).toMatch(/오도기합짜세|기열찐빠황룡|해병수육/);
    expect(countDistinctEndings(repaired)).toBeGreaterThanOrEqual(6);
  });

  it("keeps valid output as-is (normalized)", () => {
    const valid = repairHaebyeongJungcheopUimunmunOutput("임시", 7);
    const repairedAgain = repairHaebyeongJungcheopUimunmunOutput(valid, 7);

    expect(shouldRetryHaebyeongJungcheopUimunmunOutput(repairedAgain, 7)).toBe(false);
    expect(repairedAgain).toBe(valid);
  });

  it("preserves creative llm output and only adds missing outer layers", () => {
    const llmLikeOutput =
      "중첩 의문문을 사용하는 것에 대한 허락을 구하는 일을 보고드려도 괜찮은지에 대한 의문이 있는 것을 감히 발설해도 되는지에 관한 질문이 남아 있음을 본 해병이 알아도 되겠습니까?";

    const repaired = repairHaebyeongJungcheopUimunmunOutput(llmLikeOutput, 6);

    expect(repaired).toContain("감히 발설해도 되는지");
    expect(repaired).toContain("본 해병이 알아도 되겠습니까");
    expect(countHaebyeongNestedQuestionUnits(repaired)).toBe(6);
  });

  it("converts comma-separated serial questions into chained nested clauses", () => {
    const llmLikeOutput =
      "자문이 끝나면 최종보고를 올려도 되겠습니까, 최종보고의 제목이 위엄에 맞는지 제목심의를 받아도 되겠습니까?";

    const repaired = repairHaebyeongJungcheopUimunmunOutput(llmLikeOutput, 3);

    expect(repaired).not.toContain(",");
    expect(repaired).toContain("자문이 끝나면 최종보고를 올려도 되는지를");
    expect(repaired).toContain("최종보고의 제목이 위엄에 맞는지 제목심의를 받아도 되겠습니까");
    expect(countHaebyeongNestedQuestionUnits(repaired)).toBe(3);
  });

  it("rewrites premature final endings so only the last clause ends with 되겠습니까", () => {
    const llmLikeOutput =
      "요청해도 되겠습니까에 대해 그 판단을 계속 여쭈어보아도 되는지에 대한 답을 감히 제가 알아도 되겠습니까?";

    const repaired = repairHaebyeongJungcheopUimunmunOutput(llmLikeOutput, 3);

    expect(repaired.match(/되겠습니까/g)?.length ?? 0).toBe(1);
    expect(repaired).toContain("요청해도 되는지에 대해");
    expect(repaired.endsWith("?")).toBe(true);
  });
});

function countDistinctEndings(output: string): number {
  const matches = output.match(/되는지|있는지|맞는지|아닌지|가능한지|옳은지|적절한지|괜찮은지|되겠습니까/g) ?? [];
  return new Set(matches).size;
}
