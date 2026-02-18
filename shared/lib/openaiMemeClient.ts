import type { PromptEnvelope } from "@/shared/security/promptPolicy";
import {
  buildDefaultMemePrompt,
  buildEotteokharagoPrompt,
  shouldRetryEotteokharagoOutput
} from "@/shared/prompts";

const OPENAI_RESPONSES_API_URL = "https://api.openai.com/v1/responses";
const OPENAI_TIMEOUT_MS = 15_000;

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
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return { ok: false, code: "OPENAI_KEY_MISSING" };
  }

  const model = process.env.OPENAI_MODEL ?? "gpt-4.1-mini";
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), OPENAI_TIMEOUT_MS);

  try {
    const firstAttempt = await requestGeneration({
      apiKey,
      model,
      envelope,
      strictMode: false,
      signal: controller.signal
    });
    if (!firstAttempt.ok) {
      return { ok: false, code: "OPENAI_REQUEST_FAILED" };
    }

    if (!firstAttempt.output) {
      return { ok: false, code: "OPENAI_EMPTY_OUTPUT" };
    }

    const shouldRetry =
      envelope.memeSlug === "eotteokharago" &&
      shouldRetryEotteokharagoOutput(envelope.userInput, firstAttempt.output);

    if (!shouldRetry) {
      return {
        ok: true,
        output: normalizeOutput(firstAttempt.output)
      };
    }

    const secondAttempt = await requestGeneration({
      apiKey,
      model,
      envelope,
      strictMode: true,
      signal: controller.signal
    });

    if (!secondAttempt.ok || !secondAttempt.output) {
      return {
        ok: true,
        output: normalizeOutput(firstAttempt.output)
      };
    }

    return {
      ok: true,
      output: normalizeOutput(secondAttempt.output)
    };
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return { ok: false, code: "OPENAI_TIMEOUT" };
    }
    return { ok: false, code: "OPENAI_REQUEST_FAILED" };
  } finally {
    clearTimeout(timeout);
  }
}

interface RequestGenerationInput {
  apiKey: string;
  model: string;
  envelope: PromptEnvelope;
  strictMode: boolean;
  signal: AbortSignal;
}

type RequestGenerationResult = { ok: true; output: string | null } | { ok: false };

async function requestGeneration(input: RequestGenerationInput): Promise<RequestGenerationResult> {
  const maxOutputTokens = estimateMaxOutputTokens(input.envelope.userInput, input.strictMode);
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
      input: buildUserPrompt(input.envelope, input.strictMode)
    }),
    signal: input.signal
  });

  if (!response.ok) {
    return { ok: false };
  }

  const payload = (await response.json()) as OpenAIResponsePayload;
  return { ok: true, output: extractOutputText(payload) };
}

function buildUserPrompt(envelope: PromptEnvelope, strictMode: boolean): string {
  if (envelope.memeSlug === "eotteokharago") {
    return buildEotteokharagoPrompt(envelope, { strict: strictMode });
  }
  return buildDefaultMemePrompt(envelope);
}

function normalizeOutput(output: string): string {
  return output.replace(/\n+/g, ", ").replace(/\s+/g, " ").trim();
}
function estimateMaxOutputTokens(userInput: string, strictMode: boolean): number {
  const length = Array.from(userInput.replace(/\s+/g, "")).length;
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
