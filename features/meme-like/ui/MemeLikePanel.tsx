"use client";

import { useEffect, useState } from "react";

import { Button } from "@/shared/ui";

interface MemeLikePanelProps {
  slug: string;
}

interface LikeSuccessResponse {
  count?: number;
}

interface LikeErrorResponse {
  error?: {
    message?: string;
  };
}

export function MemeLikePanel({ slug }: MemeLikePanelProps): React.JSX.Element {
  const [count, setCount] = useState(0);
  const [isPending, setIsPending] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const response = await fetch(`/api/likes/${slug}`, {
          cache: "no-store"
        });
        const payload = (await parseResponse(response)) as LikeSuccessResponse;
        if (!response.ok || typeof payload.count !== "number") {
          return;
        }
        if (!cancelled) {
          setCount(payload.count);
        }
      } catch {
        // ignore initial fetch errors
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [slug]);

  async function onLike(): Promise<void> {
    setIsPending(true);
    setMessage("");

    try {
      const response = await fetch(`/api/likes/${slug}`, {
        method: "POST",
        cache: "no-store"
      });

      const payload = (await parseResponse(response)) as LikeSuccessResponse & LikeErrorResponse;
      if (!response.ok || typeof payload.count !== "number") {
        setMessage(payload.error?.message ?? "좋아요 처리 중 오류가 발생했습니다.");
        return;
      }

      setCount(payload.count);
      setMessage("좋아요가 반영되었습니다.");
    } catch {
      setMessage("네트워크 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <section className="space-y-3 border-y border-slate-300/80 py-4 dark:border-slate-700/80">
      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="border-slate-400/90 bg-transparent px-5 text-[11px] font-semibold uppercase tracking-[0.18em] hover:bg-slate-900 hover:text-white dark:border-slate-500 dark:hover:bg-slate-100 dark:hover:text-slate-900"
          onClick={onLike}
          disabled={isPending}
        >
          {isPending ? "처리 중..." : "좋아요"}
        </Button>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-600 dark:text-slate-300">좋아요 {count}</p>
      </div>
      {message ? <p className="text-xs font-medium tracking-wide text-slate-600 dark:text-slate-300">{message}</p> : null}
    </section>
  );
}

async function parseResponse(response: Response): Promise<unknown> {
  try {
    return (await response.json()) as unknown;
  } catch {
    return {};
  }
}
