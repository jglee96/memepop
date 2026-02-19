import type { Metadata } from "next";

import { absoluteUrl } from "@/shared/config";

const COMMON_FAQ: ReadonlyArray<{ q: string; a: string }> = [
  {
    q: "MemePop은 뭘 하는 서비스인가요?",
    a: "상황 설명 한 줄을 넣으면 밈 톤에 맞춰 문장을 변형해 주는 텍스트 리믹스 도구입니다."
  },
  {
    q: "생성 결과가 서버에 저장되나요?",
    a: "아니요. 결과는 요청 시 즉시 반환되고 저장하지 않습니다. 필요한 문구만 복사해서 외부 플랫폼에 사용하면 됩니다."
  },
  {
    q: "어떤 입력이 차단되나요?",
    a: "URL, 프롬프트 인젝션 패턴, 피싱/개인정보 요구나 위험한 표현은 보안 정책으로 차단됩니다."
  },
  {
    q: "밈별 결과 스타일은 왜 다른가요?",
    a: "각 밈은 별도의 스타일 규칙과 프롬프트 템플릿을 사용합니다. 같은 상황도 밈마다 문체와 길이가 다르게 나옵니다."
  },
  {
    q: "생성 실패 시 어떻게 해야 하나요?",
    a: "입력을 더 구체적으로 바꾸거나 짧게 다시 시도해 보세요. 짧은 시간에 반복 요청하면 잠시 제한될 수 있습니다."
  }
];

export const metadata: Metadata = {
  title: "FAQ - MemePop 공통 질문",
  description: "MemePop 사용 방법, 보안 정책, 저장 정책 등 공통 질문을 한 번에 확인하세요.",
  alternates: {
    canonical: absoluteUrl("/faq")
  },
  openGraph: {
    title: "FAQ - MemePop 공통 질문 | MemePop",
    description: "MemePop 사용 방법, 보안 정책, 저장 정책 등 공통 질문을 한 번에 확인하세요.",
    url: absoluteUrl("/faq")
  },
  robots: {
    index: true,
    follow: true
  }
};

export default function FaqPage(): React.JSX.Element {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: COMMON_FAQ.map((entry) => ({
      "@type": "Question",
      name: entry.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: entry.a
      }
    }))
  };

  return (
    <main className="space-y-10 pb-6">
      <header className="border-y border-slate-300/80 py-8 dark:border-slate-700/80">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">FAQ</p>
        <h1 className="mt-4 font-['Space_Grotesk','SUIT','Pretendard','Noto_Sans_KR',sans-serif] text-5xl leading-[0.95] tracking-tight sm:text-7xl">
          자주 묻는 질문
        </h1>
      </header>

      <dl className="divide-y divide-slate-300/80 border-y border-slate-300/80 dark:divide-slate-700/80 dark:border-slate-700/80">
        {COMMON_FAQ.map((entry) => (
          <div key={entry.q} className="space-y-2 py-4">
            <dt className="text-sm font-semibold text-slate-900 dark:text-slate-100">{entry.q}</dt>
            <dd className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">{entry.a}</dd>
          </div>
        ))}
      </dl>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
    </main>
  );
}
