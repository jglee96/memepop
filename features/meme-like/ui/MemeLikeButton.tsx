"use client";

import { useEffect, useState } from "react";

import { Button } from "@/shared/ui";

interface MemeLikeButtonProps {
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

export function MemeLikeButton({ slug }: MemeLikeButtonProps): React.JSX.Element {
  const [count, setCount] = useState(0);
  const [displayCount, setDisplayCount] = useState(0);
  const [spinToken, setSpinToken] = useState(0);
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
          setDisplayCount(payload.count);
        }
      } catch {
        // ignore count fetch errors
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [slug]);

  async function onLike(): Promise<void> {
    if (isPending) {
      return;
    }

    const previousCount = count;
    const optimisticCount = previousCount + 1;

    setIsPending(true);
    setMessage("");
    setCount(optimisticCount);
    spinTo(optimisticCount);

    try {
      const response = await fetch(`/api/likes/${slug}`, {
        method: "POST",
        cache: "no-store"
      });
      const payload = (await parseResponse(response)) as LikeSuccessResponse & LikeErrorResponse;

      if (!response.ok || typeof payload.count !== "number") {
        setCount(previousCount);
        spinTo(previousCount);
        setMessage(payload.error?.message ?? "좋아요 처리 중 오류가 발생했습니다.");
        return;
      }

      setCount(payload.count);
      if (payload.count !== optimisticCount) {
        spinTo(payload.count);
      }
    } catch {
      setCount(previousCount);
      spinTo(previousCount);
      setMessage("네트워크 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setIsPending(false);
    }
  }

  function spinTo(next: number): void {
    setDisplayCount(next);
    setSpinToken((token) => token + 1);
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        type="button"
        variant="secondary"
        size="sm"
        className="border-slate-400/90 bg-transparent px-5 text-[11px] font-semibold uppercase tracking-[0.16em] hover:bg-slate-900 hover:text-white dark:border-slate-500 dark:hover:bg-slate-100 dark:hover:text-slate-900"
        onClick={onLike}
        disabled={isPending}
      >
        <span className="inline-flex items-center gap-2">
          <span aria-hidden>♥</span>
          <span>좋아요</span>
          <SlotNumber value={displayCount} spinToken={spinToken} />
        </span>
      </Button>
      {message ? <p className="max-w-52 text-right text-[11px] font-medium tracking-wide text-slate-600 dark:text-slate-300">{message}</p> : null}
    </div>
  );
}

interface SlotNumberProps {
  value: number;
  spinToken: number;
}

function SlotNumber({ value, spinToken }: SlotNumberProps): React.JSX.Element {
  const safeValue = Math.max(0, value);
  const digits = String(safeValue).split("").map((digit) => Number(digit));

  return (
    <span className="inline-flex min-w-8 justify-end tabular-nums" aria-live="polite">
      {digits.map((digit, index) => (
        <SlotDigit key={`${index}-${digit}-${spinToken}`} digit={digit} index={index} spinToken={spinToken} />
      ))}
    </span>
  );
}

interface SlotDigitProps {
  digit: number;
  index: number;
  spinToken: number;
}

function SlotDigit({ digit, index, spinToken }: SlotDigitProps): React.JSX.Element {
  const [offset, setOffset] = useState(0);
  const turns = 3 + index + ((spinToken + index * 3) % 2);
  const end = turns * 10 + digit;
  const sequence = Array.from({ length: end + 1 }, (_, i) => i % 10);

  useEffect(() => {
    const rafId = window.requestAnimationFrame(() => {
      setOffset(end);
    });

    return () => {
      window.cancelAnimationFrame(rafId);
    };
  }, [end]);

  return (
    <span className="inline-flex h-[1em] w-[0.72em] overflow-hidden leading-none">
      <span
        className="inline-flex flex-col transition-transform duration-700 [transition-timing-function:cubic-bezier(0.12,0.82,0.22,1)]"
        style={{ transform: `translateY(-${offset}em)` }}
      >
        {sequence.map((valueAtStep, idx) => (
          <span key={idx} className="h-[1em] leading-none">
            {valueAtStep}
          </span>
        ))}
      </span>
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
