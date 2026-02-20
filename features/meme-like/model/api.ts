interface LikeSuccessResponse {
  count?: number;
}

interface LikeErrorResponse {
  error?: {
    message?: string;
  };
}

export async function fetchLikeCount(slug: string): Promise<number | null> {
  try {
    const response = await fetch(`/api/likes/${slug}`, {
      cache: "no-store"
    });
    const payload = (await parseResponse(response)) as LikeSuccessResponse;
    if (!response.ok || typeof payload.count !== "number") {
      return null;
    }
    return payload.count;
  } catch {
    return null;
  }
}

export async function submitLike(slug: string): Promise<
  | { ok: true; count: number }
  | {
      ok: false;
      message: string;
    }
> {
  try {
    const response = await fetch(`/api/likes/${slug}`, {
      method: "POST",
      cache: "no-store"
    });
    const payload = (await parseResponse(response)) as LikeSuccessResponse & LikeErrorResponse;

    if (!response.ok || typeof payload.count !== "number") {
      return {
        ok: false,
        message: payload.error?.message ?? "좋아요 처리 중 오류가 발생했습니다."
      };
    }

    return {
      ok: true,
      count: payload.count
    };
  } catch {
    return {
      ok: false,
      message: "네트워크 오류가 발생했습니다. 잠시 후 다시 시도해 주세요."
    };
  }
}

async function parseResponse(response: Response): Promise<unknown> {
  try {
    return (await response.json()) as unknown;
  } catch {
    return {};
  }
}
