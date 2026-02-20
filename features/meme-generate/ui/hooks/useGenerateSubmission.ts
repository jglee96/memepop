"use client";

import { useState } from "react";

interface GenerateSuccessResponse {
  output?: string;
}

interface GenerateErrorResponse {
  error?: {
    message?: string;
  };
}

export function useGenerateSubmission(slug: string): {
  output: string;
  error: string;
  isPending: boolean;
  copyState: "idle" | "copied" | "failed";
  submit: (payload: unknown) => Promise<void>;
  copy: () => Promise<void>;
} {
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">("idle");

  async function submit(payload: unknown): Promise<void> {
    setError("");
    setCopyState("idle");
    setIsPending(true);

    try {
      const response = await fetch(`/api/generate/${slug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const parsedPayload = (await parseResponse(response)) as GenerateSuccessResponse & GenerateErrorResponse;
      if (!response.ok || !parsedPayload.output) {
        setOutput("");
        setError(parsedPayload.error?.message ?? "생성 중 오류가 발생했습니다.");
        return;
      }

      setOutput(parsedPayload.output);
    } catch {
      setOutput("");
      setError("네트워크 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setIsPending(false);
    }
  }

  async function copy(): Promise<void> {
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

  return {
    output,
    error,
    isPending,
    copyState,
    submit,
    copy
  };
}

async function parseResponse(response: Response): Promise<unknown> {
  try {
    return (await response.json()) as unknown;
  } catch {
    return {};
  }
}
