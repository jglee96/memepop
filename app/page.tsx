import type { Metadata } from "next";
import Link from "next/link";

import { getAllMemes } from "@/entities/meme/registry";
import { absoluteUrl } from "@/shared/config/site";

export const metadata: Metadata = {
  alternates: {
    canonical: absoluteUrl("/")
  }
};

export default function HomePage(): React.JSX.Element {
  const memes = getAllMemes();

  return (
    <main>
      <section className="hero">
        <span className="badge">Stateless Meme SaaS</span>
        <h1 style={{ fontFamily: "var(--font-display)" }}>
          유행 밈 문구를
          <br />
          내 상황에 맞게 리믹스
        </h1>
        <p>
          MemePop은 밈마다 전용 페이지를 제공하고, 입력 문구를 해당 밈 톤으로 빠르게 변형합니다. 생성 결과는 저장하지 않고
          바로 복사해 외부 플랫폼에서 사용할 수 있습니다.
        </p>
        <div className="button-row">
          <Link href="/memes" className="btn btn-primary">
            밈 둘러보기
          </Link>
          <Link href="/m/eotteokharago" className="btn btn-secondary">
            첫 밈 써보기
          </Link>
        </div>
      </section>

      <h2 className="section-title" style={{ fontFamily: "var(--font-display)" }}>
        서비스 방식
      </h2>
      <section className="grid three">
        <article className="card">
          <h3>1. 밈 선택</h3>
          <p className="muted">밈별 canonical URL로 접근해 의미와 사용 맥락을 먼저 확인합니다.</p>
        </article>
        <article className="card">
          <h3>2. 문구 입력</h3>
          <p className="muted">상황 문구를 넣으면 밈 톤에 맞는 발음/리듬 변형 리스트를 생성합니다.</p>
        </article>
        <article className="card">
          <h3>3. 즉시 복사</h3>
          <p className="muted">결과는 저장하지 않습니다. 필요한 문구만 복사해 SNS나 커뮤니티에 바로 사용하세요.</p>
        </article>
      </section>

      <h2 className="section-title" style={{ fontFamily: "var(--font-display)" }}>
        지금 사용 가능한 밈
      </h2>
      <section className="grid two">
        {memes.map((meme) => (
          <article className="card" key={meme.slug}>
            <h3>{meme.title}</h3>
            <p className="muted">{meme.seo.summary}</p>
            <div className="button-row" style={{ marginTop: "0.75rem" }}>
              <Link className="btn btn-secondary" href={`/m/${meme.slug}`}>
                {meme.title} 페이지
              </Link>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
