"use client";

import { useId, useMemo, useState } from "react";

import {
  NESTING_COUNT_DEFAULT,
  NESTING_COUNT_MAX,
  NESTING_COUNT_MIN
} from "@/shared/config";
import { Label } from "@/shared/ui";

import { useGenerateSubmission } from "../hooks/useGenerateSubmission";
import { GenerateFormActions } from "./GenerateFormActions";
import type { MemeFormProps } from "./types";

export function HaebyeongJungcheopUimunmunForm({ slug, actionRightSlot }: MemeFormProps): React.JSX.Element {
  const nestingCountId = useId();
  const [nestingCountInput, setNestingCountInput] = useState(String(NESTING_COUNT_DEFAULT));
  const { output, error, isPending, copyState, submit, copy } = useGenerateSubmission(slug);

  const isSubmitDisabled = useMemo(() => isPending, [isPending]);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    const resolvedNestingCount = normalizeNestingCountInput(nestingCountInput);

    await submit({
      nestingCount: resolvedNestingCount
    });

    setNestingCountInput(String(resolvedNestingCount));
  }

  return (
    <section className="space-y-8">
      <form className="space-y-6" onSubmit={onSubmit}>
        <div className="space-y-3">
          <Label
            htmlFor={nestingCountId}
            className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400"
          >
            중첩 횟수 (n)
          </Label>
          <input
            id={nestingCountId}
            type="number"
            min={NESTING_COUNT_MIN}
            max={NESTING_COUNT_MAX}
            step={1}
            value={nestingCountInput}
            onChange={(event) => setNestingCountInput(event.target.value)}
            onBlur={() => setNestingCountInput(String(normalizeNestingCountInput(nestingCountInput)))}
            className="w-full border-b border-slate-300/90 bg-transparent px-0 pb-2 pt-1 text-xl leading-tight transition-colors focus-visible:border-slate-900 focus-visible:outline-none dark:border-slate-700/90 dark:focus-visible:border-slate-100 sm:text-2xl"
          />
          <p className="text-xs text-slate-500 dark:text-slate-400">
            기본값 {NESTING_COUNT_DEFAULT}회, 최소 {NESTING_COUNT_MIN}회, 최대 {NESTING_COUNT_MAX}회
          </p>
        </div>

        <GenerateFormActions
          isPending={isPending}
          isSubmitDisabled={isSubmitDisabled}
          hasOutput={Boolean(output)}
          onCopy={() => {
            void copy();
          }}
          rightSlot={actionRightSlot}
        />
      </form>

      <div aria-live="polite" className="space-y-1 text-xs font-medium tracking-wide text-slate-600 dark:text-slate-300">
        {error ? <p>{error}</p> : null}
        {copyState === "copied" ? <p>복사됨</p> : null}
        {copyState === "failed" ? <p>복사 실패</p> : null}
      </div>

      {output ? (
        <section className="space-y-3 border-t border-slate-300/80 pt-5 dark:border-slate-700/80">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Output</p>
          <p className="whitespace-pre-wrap text-lg leading-relaxed sm:text-xl">{output}</p>
        </section>
      ) : null}
    </section>
  );
}

function clampNestingCount(value: number): number {
  if (!Number.isFinite(value)) {
    return NESTING_COUNT_DEFAULT;
  }

  const rounded = Math.round(value);
  return Math.min(NESTING_COUNT_MAX, Math.max(NESTING_COUNT_MIN, rounded));
}

function normalizeNestingCountInput(value: string): number {
  if (!value.trim()) {
    return NESTING_COUNT_DEFAULT;
  }

  return clampNestingCount(Number(value));
}
