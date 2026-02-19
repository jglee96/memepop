import type { Meme } from "@/entities/meme/types";

interface MemeDetailContentProps {
  meme: Meme;
  form: React.ReactNode;
}

export function MemeDetailContent({ meme, form }: MemeDetailContentProps): React.JSX.Element {
  return (
    <main className="space-y-12 pb-6">
      <header className="border-y border-slate-300/80 py-8 dark:border-slate-700/80">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">/m/{meme.slug}</p>
        <h1 className="mt-4 font-['Space_Grotesk','SUIT','Pretendard','Noto_Sans_KR',sans-serif] text-5xl leading-[0.95] tracking-tight sm:text-7xl">
          {meme.title}
        </h1>
      </header>

      {form}
    </main>
  );
}
