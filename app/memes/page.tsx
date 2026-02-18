import type { Metadata } from "next";
import Link from "next/link";

import { getAllMemes } from "@/entities/meme/registry";
import { absoluteUrl } from "@/shared/config/site";

export const metadata: Metadata = {
  title: "밈 목록 - 현재 지원 밈 모아보기",
  description: "MemePop에서 현재 지원하는 밈 목록과 밈별 생성 페이지를 확인하세요.",
  alternates: {
    canonical: absoluteUrl("/memes")
  },
  openGraph: {
    title: "밈 목록 - 현재 지원 밈 모아보기 | MemePop",
    description: "MemePop에서 현재 지원하는 밈 목록과 밈별 생성 페이지를 확인하세요.",
    url: absoluteUrl("/memes")
  }
};

export default function MemesPage(): React.JSX.Element {
  const memes = getAllMemes();

  return (
    <main>
      <h1 style={{ fontFamily: "var(--font-display)" }}>밈 목록</h1>
      <p className="muted">밈별 전용 URL로 이동해 설명, 예시, FAQ, 생성 기능을 바로 사용할 수 있습니다.</p>

      <section className="grid two" style={{ marginTop: "1rem" }}>
        {memes.map((meme) => (
          <article className="card" key={meme.slug}>
            <h2 style={{ marginTop: 0 }}>{meme.title}</h2>
            <p className="muted">{meme.description.split("\n")[0]}</p>
            <p className="muted">키워드: {meme.seo.keywords.join(", ")}</p>
            <Link href={`/m/${meme.slug}`} className="btn btn-primary" style={{ display: "inline-block", marginTop: "0.3rem" }}>
              {meme.title} 생성 페이지
            </Link>
          </article>
        ))}
      </section>
    </main>
  );
}
