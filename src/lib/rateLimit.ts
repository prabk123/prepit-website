/**
 * A small per-key sliding-window limiter kept in memory (PRE-381). Each
 * serverless instance has its own copy, so it only slows one caller down; the
 * Vercel Firewall rule on the same routes is what holds across instances.
 * Keys are never logged.
 */
export type RateLimitResult = { allowed: true } | { allowed: false; retryAfterSeconds: number };

export type RateLimiter = (key: string, now?: number) => RateLimitResult;

export function createRateLimiter({
  limit,
  windowMs,
  maxKeys = 5000,
}: {
  limit: number;
  windowMs: number;
  /** Oldest keys are dropped past this, so a flood of addresses can't grow memory without bound. */
  maxKeys?: number;
}): RateLimiter {
  const hits = new Map<string, number[]>();

  return (key, now = Date.now()) => {
    const recent = (hits.get(key) ?? []).filter((time) => now - time < windowMs);

    if (recent.length >= limit) {
      hits.set(key, recent);
      return { allowed: false, retryAfterSeconds: Math.max(1, Math.ceil((recent[0] + windowMs - now) / 1000)) };
    }

    recent.push(now);
    // Re-insert so the Map's order stays least recently used first.
    hits.delete(key);
    hits.set(key, recent);
    while (hits.size > maxKeys) {
      const oldest = hits.keys().next().value;
      if (oldest === undefined) break;
      hits.delete(oldest);
    }
    return { allowed: true };
  };
}

/** Form submissions allowed per visitor IP: five in ten minutes is plenty for a person. */
export const FORM_RATE_LIMIT = { limit: 5, windowMs: 10 * 60 * 1000 } as const;
