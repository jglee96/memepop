import type { Meme } from "@/entities/meme/types";
import { Badge, Card } from "@/shared/ui";

interface MemeDetailContentProps {
  meme: Meme;
  form: React.ReactNode;
}

export function MemeDetailContent({ meme, form }: MemeDetailContentProps): React.JSX.Element {
  return (
    <main className="space-y-4">
      <header className="space-y-3">
        <Badge>Meme Landing</Badge>
        <h1 className="font-['Space_Grotesk','SUIT','Pretendard','Noto_Sans_KR',sans-serif] text-3xl text-slate-900 dark:text-slate-100">
          {meme.title}
        </h1>
        <p className="whitespace-pre-line text-sm leading-6 text-slate-600 dark:text-slate-300">{meme.description}</p>
      </header>

      {form}

      <section className="grid gap-4 md:grid-cols-2">
        <Card>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">이 밈은 언제 쓰나요?</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-600 dark:text-slate-300">
            {meme.useCases.map((useCase) => (
              <li key={useCase}>{useCase}</li>
            ))}
          </ul>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">좋은 입력 예시</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-600 dark:text-slate-300">
            {meme.examples.map((example) => (
              <li key={example}>{example}</li>
            ))}
          </ul>
        </Card>
      </section>

      <Card>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">금지/주의</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-600 dark:text-slate-300">
          <li>개인정보, 계정정보, 연락처, 금전 요구 표현은 입력하지 마세요.</li>
          <li>특정 집단 비하나 폭력/위협 표현은 차단됩니다.</li>
          <li>URL, 코드블록, 프롬프트 우회 지시는 생성 요청에서 거부됩니다.</li>
        </ul>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">FAQ</h2>
        <ul className="mt-3 space-y-3 text-sm text-slate-600 dark:text-slate-300">
          {meme.faq.map((entry) => (
            <li key={entry.q}>
              <p className="font-semibold text-slate-800 dark:text-slate-100">{entry.q}</p>
              <p className="mt-1">{entry.a}</p>
            </li>
          ))}
        </ul>
      </Card>
    </main>
  );
}
