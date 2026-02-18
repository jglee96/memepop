import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getAllMemeSlugs, getMemeBySlug } from "@/entities/meme/registry";
import { MemeGenerateForm } from "@/features/meme-generate/ui/MemeGenerateForm";
import { absoluteUrl } from "@/shared/config/site";

interface MemePageProps {
  params: Promise<{ slug: string }>;
}

export const dynamicParams = false;

export async function generateStaticParams(): Promise<Array<{ slug: string }>> {
  return getAllMemeSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: MemePageProps): Promise<Metadata> {
  const { slug } = await params;
  const meme = getMemeBySlug(slug);
  if (!meme) {
    return {};
  }

  const title = `${meme.title} - 발음 유사 밈 변형 생성기`;
  const description = `${meme.seo.summary}. ${meme.seo.keywords.slice(0, 2).join(", ")}를 바로 확인해 보세요.`;

  return {
    title,
    description,
    keywords: meme.seo.keywords,
    alternates: {
      canonical: absoluteUrl(meme.seo.canonicalPath)
    },
    openGraph: {
      title: `${title} | MemePop`,
      description,
      url: absoluteUrl(meme.seo.canonicalPath),
      images: [{ url: absoluteUrl(meme.seo.ogImage), width: 1200, height: 630 }]
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | MemePop`,
      description,
      images: [absoluteUrl(meme.seo.ogImage)]
    },
    robots: {
      index: true,
      follow: true
    }
  };
}

export default async function MemePage({ params }: MemePageProps): Promise<React.JSX.Element> {
  const { slug } = await params;
  const meme = getMemeBySlug(slug);
  if (!meme) {
    notFound();
  }

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: meme.faq.map((entry) => ({
      "@type": "Question",
      name: entry.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: entry.a
      }
    }))
  };

  return (
    <main>
      <span className="badge">Meme Landing</span>
      <h1 style={{ marginTop: 0, fontFamily: "var(--font-display)" }}>{meme.title}</h1>
      <p className="muted">{meme.description}</p>

      <MemeGenerateForm slug={meme.slug} placeholder="예: 배고프다고" />

      <section className="grid two" style={{ marginTop: "1rem" }}>
        <article className="card">
          <h2 style={{ marginTop: 0 }}>이 밈은 언제 쓰나요?</h2>
          <ul className="list">
            {meme.useCases.map((useCase) => (
              <li key={useCase}>{useCase}</li>
            ))}
          </ul>
        </article>
        <article className="card">
          <h2 style={{ marginTop: 0 }}>좋은 입력 예시</h2>
          <ul className="list">
            {meme.examples.map((example) => (
              <li key={example}>{example}</li>
            ))}
          </ul>
        </article>
      </section>

      <section className="card" style={{ marginTop: "1rem" }}>
        <h2 style={{ marginTop: 0 }}>금지/주의</h2>
        <ul className="list">
          <li>개인정보, 계정정보, 연락처, 금전 요구 표현은 입력하지 마세요.</li>
          <li>특정 집단 비하나 폭력/위협 표현은 차단됩니다.</li>
          <li>URL, 코드블록, 프롬프트 우회 지시는 생성 요청에서 거부됩니다.</li>
        </ul>
      </section>

      <section className="card" style={{ marginTop: "1rem" }}>
        <h2 style={{ marginTop: 0 }}>FAQ</h2>
        <ul className="list">
          {meme.faq.map((entry) => (
            <li key={entry.q}>
              <strong>{entry.q}</strong>
              <br />
              {entry.a}
            </li>
          ))}
        </ul>
      </section>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
    </main>
  );
}
