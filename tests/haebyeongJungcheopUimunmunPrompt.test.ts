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
    const valid =
      "7중첩 의문문을 사용하는 것에 대한 허락을 구해도 되는지를 확인받을 수 있는지에 대하여 의문이 존재함을 표현해도 되는지에 관한 문제를 제기하는 것이 기열찐빠황룡같지는 않은지를 체크해주시는 것이 가능한지를 알고 싶은 점이 있음을 알려도 되는 것인지를 감히 제가 알아도 되겠습니까?";
    const repairedAgain = repairHaebyeongJungcheopUimunmunOutput(valid, 7);

    expect(shouldRetryHaebyeongJungcheopUimunmunOutput(repairedAgain, 7)).toBe(false);
    expect(repairedAgain).toBe(valid);
  });

  it("keeps a creative llm-like chained output when it already satisfies the grammar", () => {
    const llmLikeOutput =
      "중첩 의문문을 사용하는 것에 대한 허락을 구해도 되는지를 발설하는 태도가 해병 예법에 맞는지를 상부에 전달하는 절차를 개시하는 것이 가능한지를 감찰 요청으로 둔갑시키는 술수가 아직 살아 있는지를 해병의 명예를 한 번 더 들먹이는 짓이 옳은지를 감히 제가 알아도 되겠습니까?";

    const repaired = repairHaebyeongJungcheopUimunmunOutput(llmLikeOutput, 6);

    expect(repaired).toBe(llmLikeOutput);
    expect(countHaebyeongNestedQuestionUnits(repaired)).toBe(6);
  });

  it("rebuilds comma-separated serial questions into grammar-driven nested clauses", () => {
    const llmLikeOutput =
      "자문이 끝나면 최종보고를 올려도 되겠습니까, 최종보고의 제목이 위엄에 맞는지 제목심의를 받아도 되겠습니까?";

    const repaired = repairHaebyeongJungcheopUimunmunOutput(llmLikeOutput, 3);

    expect(repaired).not.toContain(",");
    expect(repaired.match(/되겠습니까/g)?.length ?? 0).toBe(1);
    expect(countHaebyeongNestedQuestionUnits(repaired)).toBe(3);
  });

  it("rewrites invalid early final endings into a single-final grammar output", () => {
    const llmLikeOutput =
      "요청해도 되겠습니까에 대해 그 판단을 계속 여쭈어보아도 되는지에 대한 답을 감히 제가 알아도 되겠습니까?";

    const repaired = repairHaebyeongJungcheopUimunmunOutput(llmLikeOutput, 3);

    expect(repaired.match(/되겠습니까/g)?.length ?? 0).toBe(1);
    expect(repaired.endsWith("?")).toBe(true);
    expect(countHaebyeongNestedQuestionUnits(repaired)).toBe(3);
  });
});

function countDistinctEndings(output: string): number {
  const matches =
    output.match(/행동인지|것인지|무엇인지|공정한지|않는지|않은지|될지|되는지|있는지|맞는지|아닌지|가능한지|옳은지|적절한지|괜찮은지|되겠습니까/g) ?? [];
  return new Set(matches).size;
}
