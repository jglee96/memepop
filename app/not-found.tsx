import Link from "next/link";

import { Card, buttonVariants } from "@/shared/ui";

export default function NotFoundPage(): React.JSX.Element {
  return (
    <main>
      <Card className="max-w-xl">
        <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">페이지를 찾을 수 없습니다.</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          요청한 밈 slug가 등록되어 있지 않거나 주소가 잘못되었습니다.
        </p>
        <Link href="/memes" className={`${buttonVariants({ variant: "default" })} mt-4 w-fit`}>
          밈 목록으로 이동
        </Link>
      </Card>
    </main>
  );
}
