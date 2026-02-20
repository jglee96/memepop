import Link from "next/link";

import type { Meme } from "@/entities/meme";

interface HomeLandingProps {
  memes: ReadonlyArray<Meme>;
}

export function HomeLanding({ memes }: HomeLandingProps): React.JSX.Element {
  return (
    <main className="space-y-16 pb-6">
      <section className="border-y border-slate-300/80 py-10 dark:border-slate-700/80">
        <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-slate-500 dark:text-slate-400">Meme Remix</p>
        <h1 className="mt-5 max-w-4xl font-['Space_Grotesk','SUIT','Pretendard','Noto_Sans_KR',sans-serif] text-5xl leading-[0.95] tracking-tight sm:text-7xl">
          문장을 밈처럼
          <br />
          비틀어.
        </h1>
        <div className="mt-8 flex flex-wrap gap-5 text-xs font-semibold uppercase tracking-[0.2em]">
          <Link href="/memes" className="transition-opacity hover:opacity-60">
            밈 둘러보기
          </Link>
          <Link href="/m/eotteokharago" className="transition-opacity hover:opacity-60">
            바로 시작
          </Link>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-[9rem_minmax(0,1fr)] md:gap-10">
        <h2 className="pt-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Routes</h2>
        <ul className="divide-y divide-slate-300/80 border-y border-slate-300/80 dark:divide-slate-700/80 dark:border-slate-700/80">
          {memes.map((meme) => (
            <li key={meme.slug} className="py-4">
              <Link href={`/m/${meme.slug}`} className="group flex items-end justify-between gap-3">
                <span className="font-['Space_Grotesk','SUIT','Pretendard','Noto_Sans_KR',sans-serif] text-2xl tracking-tight transition-transform duration-200 group-hover:translate-x-1 sm:text-3xl">
                  {meme.title}
                </span>
                <span className="text-right">
                  <span className="block text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500 transition-colors group-hover:text-slate-900 dark:text-slate-400 dark:group-hover:text-slate-100">
                    /m/{meme.slug}
                  </span>
                  <span className="block pt-1 text-[11px] font-medium tracking-[0.08em] text-slate-500 dark:text-slate-400">
                    {meme.addedAt}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
