import {
  RATE_LIMIT_MAX_PER_MINUTE,
  RATE_LIMIT_PENALTY_MS,
  RATE_LIMIT_REPEAT_INPUT_THRESHOLD,
  RATE_LIMIT_WINDOW_MS
} from "@/shared/config";

interface RateLimitState {
  count: number;
  resetAt: number;
  repeatedHashCount: number;
  lastHash: string | null;
  penaltyUntil: number | null;
}

interface RateLimitAllowed {
  allowed: true;
  remaining: number;
}

interface RateLimitBlocked {
  allowed: false;
  retryAfterMs: number;
  reason: "TOO_MANY_REQUESTS" | "REPEATED_INPUT";
}

export type RateLimitResult = RateLimitAllowed | RateLimitBlocked;

const store = new Map<string, RateLimitState>();

export function consumeRateLimit(key: string, inputHash: string, now = Date.now()): RateLimitResult {
  pruneStaleEntries(now);
  const state = getOrCreateState(key, now);

  if (state.penaltyUntil && state.penaltyUntil > now) {
    return {
      allowed: false,
      retryAfterMs: state.penaltyUntil - now,
      reason: "REPEATED_INPUT"
    };
  }

  if (now >= state.resetAt) {
    state.count = 0;
    state.resetAt = now + RATE_LIMIT_WINDOW_MS;
    state.repeatedHashCount = 0;
    state.lastHash = null;
  }

  state.count += 1;

  if (state.count > RATE_LIMIT_MAX_PER_MINUTE) {
    return {
      allowed: false,
      retryAfterMs: state.resetAt - now,
      reason: "TOO_MANY_REQUESTS"
    };
  }

  if (state.lastHash === inputHash) {
    state.repeatedHashCount += 1;
    if (state.repeatedHashCount >= RATE_LIMIT_REPEAT_INPUT_THRESHOLD) {
      state.penaltyUntil = now + RATE_LIMIT_PENALTY_MS;
      return {
        allowed: false,
        retryAfterMs: RATE_LIMIT_PENALTY_MS,
        reason: "REPEATED_INPUT"
      };
    }
  } else {
    state.lastHash = inputHash;
    state.repeatedHashCount = 1;
    state.penaltyUntil = null;
  }

  return {
    allowed: true,
    remaining: Math.max(RATE_LIMIT_MAX_PER_MINUTE - state.count, 0)
  };
}

function getOrCreateState(key: string, now: number): RateLimitState {
  const existing = store.get(key);
  if (existing) {
    return existing;
  }

  const initial: RateLimitState = {
    count: 0,
    resetAt: now + RATE_LIMIT_WINDOW_MS,
    repeatedHashCount: 0,
    lastHash: null,
    penaltyUntil: null
  };
  store.set(key, initial);
  return initial;
}

function pruneStaleEntries(now: number): void {
  for (const [key, value] of store.entries()) {
    const isExpired = now > value.resetAt && (!value.penaltyUntil || now > value.penaltyUntil);
    if (isExpired) {
      store.delete(key);
    }
  }
}
