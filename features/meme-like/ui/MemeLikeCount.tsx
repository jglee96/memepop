"use client";

import { useEffect, useState } from "react";

interface MemeLikeCountProps {
  slug: string;
}

interface LikeCountResponse {
  count?: number;
}

export function MemeLikeCount({ slug }: MemeLikeCountProps): React.JSX.Element {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const response = await fetch(`/api/likes/${slug}`, {
          cache: "no-store"
        });
        const payload = (await parseResponse(response)) as LikeCountResponse;
        if (!response.ok || typeof payload.count !== "number") {
          return;
        }
        if (!cancelled) {
          setCount(payload.count);
        }
      } catch {
        // ignore count fetch failures to avoid blocking page render
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [slug]);

  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-slate-300/90 px-2 py-0.5 text-[11px] font-semibold tabular-nums tracking-[0.06em] text-slate-600 dark:border-slate-600 dark:text-slate-300">
      <span aria-hidden>♥</span>
      <span>{count ?? 0}</span>
    </span>
  );
}

async function parseResponse(response: Response): Promise<unknown> {
  try {
    return (await response.json()) as unknown;
  } catch {
    return {};
  }
}
