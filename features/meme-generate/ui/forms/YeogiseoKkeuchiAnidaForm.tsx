"use client";

import { useId, useMemo, useState } from "react";

import { WORD_COUNT_DEFAULT, WORD_COUNT_MAX, WORD_COUNT_MIN } from "@/shared/config";
import { Label, Textarea } from "@/shared/ui";

import { useGenerateSubmission } from "../hooks/useGenerateSubmission";
import { GenerateFormActions } from "./GenerateFormActions";
import type { MemeFormProps } from "./types";

export function YeogiseoKkeuchiAnidaForm({ slug, actionRightSlot }: MemeFormProps): React.JSX.Element {
  const topicId = useId();
  const wordCountId = useId();
  const [topic, setTopic] = useState("");
  const [wordCountInput, setWordCountInput] = useState(String(WORD_COUNT_DEFAULT));
  const { output, error, isPending, copyState, submit, copy } = useGenerateSubmission(slug);

  const isSubmitDisabled = useMemo(() => isPending || topic.trim().length === 0, [topic, isPending]);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    const resolvedWordCount = normalizeWordCountInput(wordCountInput);

    await submit({
      topic,
      wordCount: resolvedWordCount
    });

    setWordCountInput(String(resolvedWordCount));
  }

  return (
    <section className="space-y-8">
      <form className="space-y-6" onSubmit={onSubmit}>
        <div className="space-y-3">
          <Label
            htmlFor={topicId}
            className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400"
          >
            주제 상황
          </Label>
          <Textarea
            id={topicId}
            value={topic}
            placeholder="예: 청소를 시작했는데 점점 과한 단계로 폭주하는 상황"
            onChange={(event) => setTopic(event.target.value)}
            maxLength={300}
            aria-invalid={Boolean(error)}
            className="text-2xl leading-tight sm:text-3xl"
          />
        </div>

        <div className="space-y-3">
          <Label
            htmlFor={wordCountId}
            className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400"
          >
            단어 길이
          </Label>
          <input
            id={wordCountId}
            type="number"
            min={WORD_COUNT_MIN}
            max={WORD_COUNT_MAX}
            step={1}
            value={wordCountInput}
            onChange={(event) => setWordCountInput(event.target.value)}
            onBlur={() => setWordCountInput(String(normalizeWordCountInput(wordCountInput)))}
            className="w-full border-b border-slate-300/90 bg-transparent px-0 pb-2 pt-1 text-xl leading-tight transition-colors focus-visible:border-slate-900 focus-visible:outline-none dark:border-slate-700/90 dark:focus-visible:border-slate-100 sm:text-2xl"
          />
          <p className="text-xs text-slate-500 dark:text-slate-400">
            기본값 {WORD_COUNT_DEFAULT}개, 최소 {WORD_COUNT_MIN}개, 최대 {WORD_COUNT_MAX}개
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

function clampWordCount(value: number): number {
  if (!Number.isFinite(value)) {
    return WORD_COUNT_DEFAULT;
  }

  const rounded = Math.round(value);
  return Math.min(WORD_COUNT_MAX, Math.max(WORD_COUNT_MIN, rounded));
}

function normalizeWordCountInput(value: string): number {
  if (!value.trim()) {
    return WORD_COUNT_DEFAULT;
  }

  return clampWordCount(Number(value));
}
