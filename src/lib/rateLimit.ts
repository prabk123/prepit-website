/**
 * A small per-key sliding-window limiter kept in memory (PRE-381). Each
 * serverless instance has its own copy, so it only slows one caller down; the
 * Vercel Firewall rule on the same routes is what holds across instances.
 * Keys are never logged.
 */
export type RateLimitResult =
  | { allowed: true; /** Gives the hit back, for a post that failed on our side. */ refund: () => void }
  | { allowed: false; retryAfterSeconds: number };

export type RateLimiter = (key: string, now?: number) => RateLimitResult;

export function createRateLimiter({
  limit,
  windowMs,
  maxKeys = 5000,
}: {
  limit: number;
  windowMs: number;
  /** Least recently seen keys are dropped past this, so a flood of addresses can't grow memory without bound. */
  maxKeys?: number;
}): RateLimiter {
  const hits = new Map<string, number[]>();

  // Re-insert so the Map's order stays least recently seen first.
  function touch(key: string, times: number[]) {
    hits.delete(key);
    hits.set(key, times);
    while (hits.size > maxKeys) {
      const oldest = hits.keys().next().value;
      if (oldest === undefined) break;
      hits.delete(oldest);
    }
  }

  return (key, now = Date.now()) => {
    const recent = (hits.get(key) ?? []).filter((time) => now - time < windowMs);

    if (recent.length >= limit) {
      touch(key, recent);
      return { allowed: false, retryAfterSeconds: Math.max(1, Math.ceil((recent[0] + windowMs - now) / 1000)) };
    }

    recent.push(now);
    touch(key, recent);
    return {
      allowed: true,
      refund: () => {
        const times = hits.get(key);
        const index = times?.indexOf(now) ?? -1;
        if (times && index >= 0) times.splice(index, 1);
      },
    };
  };
}

/**
 * The rate-limit key for a visitor IP: IPv4 as is, IPv6 by its /64, since one
 * client usually holds a whole /64 and could rotate through it. Null when
 * there is no usable address.
 */
export function rateLimitKey(ip: string | undefined): string | null {
  if (!ip) return null;
  if (!ip.includes(":")) return ip;
  const [head, tail = ""] = ip.toLowerCase().split("::");
  const headGroups = head ? head.split(":") : [];
  const tailGroups = tail ? tail.split(":") : [];
  const groups = ip.includes("::")
    ? [...headGroups, ...Array(Math.max(0, 8 - headGroups.length - tailGroups.length)).fill("0"), ...tailGroups]
    : headGroups;
  return `${groups.slice(0, 4).map((group) => group.replace(/^0+(?=.)/, "")).join(":")}::/64`;
}

/** Form submissions allowed per visitor IP: five in ten minutes is plenty for a person. */
export const FORM_RATE_LIMIT = { limit: 5, windowMs: 10 * 60 * 1000 } as const;
