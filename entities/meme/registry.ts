import type { Meme } from "@/entities/meme/types";

const memeRegistry: ReadonlyArray<Meme> = [
  {
    slug: "eotteokharago",
    title: "어떡하라고",
    description:
      "‘어떡하라고’ 밈은 난감한 상황에서 감정을 과장해 표현할 때 쓰는 한국어 밈 문구입니다. 원래 문장 의미는 답답함과 당혹감에 가깝지만, 실제 사용에서는 말맛을 살리기 위해 발음을 일부러 뭉개거나 소리를 비슷하게 비틀어 나열하는 방식이 핵심입니다. 그래서 같은 의미라도 ‘어뜨카라고’, ‘오또카라고’처럼 리듬감 있게 변형하면 밈 톤이 강해집니다.\n\n이 밈은 댓글, 단톡, 커뮤니티 반응처럼 짧고 빠른 대화에서 특히 잘 작동합니다. 현실적인 문제를 진지하게 해결하려는 문장보다, 상황 자체가 어이없거나 억울할 때 자조적으로 웃어넘기는 용도로 많이 쓰입니다. 즉, 공격적인 비난이 아니라 ‘이 상황 나보고 어쩌라는 거야’라는 감정을 유머로 전환하는 표현입니다.\n\nMemePop에서는 이 스타일을 그대로 적용해 입력 문구의 발음 골격은 유지하면서, 자모 교체·소리 흔들기·리듬 변주를 통해 바로 복사해 쓸 수 있는 리스트를 제공합니다. 결과는 서비스에 저장되지 않으며, 사용자가 원하는 문구만 골라 외부 플랫폼에서 바로 활용할 수 있습니다.",
    useCases: [
      "업무나 과제에서 갑작스러운 무리한 요청을 받았을 때",
      "친구가 난감한 상황을 공유했을 때 공감 섞인 반응으로",
      "커뮤니티에서 어이없는 전개를 가볍게 풍자할 때",
      "진지함 대신 리듬 있는 밈 톤으로 분위기를 풀고 싶을 때"
    ],
    template: {
      kind: "text",
      instructions:
        "사용자 문구의 발음 유사성을 유지하면서 자모를 흔들고 리듬을 비틀어, 콤마로 구분된 짧은 변형 리스트를 만든다."
    },
    examples: [
      "어떡하라고, 어뜨카라고, 우뜨카라고, 모루카라고, 오픈카라고",
      "어떡하라고, 엉뜨켜라고, 엉뚱하라고, 오또카라고, 억떡하라고",
      "배고프다고, 배곺흐다고, 앱오프다고, 배고푸타고, 배고프다구"
    ],
    faq: [
      {
        q: "이 밈은 어떤 상황에서 쓰나요?",
        a: "당황스럽거나 답답한 상황을 심각하게 비난하지 않고, 유머 섞인 공감 표현으로 바꾸고 싶을 때 자주 사용합니다."
      },
      {
        q: "너무 공격적인 표현도 생성되나요?",
        a: "아니요. MemePop은 개인정보 요구, 피싱, 특정 집단 비하 같은 위험하거나 공격적인 표현을 차단합니다."
      },
      {
        q: "생성 결과가 저장되거나 링크로 공유되나요?",
        a: "저장되지 않습니다. 결과는 즉시 반환되며, 사용자가 복사해 원하는 외부 플랫폼에 직접 붙여넣는 구조입니다."
      }
    ],
    seo: {
      keywords: [
        "어떡하라고 뜻",
        "어떡하라고 예시",
        "어떡하라고 생성기",
        "어떡하라고 변형",
        "밈 문구 리믹스"
      ],
      ogImage: "/og/eotteokharago.svg",
      canonicalPath: "/m/eotteokharago",
      summary: "어떡하라고 밈 문구를 발음 유사 리믹스 스타일로 빠르게 생성하는 페이지"
    }
  }
];

const memeMap = new Map(memeRegistry.map((meme) => [meme.slug, meme]));

export function getAllMemes(): ReadonlyArray<Meme> {
  return memeRegistry;
}

export function getMemeBySlug(slug: string): Meme | undefined {
  return memeMap.get(slug);
}

export function getAllMemeSlugs(): string[] {
  return memeRegistry.map((meme) => meme.slug);
}

export function isKnownSlug(slug: string): boolean {
  return memeMap.has(slug);
}
