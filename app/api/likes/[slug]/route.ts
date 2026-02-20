import { NextRequest, NextResponse } from "next/server";

import { isKnownSlug } from "@/entities/meme";
import { consumeMemeLike, getMemeLikeCount } from "@/shared/lib/memeLikeStore";

interface RouteParams {
  params: Promise<{ slug: string }>;
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_request: NextRequest, { params }: RouteParams): Promise<NextResponse> {
  const { slug } = await params;
  if (!isKnownSlug(slug)) {
    return errorResponse(404, "UNKNOWN_SLUG", "존재하지 않는 밈입니다.");
  }

  return NextResponse.json(
    {
      slug,
      count: await getMemeLikeCount(slug)
    },
    {
      status: 200,
      headers: {
        "Cache-Control": "no-store"
      }
    }
  );
}

export async function POST(request: NextRequest, { params }: RouteParams): Promise<NextResponse> {
  const { slug } = await params;
  if (!isKnownSlug(slug)) {
    return errorResponse(404, "UNKNOWN_SLUG", "존재하지 않는 밈입니다.");
  }

  const result = await consumeMemeLike({
    slug,
    clientIp: extractClientIp(request)
  });

  if (!result.allowed) {
    return errorResponse(
      429,
      "LIKE_COOLDOWN",
      "같은 IP에서는 24시간 동안 동일 밈에 1회만 좋아요할 수 있습니다.",
      result.retryAfterMs
    );
  }

  return NextResponse.json(
    {
      slug,
      count: result.count
    },
    {
      status: 200,
      headers: {
        "Cache-Control": "no-store"
      }
    }
  );
}

function extractClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() ?? "unknown";
  }
  const realIp = request.headers.get("x-real-ip");
  return realIp ?? "unknown";
}

function errorResponse(status: number, code: string, message: string, retryAfterMs?: number): NextResponse {
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
            "Cache-Control": "no-store",
            "Retry-After": String(Math.ceil(retryAfterMs / 1000))
          }
        : {
            "Cache-Control": "no-store"
          }
    }
  );
}
