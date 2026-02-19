import Link from "next/link";

import { ThemeToggle } from "@/shared/ui";

export function SiteHeader(): React.JSX.Element {
  return (
    <header className="mb-12 border-b border-slate-300/80 pb-5 dark:border-slate-700/80">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link
          href="/"
          className="font-['Space_Grotesk','SUIT','Pretendard','Noto_Sans_KR',sans-serif] text-sm font-bold uppercase tracking-[0.28em]"
        >
          MemePop
        </Link>
        <div className="flex items-center gap-4 text-[11px] font-semibold uppercase tracking-[0.2em]">
          <Link href="/memes" className="transition-opacity hover:opacity-60">
            밈 목록
          </Link>
          <Link href="/faq" className="transition-opacity hover:opacity-60">
            FAQ
          </Link>
          <Link href="/m/eotteokharago" className="transition-opacity hover:opacity-60">
            첫 밈
          </Link>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
