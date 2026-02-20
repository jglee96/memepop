"use client";

import { useId, useMemo, useState } from "react";

import { Label, Textarea } from "@/shared/ui";

import { useGenerateSubmission } from "../hooks/useGenerateSubmission";
import { GenerateFormActions } from "./GenerateFormActions";
import type { MemeFormProps } from "./types";

export function EotteokharagoForm({ slug, actionRightSlot }: MemeFormProps): React.JSX.Element {
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
