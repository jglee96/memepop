import Link from "next/link";

import { ThemeToggle } from "@/shared/ui";

export function SiteHeader(): React.JSX.Element {
  return (
    <header className="sticky top-0 z-10 mb-8 rounded-2xl border border-slate-200/80 bg-white/80 px-4 py-3 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/70">
      <div className="flex items-center justify-between gap-3">
        <Link
          href="/"
          className="font-['Space_Grotesk','SUIT','Pretendard','Noto_Sans_KR',sans-serif] text-base font-bold tracking-tight text-slate-900 dark:text-slate-100"
        >
          MemePop
        </Link>
        <div className="flex items-center gap-1 text-sm text-slate-600 dark:text-slate-300">
          <Link
            href="/memes"
            className="rounded-full px-3 py-2 transition hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            밈 목록
          </Link>
          <Link
            href="/m/eotteokharago"
            className="rounded-full px-3 py-2 transition hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            첫 밈
          </Link>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
