import type { Meme } from "@/entities/meme/types";

interface MemeDetailContentProps {
  meme: Meme;
  form: React.ReactNode;
}

export function MemeDetailContent({ meme, form }: MemeDetailContentProps): React.JSX.Element {
  const descriptionParagraphs = meme.description.split("\n\n").filter(Boolean);

  return (
    <main className="space-y-12 pb-6">
      <header className="border-y border-slate-300/80 py-8 dark:border-slate-700/80">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">/m/{meme.slug}</p>
        <h1 className="mt-4 font-['Space_Grotesk','SUIT','Pretendard','Noto_Sans_KR',sans-serif] text-5xl leading-[0.95] tracking-tight sm:text-7xl">
          {meme.title}
        </h1>
      </header>

      <section className="space-y-4 border-t border-slate-300/80 pt-6 dark:border-slate-700/80">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">About</h2>
        <div className="space-y-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          {descriptionParagraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </section>

      <section className="space-y-4 border-t border-slate-300/80 pt-6 dark:border-slate-700/80">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Use Cases</h2>
        <ul className="space-y-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          {meme.useCases.map((useCase) => (
            <li key={useCase}>- {useCase}</li>
          ))}
        </ul>
      </section>

      {form}

      <section className="space-y-4 border-t border-slate-300/80 pt-6 dark:border-slate-700/80">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Samples</h2>
        <ul className="space-y-3">
          {meme.examples.map((example) => (
            <li key={example} className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
              {example}
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-4 border-t border-slate-300/80 pt-6 dark:border-slate-700/80">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">FAQ</h2>
        <dl className="space-y-3">
          {meme.faq.map((entry) => (
            <div key={entry.q} className="space-y-1">
              <dt className="text-sm font-semibold text-slate-900 dark:text-slate-100">{entry.q}</dt>
              <dd className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">{entry.a}</dd>
            </div>
          ))}
        </dl>
      </section>
    </main>
  );
}
