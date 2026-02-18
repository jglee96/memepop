import Link from "next/link";

import type { Meme } from "@/entities/meme/types";
import { Badge, Card, buttonVariants } from "@/shared/ui";
import { cn } from "@/shared/lib/cn";

interface HomeLandingProps {
  memes: ReadonlyArray<Meme>;
}

export function HomeLanding({ memes }: HomeLandingProps): React.JSX.Element {
  return (
    <main className="space-y-10">
      <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-50 via-white to-sky-100/70 p-8 shadow-sm dark:border-slate-800 dark:from-slate-900 dark:via-slate-900 dark:to-sky-950/40">
        <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-sky-300/25 blur-3xl dark:bg-sky-500/20" />
        <Badge className="mb-4">Stateless Meme SaaS</Badge>
        <h1 className="font-['Space_Grotesk','SUIT','Pretendard','Noto_Sans_KR',sans-serif] text-4xl leading-tight text-slate-900 sm:text-5xl dark:text-slate-50">
          유행 밈 문구를
          <br />
          내 상황에 맞게 리믹스
        </h1>
        <p className="mt-4 max-w-2xl text-base text-slate-600 dark:text-slate-300">
          MemePop은 밈별 전용 페이지에서 입력 문구를 해당 밈 톤으로 빠르게 변형합니다. 생성 결과는 저장하지 않고, 바로
          복사해 외부 플랫폼에 사용하는 구조입니다.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/memes" className={buttonVariants({ variant: "default", size: "lg" })}>
            밈 둘러보기
          </Link>
          <Link
            href="/m/eotteokharago"
            className={buttonVariants({ variant: "secondary", size: "lg", className: "backdrop-blur-sm" })}
          >
            첫 밈 써보기
          </Link>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-['Space_Grotesk','SUIT','Pretendard','Noto_Sans_KR',sans-serif] text-2xl text-slate-900 dark:text-slate-100">
          서비스 방식
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">1. 밈 선택</h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              밈별 canonical URL로 접근해 의미와 사용 맥락을 먼저 확인합니다.
            </p>
          </Card>
          <Card>
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">2. 문구 입력</h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              상황 문구를 넣으면 밈 톤에 맞는 발음/리듬 변형 리스트를 생성합니다.
            </p>
          </Card>
          <Card>
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">3. 즉시 복사</h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              결과는 저장되지 않습니다. 필요한 문구만 복사해 SNS나 커뮤니티에 바로 사용하세요.
            </p>
          </Card>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-['Space_Grotesk','SUIT','Pretendard','Noto_Sans_KR',sans-serif] text-2xl text-slate-900 dark:text-slate-100">
          지금 사용 가능한 밈
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          {memes.map((meme) => (
            <Card key={meme.slug} className="flex flex-col justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{meme.title}</h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{meme.seo.summary}</p>
              </div>
              <Link
                className={cn(buttonVariants({ variant: "secondary" }), "w-fit")}
                href={`/m/${meme.slug}`}
              >
                {meme.title} 페이지
              </Link>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}
