"use client";

import { useState } from "react";

interface MemeGenerateFormProps {
  slug: string;
  placeholder: string;
}

export function MemeGenerateForm({ slug, placeholder }: MemeGenerateFormProps): React.JSX.Element {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">("idle");

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

      const data = (await response.json()) as { output?: string; error?: { message?: string } };
      if (!response.ok || !data.output) {
        setOutput("");
        setError(data.error?.message ?? "생성 중 오류가 발생했습니다.");
        return;
      }

      setOutput(data.output);
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
    <form className="card input-panel" onSubmit={onSubmit}>
      <label htmlFor="meme-input" className="label">
        변형할 문구
      </label>
      <textarea
        id="meme-input"
        className="textarea"
        value={input}
        placeholder={placeholder}
        onChange={(event) => setInput(event.target.value)}
        maxLength={300}
      />
      <div className="button-row">
        <button type="submit" className="btn btn-primary" disabled={isPending || input.trim().length === 0}>
          {isPending ? "생성 중..." : "변형 생성"}
        </button>
        <button type="button" className="btn btn-secondary" onClick={onCopy} disabled={!output}>
          결과 복사
        </button>
      </div>

      {error ? <p className="feedback error">{error}</p> : null}
      {copyState === "copied" ? <p className="feedback success">결과를 복사했습니다.</p> : null}
      {copyState === "failed" ? (
        <p className="feedback error">클립보드 복사에 실패했습니다. 결과를 수동으로 복사해 주세요.</p>
      ) : null}

      {output ? <div className="output-box">{output}</div> : null}
    </form>
  );
}
