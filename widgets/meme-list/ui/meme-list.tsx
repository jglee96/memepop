import Link from "next/link";

import type { Meme } from "@/entities/meme";

interface MemeListProps {
  memes: ReadonlyArray<Meme>;
  likeCounts: Readonly<Record<string, number>>;
}

export function MemeList({ memes, likeCounts }: MemeListProps): React.JSX.Element {
  return (
    <main className="space-y-10 pb-6">
      <header className="py-8">
        <h1 className="font-['Space_Grotesk','SUIT','Pretendard','Noto_Sans_KR',sans-serif] text-5xl tracking-tight sm:text-6xl">Memes</h1>
      </header>
      <ul className="divide-y divide-slate-300/80 border-y border-slate-300/80 dark:divide-slate-700/80 dark:border-slate-700/80">
        {memes.map((meme) => (
          <li key={meme.slug} className="py-4">
            <Link href={`/m/${meme.slug}`} className="group flex items-end justify-between gap-3">
              <span className="font-['Space_Grotesk','SUIT','Pretendard','Noto_Sans_KR',sans-serif] text-2xl tracking-tight transition-transform duration-200 group-hover:translate-x-1 sm:text-3xl">
                {meme.title}
              </span>
              <span className="flex flex-col items-end gap-1 text-right">
                <span className="block text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500 transition-colors group-hover:text-slate-900 dark:text-slate-400 dark:group-hover:text-slate-100">
                  /m/{meme.slug}
                </span>
                <span className="block text-[11px] font-medium tracking-[0.08em] text-slate-500 dark:text-slate-400">
                  {meme.addedAt}
                </span>
                <span
                  aria-label={`좋아요 ${likeCounts[meme.slug] ?? 0}`}
                  className="inline-flex items-center gap-1.5 rounded-full border border-slate-400/90 bg-transparent px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-700 transition-colors group-hover:border-slate-900 group-hover:text-slate-900 dark:border-slate-500 dark:text-slate-300 dark:group-hover:border-slate-100 dark:group-hover:text-slate-100"
                >
                  <span aria-hidden>♥</span>
                  <span className="tabular-nums">좋아요 {likeCounts[meme.slug] ?? 0}</span>
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
