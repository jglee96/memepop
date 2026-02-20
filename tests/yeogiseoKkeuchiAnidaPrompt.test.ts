import { describe, expect, it } from "vitest";

import { shouldRetryYeogiseoKkeuchiAnidaOutput } from "@/features/meme-generate/model/strategies";

describe("yeogiseo-kkeuchi-anida prompt quality gate", () => {
  it("retries when output does not start with required prefix", () => {
    const output =
      "여기서끝이아니다~~청소정리먼지털기설거지빨래여기서끝이아니다줄눈복원환풍기분해청소옥상물청소";

    expect(shouldRetryYeogiseoKkeuchiAnidaOutput("청소 루틴 과잉", output, 40)).toBe(true);
  });

  it("retries when whitespace appears after prefix", () => {
    const output =
      "여기서 끝이 아니다~~청소정리먼지털기 설거지빨래여기서끝이아니다줄눈복원환풍기분해청소옥상물청소";

    expect(shouldRetryYeogiseoKkeuchiAnidaOutput("청소 루틴 과잉", output, 40)).toBe(true);
  });

  it("retries when body misses topic tokens", () => {
    const output =
      "여기서 끝이 아니다~~회의자료정리메일발송일정조율이슈체크여기서끝이아니다시장분석성과리포트전략수립우주피칭";

    expect(shouldRetryYeogiseoKkeuchiAnidaOutput("운동 루틴 과잉", output, 40)).toBe(true);
  });

  it("keeps result when prefix, no-space body, hook, and topic fit", () => {
    const output =
      "여기서 끝이 아니다~~청소정리먼지털기설거지빨래분리수거욕실물때제거여기서끝이아니다창틀분해세척베란다틈새청소에어컨필터복원여기서끝이아니다옥상물청소달표면광택복원은하수먼지제거";

    expect(shouldRetryYeogiseoKkeuchiAnidaOutput("청소 루틴 과잉", output, 50)).toBe(false);
  });
});
