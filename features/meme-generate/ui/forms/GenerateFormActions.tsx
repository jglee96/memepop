"use client";

import type { ReactNode } from "react";

import { Button } from "@/shared/ui";

interface GenerateFormActionsProps {
  isPending: boolean;
  isSubmitDisabled: boolean;
  hasOutput: boolean;
  onCopy: () => void;
  rightSlot?: ReactNode;
}

export function GenerateFormActions({
  isPending,
  isSubmitDisabled,
  hasOutput,
  onCopy,
  rightSlot
}: GenerateFormActionsProps): React.JSX.Element {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="flex flex-wrap gap-3">
        <Button
          type="submit"
          variant="secondary"
          size="sm"
          className="border-slate-400/90 bg-transparent px-5 text-[11px] font-semibold uppercase tracking-[0.18em] hover:bg-slate-900 hover:text-white dark:border-slate-500 dark:hover:bg-slate-100 dark:hover:text-slate-900"
          disabled={isSubmitDisabled}
        >
          {isPending ? "생성 중..." : "생성"}
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="border-slate-400/90 bg-transparent px-5 text-[11px] font-semibold uppercase tracking-[0.18em] hover:bg-slate-900 hover:text-white dark:border-slate-500 dark:hover:bg-slate-100 dark:hover:text-slate-900"
          onClick={onCopy}
          disabled={!hasOutput}
        >
          복사
        </Button>
      </div>
      {rightSlot ?? null}
    </div>
  );
}
