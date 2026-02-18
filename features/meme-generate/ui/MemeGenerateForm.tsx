"use client";

import { useId, useMemo, useState } from "react";

import { Button, Card, Label, Textarea } from "@/shared/ui";

interface MemeGenerateFormProps {
  slug: string;
  placeholder: string;
}

interface GenerateSuccessResponse {
  output?: string;
}

interface GenerateErrorResponse {
  error?: {
    message?: string;
  };
}

export function MemeGenerateForm({ slug, placeholder }: MemeGenerateFormProps): React.JSX.Element {
  const inputId = useId();
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">("idle");

  const isSubmitDisabled = useMemo(() => isPending || input.trim().length === 0, [input, isPending]);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();

    setError("");
    setCopyState("idle");
    setIsPending(true);

    try {
      const response = await fetch(`/api/generate/${slug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input })
      });

      const payload = (await parseResponse(response)) as GenerateSuccessResponse & GenerateErrorResponse;

      if (!response.ok || !payload.output) {
        setOutput("");
        setError(payload.error?.message ?? "생성 중 오류가 발생했습니다.");
        return;
      }

      setOutput(payload.output);
    } catch {
      setOutput("");
      setError("네트워크 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setIsPending(false);
    }
  }

  async function onCopy(): Promise<void> {
    if (!output) {
      return;
    }

    try {
      await navigator.clipboard.writeText(output);
      setCopyState("copied");
    } catch {
      setCopyState("failed");
    }
  }

  return (
    <Card className="space-y-4">
      <form className="space-y-4" onSubmit={onSubmit}>
        <div className="space-y-2">
          <Label htmlFor={inputId}>변형할 문구</Label>
          <Textarea
            id={inputId}
            value={input}
            placeholder={placeholder}
            onChange={(event) => setInput(event.target.value)}
            maxLength={300}
            aria-invalid={Boolean(error)}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <Button type="submit" disabled={isSubmitDisabled}>
            {isPending ? "생성 중..." : "변형 생성"}
          </Button>
          <Button type="button" variant="secondary" onClick={onCopy} disabled={!output}>
            결과 복사
          </Button>
        </div>
      </form>

      <div aria-live="polite" className="space-y-2 text-sm">
        {error ? <p className="text-rose-600 dark:text-rose-300">{error}</p> : null}
        {copyState === "copied" ? <p className="text-emerald-700 dark:text-emerald-300">결과를 복사했습니다.</p> : null}
        {copyState === "failed" ? (
          <p className="text-rose-600 dark:text-rose-300">클립보드 복사에 실패했습니다. 결과를 수동으로 복사해 주세요.</p>
        ) : null}
      </div>

      {output ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
          {output}
        </div>
      ) : null}
    </Card>
  );
}

async function parseResponse(response: Response): Promise<unknown> {
  try {
    return (await response.json()) as unknown;
  } catch {
    return {};
  }
}
