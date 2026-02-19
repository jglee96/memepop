import { NextRequest, NextResponse } from "next/server";

import { getMemeBySlug, isKnownSlug } from "@/entities/meme";
import { generateMemeWithOpenAI, generateRequestSchema } from "@/features/meme-generate";
import { sha256 } from "@/shared/lib/hash";
import { consumeRateLimit } from "@/shared/lib/rateLimit";
import { buildPromptEnvelope, sanitizeOutput, validateUserInput } from "@/shared/security";

interface RouteParams {
  params: Promise<{ slug: string }>;
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest, { params }: RouteParams): Promise<NextResponse> {
  const { slug } = await params;

  if (!isKnownSlug(slug)) {
    return errorResponse(404, "UNKNOWN_SLUG", "존재하지 않는 밈입니다.");
  }

  const body = await parseBody(request);
  if (!body) {
    return errorResponse(400, "INVALID_JSON", "요청 본문이 올바른 JSON 형식이 아닙니다.");
  }

  const parsed = generateRequestSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(400, "INVALID_INPUT", parsed.error.issues[0]?.message ?? "입력값이 올바르지 않습니다.");
  }

  const validation = validateUserInput(parsed.data.input);
  if (!validation.ok) {
    securityLog("BLOCKED_INPUT", {
      slug,
      code: validation.code,
      riskScore: validation.riskScore,
      length: parsed.data.input.length
    });
    return errorResponse(400, validation.code, validation.message);
  }

  const inputHash = sha256(validation.sanitized);
  const rateLimitKey = `${extractClientIp(request)}:${slug}`;
  const limitResult = consumeRateLimit(rateLimitKey, inputHash);
  if (!limitResult.allowed) {
    securityLog("RATE_LIMIT_BLOCK", {
      slug,
      reason: limitResult.reason,
      retryAfterMs: limitResult.retryAfterMs
    });
    return errorResponse(
      429,
      limitResult.reason,
      "요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.",
      limitResult.retryAfterMs
    );
  }

  const meme = getMemeBySlug(slug);
  if (!meme) {
    return errorResponse(404, "UNKNOWN_SLUG", "존재하지 않는 밈입니다.");
  }

  const promptEnvelope = buildPromptEnvelope({
    memeSlug: meme.slug,
    memeTitle: meme.title,
    memeInstructions: meme.template.instructions,
    styleExamples: meme.examples,
    userInput: validation.sanitized
  });

  const llmResult = await generateMemeWithOpenAI(promptEnvelope);
  if (!llmResult.ok) {
    securityLog("OPENAI_GENERATION_FAILED", {
      slug,
      code: llmResult.code,
      inputLength: validation.sanitized.length
    });
    return errorResponse(
      503,
      llmResult.code,
      "지금은 생성 모델을 사용할 수 없습니다. 잠시 후 다시 시도해 주세요."
    );
  }

  const safeOutput = sanitizeOutput(llmResult.output);
  if (!safeOutput.ok) {
    securityLog("BLOCKED_OUTPUT", {
      slug,
      code: safeOutput.code,
      inputLength: validation.sanitized.length
    });
    return errorResponse(400, safeOutput.code, safeOutput.message);
  }

  return NextResponse.json(
    { output: safeOutput.output },
    {
      status: 200,
      headers: {
        "Cache-Control": "no-store",
        "X-Generation-Source": "llm"
      }
    }
  );
}

async function parseBody(request: NextRequest): Promise<unknown | null> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

function extractClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() ?? "unknown";
  }
  const realIp = request.headers.get("x-real-ip");
  return realIp ?? "unknown";
}

function errorResponse(
  status: number,
  code: string,
  message: string,
  retryAfterMs?: number
): NextResponse {
  return NextResponse.json(
    {
      error: {
        code,
        message
      }
    },
    {
      status,
      headers: retryAfterMs
        ? {
            "Retry-After": String(Math.ceil(retryAfterMs / 1000)),
            "Cache-Control": "no-store"
          }
        : {
            "Cache-Control": "no-store"
          }
    }
  );
}

function securityLog(event: string, payload: Record<string, number | string>): void {
  console.warn(JSON.stringify({ event, ...payload }));
}
