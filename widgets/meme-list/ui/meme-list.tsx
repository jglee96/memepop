import Link from "next/link";

import type { Meme } from "@/entities/meme";
import { MemeLikeCount } from "@/features/meme-like";

interface MemeListProps {
  memes: ReadonlyArray<Meme>;
}

export function MemeList({ memes }: MemeListProps): React.JSX.Element {
  return (
    <main className="space-y-10 pb-6">
      <header className="border-y border-slate-300/80 py-8 dark:border-slate-700/80">
        <h1 className="font-['Space_Grotesk','SUIT','Pretendard','Noto_Sans_KR',sans-serif] text-5xl tracking-tight sm:text-6xl">Memes</h1>
      </header>
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
                <span className="block pt-1 text-[11px] font-medium tracking-[0.08em] text-slate-500 dark:text-slate-400">
                  좋아요 <MemeLikeCount slug={meme.slug} />
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
