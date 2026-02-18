import Link from "next/link";

export default function NotFoundPage(): React.JSX.Element {
  return (
    <main className="space-y-6 py-6">
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">404</p>
      <h1 className="font-['Space_Grotesk','SUIT','Pretendard','Noto_Sans_KR',sans-serif] text-4xl tracking-tight sm:text-5xl">
        페이지를 찾을 수 없습니다.
      </h1>
      <Link href="/memes" className="text-sm font-semibold uppercase tracking-[0.18em] transition-opacity hover:opacity-60">
        밈 목록으로 이동
      </Link>
    </main>
  );
}
