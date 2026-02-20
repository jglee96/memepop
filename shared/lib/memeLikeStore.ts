import { Redis } from "@upstash/redis";

import { MEME_LIKE_COOLDOWN_MS } from "@/shared/config";
import { sha256 } from "@/shared/lib/hash";

interface LikeConsumeInput {
  slug: string;
  clientIp: string;
  isDevelopment?: boolean;
  now?: number;
}

interface LikeConsumeAllowed {
  allowed: true;
  count: number;
}

interface LikeConsumeBlocked {
  allowed: false;
  count: number;
  retryAfterMs: number;
}

export type LikeConsumeResult = LikeConsumeAllowed | LikeConsumeBlocked;

const likeCountsMemory = new Map<string, number>();
const likeHistoryMemory = new Map<string, number>();
const COOLDOWN_SECONDS = Math.ceil(MEME_LIKE_COOLDOWN_MS / 1000);

let redisClient: Redis | null | undefined;
let redisMissingWarningShown = false;

export async function consumeMemeLike(input: LikeConsumeInput): Promise<LikeConsumeResult> {
  const now = input.now ?? Date.now();
  const isDevelopment = input.isDevelopment ?? process.env.NODE_ENV === "development";
  const redis = getRedisClient();

  if (redis && !isDevelopment) {
    const limitKey = buildLikeLimitKey(input.slug, input.clientIp);
    const countKey = buildLikeCountKey(input.slug);
    const setResult = await redis.set(limitKey, now, {
      nx: true,
      ex: COOLDOWN_SECONDS
    });

    if (setResult !== "OK") {
      const [countValue, ttlSeconds] = await Promise.all([redis.get<number | string | null>(countKey), redis.ttl(limitKey)]);
      const count = toLikeCount(countValue);
      const retryAfterMs = ttlSeconds > 0 ? ttlSeconds * 1000 : MEME_LIKE_COOLDOWN_MS;
      return {
        allowed: false,
        count,
        retryAfterMs
      };
    }

    const count = await redis.incr(countKey);
    return {
      allowed: true,
      count
    };
  }

  return consumeMemeLikeInMemory(input, now, isDevelopment);
}

export async function getMemeLikeCount(slug: string): Promise<number> {
  const redis = getRedisClient();
  if (redis) {
    const value = await redis.get<number | string | null>(buildLikeCountKey(slug));
    return toLikeCount(value);
  }

  return likeCountsMemory.get(slug) ?? 0;
}

export async function getMemeLikeCounts(slugs: ReadonlyArray<string>): Promise<Record<string, number>> {
  const redis = getRedisClient();
  if (redis) {
    const entries = await Promise.all(
      slugs.map(async (slug) => {
        const count = await getMemeLikeCount(slug);
        return [slug, count] as const;
      })
    );
    return Object.fromEntries(entries);
  }

  return Object.fromEntries(slugs.map((slug) => [slug, likeCountsMemory.get(slug) ?? 0]));
}

export function resetMemeLikeStoreForTest(): void {
  likeCountsMemory.clear();
  likeHistoryMemory.clear();
}

function consumeMemeLikeInMemory(input: LikeConsumeInput, now: number, isDevelopment: boolean): LikeConsumeResult {
  pruneExpiredHistory(now);

  if (!isDevelopment) {
    const historyKey = `${input.slug}:${input.clientIp}`;
    const previousLikedAt = likeHistoryMemory.get(historyKey);
    if (typeof previousLikedAt === "number" && now - previousLikedAt < MEME_LIKE_COOLDOWN_MS) {
      return {
        allowed: false,
        count: likeCountsMemory.get(input.slug) ?? 0,
        retryAfterMs: MEME_LIKE_COOLDOWN_MS - (now - previousLikedAt)
      };
    }

    likeHistoryMemory.set(historyKey, now);
  }

  const nextCount = (likeCountsMemory.get(input.slug) ?? 0) + 1;
  likeCountsMemory.set(input.slug, nextCount);

  return {
    allowed: true,
    count: nextCount
  };
}

function getRedisClient(): Redis | null {
  if (process.env.NODE_ENV === "test") {
    return null;
  }

  if (redisClient !== undefined) {
    return redisClient;
  }

  const url = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    redisClient = null;
    if (process.env.NODE_ENV !== "development" && !redisMissingWarningShown) {
      redisMissingWarningShown = true;
      console.warn("KV Redis env is missing. Meme likes are using in-memory fallback.");
    }
    return redisClient;
  }

  redisClient = new Redis({ url, token });
  return redisClient;
}

function buildLikeCountKey(slug: string): string {
  return `likes:count:${slug}`;
}

function buildLikeLimitKey(slug: string, clientIp: string): string {
  const salt = process.env.LIKE_IP_HASH_SALT ?? "memepop-like-ip";
  const ipHash = sha256(`${salt}:${clientIp}`);
  return `likes:limit:${slug}:${ipHash}`;
}

function pruneExpiredHistory(now: number): void {
  for (const [historyKey, likedAt] of likeHistoryMemory.entries()) {
    if (now - likedAt >= MEME_LIKE_COOLDOWN_MS) {
      likeHistoryMemory.delete(historyKey);
    }
  }
}

function toLikeCount(value: number | string | null): number {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
}
