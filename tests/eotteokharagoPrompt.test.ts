import { describe, expect, it } from "vitest";

import { shouldRetryEotteokharagoOutput } from "@/shared/prompts";

describe("eotteokharago prompt quality gate", () => {
  it("retries when variants mostly change only endings", () => {
    const output =
      "머리아프다고, 머리아프다구, 머리아프다꼬, 머리아프다공, 머리아프다규, 머리아프다거, 머리아프다냐, 머리아프다네, 머리아프다며, 머리아프다며요, 머리아프타고, 머리아프다고요, 머리아프라구, 머리아프단고, 머리아프당고, 머리아프다캄, 머리아프다칸, 머리아프다킹";

    expect(shouldRetryEotteokharagoOutput("머리아프다고", output)).toBe(true);
  });

  it("retries when long input keeps first chunk almost fixed", () => {
    const output =
      "점심뭐먹냐고, 점심머먹냐고, 점심모먹냐고, 점심뭐먹라고, 점심뭐묵냐고, 점심뭐먹냐구, 점심뭐먹냐고요, 점심뭐먹냐궁, 점심뭐먹냐고오, 점심뭐먹냐다고, 점심뭐먹냐구나, 점심뭐먹냐고나, 점심뭐먹냐고요잉, 점심뭐먹냐고잉, 잠심뭐먹냐고, 점슴뭐먹냐고, 점심모먹냐구, 점심머묵냐고, 점심뭐묵냐구, 점심뭐먹냐구요";

    expect(shouldRetryEotteokharagoOutput("점심뭐먹냐고", output)).toBe(true);
  });

  it("retries when object replacement drifts too far from pronunciation", () => {
    const output =
      "머리아프다고, 머리야프다고, 머랴프다고, 머리아푸다고, 머리얍프다고, 머리알프다고, 로켓아프다고, 냉장고아프다고, 헬리콥터아프다고, 우주선아프다고, 떡볶이아프다고, 고양이아프다고, 라자냐아프다고, 선풍기아프다고, 전기밥솥아프다고, 계산기아프다고, 샌드위치아프다고, 택배상자아프다고";

    expect(shouldRetryEotteokharagoOutput("머리아프다고", output)).toBe(true);
  });

  it("retries when isolated jamo appears", () => {
    const output =
      "꼬숩다, 꼬수ㅂ다, 꼬수ㅍ다, 꼬숩따, 꼬쑵다, 꼬쑵따, 꾸숩다, 꾜숩다, 께숩다, 끄숩다, 꼬슙다, 꼬수웁다, 꼬수읍다, 꼬숩노, 끼숩노, 뀨숩노, 까숩노, 꺼숩노";

    expect(shouldRetryEotteokharagoOutput("꼬숩다", output)).toBe(true);
  });

  it("keeps result when front/middle mutations stay phonetically close", () => {
    const output =
      "머리아프다고, 모리아프다고, 멀리아프다고, 멍리아프다고, 마리아프다고, 미리아프다고, 무리아프다고, 메리아프다고, 머리야프다고, 모리야프다고, 멀리얍프다고, 멍리압프다고, 마리앞프다고, 미리엇프다고, 무리업프다고, 메리오프다고, 머리압푸다고, 모리야푸다고, 멀리앖프라고, 멍리압프라구, 마리야프라구, 미리압프라구, 무리아프라구, 메리아프라구";

    expect(shouldRetryEotteokharagoOutput("머리아프다고", output)).toBe(false);
  });
});
