"use client";

import { useId, useMemo, useState } from "react";

import { MemeLikeButton } from "@/features/meme-like";
import { Button, Label, Textarea } from "@/shared/ui";

import { useGenerateSubmission } from "../hooks/useGenerateSubmission";
import type { MemeFormProps } from "./types";

export function EotteokharagoForm({ slug }: MemeFormProps): React.JSX.Element {
  const inputId = useId();
  const [input, setInput] = useState("");
  const { output, error, isPending, copyState, submit, copy } = useGenerateSubmission(slug);

  const isSubmitDisabled = useMemo(() => isPending || input.trim().length === 0, [input, isPending]);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    await submit({ input });
  }

  return (
    <section className="space-y-8">
      <form className="space-y-6" onSubmit={onSubmit}>
        <div className="space-y-3">
          <Label
            htmlFor={inputId}
            className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400"
          >
            문구 입력
          </Label>
          <Textarea
            id={inputId}
            value={input}
            placeholder="예: 배고프다고"
            onChange={(event) => setInput(event.target.value)}
            maxLength={300}
            aria-invalid={Boolean(error)}
            className="text-2xl leading-tight sm:text-3xl"
          />
        </div>

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
              onClick={copy}
              disabled={!output}
            >
              복사
            </Button>
          </div>
          <MemeLikeButton slug={slug} />
        </div>
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
