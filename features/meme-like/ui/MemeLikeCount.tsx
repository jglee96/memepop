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

  return <>{count ?? 0}</>;
}

async function parseResponse(response: Response): Promise<unknown> {
  try {
    return (await response.json()) as unknown;
  } catch {
    return {};
  }
}
