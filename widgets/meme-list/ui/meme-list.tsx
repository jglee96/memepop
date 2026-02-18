import Link from "next/link";

import type { Meme } from "@/entities/meme/types";
import { Card, buttonVariants } from "@/shared/ui";
import { cn } from "@/shared/lib/cn";

interface MemeListProps {
  memes: ReadonlyArray<Meme>;
}

export function MemeList({ memes }: MemeListProps): React.JSX.Element {
  return (
    <main className="space-y-5">
      <header className="space-y-2">
        <h1 className="font-['Space_Grotesk','SUIT','Pretendard','Noto_Sans_KR',sans-serif] text-3xl text-slate-900 dark:text-slate-100">
          밈 목록
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          밈별 전용 URL로 이동해 설명, 예시, FAQ, 생성 기능을 바로 사용할 수 있습니다.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-2">
        {memes.map((meme) => (
          <Card key={meme.slug} className="flex h-full flex-col justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">{meme.title}</h2>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{meme.description.split("\n")[0]}</p>
              <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">키워드: {meme.seo.keywords.join(", ")}</p>
            </div>
            <Link href={`/m/${meme.slug}`} className={cn(buttonVariants({ variant: "default" }), "w-fit")}>
              {meme.title} 생성 페이지
            </Link>
          </Card>
        ))}
      </section>
    </main>
  );
}
