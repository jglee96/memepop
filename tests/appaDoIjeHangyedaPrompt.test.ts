import { describe, expect, it } from "vitest";

import { shouldRetryAppaDoIjeHangyedaOutput } from "@/features/meme-generate/model/strategies";

describe("appa-do-ije-hangyeda prompt quality gate", () => {
  it("retries when output looks like short comma list", () => {
    const output =
      "리뷰어도 한계다, 리뷰어도 한계다요, 리뷰어도 한계닷, 리뷰어도 한계당, 리뷰어도 한계네, 리뷰어도 한계냐, 리뷰어도 한계임, 리뷰어도 한계다구, 리뷰어도 한계고, 리뷰어도 한계래, 리뷰어도 한계쥬, 리뷰어도 한계짘, 리뷰어도 한계쟈";

    expect(shouldRetryAppaDoIjeHangyedaOutput(output)).toBe(true);
  });

  it("retries when key structure markers are missing", () => {
    const output =
      "오늘은 그냥 피곤하고 할 말도 없다. 길게 쓰고 싶지 않고 지금은 모두가 각자 일만 하면 좋겠다. 다음에 다시 이야기하자.";

    expect(shouldRetryAppaDoIjeHangyedaOutput(output)).toBe(true);
  });

  it("keeps result when monologue arc is present", () => {
    const output =
      "리뷰어도 이제 한계다. 일정 탓 환경 탓 레거시 탓하지 마라. 시니어도 나도 충분히 기다려줬다. 점심시간 줄여가며 코멘트 달고 재현까지 해주면서 네가 이번엔 달라지겠지 믿고 버텼다. 그런데 이게 뭐냐? 이 PR이 몇 번째 수정인지 알긴 하냐? 늘 불만은 많은데 고치는 건 왜 매번 같은 자리냐. 그냥 이제 멘션 없이 알아서 머지해라. 리뷰어도 지쳤다.";

    expect(shouldRetryAppaDoIjeHangyedaOutput(output)).toBe(false);
  });
});
