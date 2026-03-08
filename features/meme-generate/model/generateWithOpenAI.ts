import { resolveMemeGenerationSlice } from "./strategies";
import type { PromptEnvelope } from "@/shared/security";

const OPENAI_RESPONSES_API_URL = "https://api.openai.com/v1/responses";
const OPENAI_TIMEOUT_MS = 30_000;

interface OpenAIContentItem {
  text?: string;
}

interface OpenAIOutputItem {
  content?: OpenAIContentItem[];
}

interface OpenAIResponsePayload {
  output_text?: string;
  output?: OpenAIOutputItem[];
}

export type OpenAIGenerationResult =
  | { ok: true; output: string }
  | {
      ok: false;
      code: "OPENAI_KEY_MISSING" | "OPENAI_TIMEOUT" | "OPENAI_REQUEST_FAILED" | "OPENAI_EMPTY_OUTPUT";
    };

export async function generateMemeWithOpenAI(envelope: PromptEnvelope): Promise<OpenAIGenerationResult> {
  const slice = resolveMemeGenerationSlice(envelope.memeSlug);
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    const fallback = buildFallbackOutput(slice, envelope);
    if (fallback) {
      return { ok: true, output: fallback };
    }
    return { ok: false, code: "OPENAI_KEY_MISSING" };
  }

  const model = process.env.OPENAI_MODEL ?? "gpt-4.1-mini";

  try {
    const firstAttempt = await requestGeneration({
      apiKey,
      model,
      envelope,
      strictMode: false
    });
    if (!firstAttempt.ok) {
      const fallback = buildFallbackOutput(slice, envelope);
      if (fallback) {
        return { ok: true, output: fallback };
      }
      return { ok: false, code: "OPENAI_REQUEST_FAILED" };
    }

    if (!firstAttempt.output) {
      const fallback = buildFallbackOutput(slice, envelope);
      if (fallback) {
        return { ok: true, output: fallback };
      }
      return { ok: false, code: "OPENAI_EMPTY_OUTPUT" };
    }

    const firstOutput = normalizeOutput(firstAttempt.output);
    const shouldRetry = slice.shouldRetry?.(envelope, firstOutput) ?? false;

    if (!shouldRetry) {
      return {
        ok: true,
        output: applyRepair(slice, envelope, firstOutput)
      };
    }

    if (slice.repairOutput) {
      return {
        ok: true,
        output: applyRepair(slice, envelope, firstOutput)
      };
    }

    let secondAttempt: RequestGenerationResult;
    try {
      secondAttempt = await requestGeneration({
        apiKey,
        model,
        envelope,
        strictMode: true
      });
    } catch {
      return {
        ok: true,
        output: applyRepair(slice, envelope, firstOutput)
      };
    }

    if (!secondAttempt.ok || !secondAttempt.output) {
      return {
        ok: true,
        output: applyRepair(slice, envelope, firstOutput)
      };
    }

    const secondOutput = normalizeOutput(secondAttempt.output);
    return {
      ok: true,
      output: applyRepair(slice, envelope, secondOutput)
    };
  } catch (error) {
    const fallback = buildFallbackOutput(slice, envelope);
    if (fallback) {
      return { ok: true, output: fallback };
    }

    if (error instanceof Error && error.name === "AbortError") {
      return { ok: false, code: "OPENAI_TIMEOUT" };
    }
    return { ok: false, code: "OPENAI_REQUEST_FAILED" };
  }
}

interface RequestGenerationInput {
  apiKey: string;
  model: string;
  envelope: PromptEnvelope;
  strictMode: boolean;
}

type RequestGenerationResult = { ok: true; output: string | null } | { ok: false };

async function requestGeneration(input: RequestGenerationInput): Promise<RequestGenerationResult> {
  const slice = resolveMemeGenerationSlice(input.envelope.memeSlug);
  const maxOutputTokens =
    slice.estimateMaxOutputTokens?.(input.envelope, input.strictMode) ??
    estimateDefaultMaxOutputTokens(input.envelope, input.strictMode);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), OPENAI_TIMEOUT_MS);

  try {
    const response = await fetch(OPENAI_RESPONSES_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${input.apiKey}`
      },
      body: JSON.stringify({
        model: input.model,
        temperature: input.strictMode ? 0.9 : 0.82,
        max_output_tokens: maxOutputTokens,
        instructions: input.envelope.systemPolicy,
        input: slice.buildPrompt(input.envelope, input.strictMode)
      }),
      signal: controller.signal
    });

    if (!response.ok) {
      return { ok: false };
    }

    const payload = (await response.json()) as OpenAIResponsePayload;
    return { ok: true, output: extractOutputText(payload) };
  } finally {
    clearTimeout(timeout);
  }
}

function normalizeOutput(output: string): string {
  return output.replace(/\n+/g, ", ").replace(/\s+/g, " ").trim();
}

function applyRepair(slice: ReturnType<typeof resolveMemeGenerationSlice>, envelope: PromptEnvelope, output: string): string {
  return slice.repairOutput?.(envelope, output) ?? output;
}

function buildFallbackOutput(
  slice: ReturnType<typeof resolveMemeGenerationSlice>,
  envelope: PromptEnvelope
): string | null {
  const fallback = slice.buildFallbackOutput?.(envelope);
  if (!fallback) {
    return null;
  }

  return normalizeOutput(fallback);
}

function estimateDefaultMaxOutputTokens(envelope: PromptEnvelope, strictMode: boolean): number {
  const length = Array.from(envelope.userInput.replace(/\s+/g, "")).length;
  const base = length <= 3 ? 260 : length <= 5 ? 300 : 340;
  return strictMode ? base + 60 : base;
}

function extractOutputText(payload: OpenAIResponsePayload): string | null {
  if (typeof payload.output_text === "string" && payload.output_text.trim().length > 0) {
    return payload.output_text.trim();
  }

  if (!Array.isArray(payload.output)) {
    return null;
  }

  const chunks = payload.output
    .flatMap((item) => item.content ?? [])
    .map((content) => content.text?.trim() ?? "")
    .filter(Boolean);

  if (chunks.length === 0) {
    return null;
  }

  return chunks.join(", ");
}
