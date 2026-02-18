import type { PromptEnvelope } from "@/shared/security/promptPolicy";

const OPENAI_RESPONSES_API_URL = "https://api.openai.com/v1/responses";
const OPENAI_TIMEOUT_MS = 8_000;

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
    const response = await fetch(OPENAI_RESPONSES_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        temperature: 0.9,
        max_output_tokens: 220,
        instructions: envelope.systemPolicy,
        input: buildUserPrompt(envelope)
      }),
      signal: controller.signal
    });

    if (!response.ok) {
      return { ok: false, code: "OPENAI_REQUEST_FAILED" };
    }

    const payload = (await response.json()) as OpenAIResponsePayload;
    const outputText = extractOutputText(payload);
    if (!outputText) {
      return { ok: false, code: "OPENAI_EMPTY_OUTPUT" };
    }

    return {
      ok: true,
      output: outputText.replace(/\n+/g, ", ").replace(/\s+/g, " ").trim()
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

function buildUserPrompt(envelope: PromptEnvelope): string {
  return [
    `Meme style context: ${envelope.styleContext}`,
    `User input: ${envelope.userInput}`,
    "Return only one line of comma-separated Korean variants.",
    "Keep pronunciation close to the original input.",
    "Include at least 2 absurd playful variants with different literal meanings, similar in tone to '엉뜨켜라고' or '오픈카라고'.",
    "No explanation, no numbering, no markdown, no URLs."
  ].join("\n");
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
