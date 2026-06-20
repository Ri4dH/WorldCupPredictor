import type { NextRequest } from 'next/server';

/**
 * Fixed-window, in-memory rate limiter.
 *
 * Best-effort per serverless instance — adequate for protecting the prediction
 * endpoint on the free tier. A distributed store (e.g. Upstash Redis) can
 * replace the backing map for strict global limits without changing callers.
 */
interface Window {
  count: number;
  resetAt: number;
}

const windows = new Map<string, Window>();

export interface RateLimitResult {
  readonly allowed: boolean;
  readonly remaining: number;
  readonly resetAt: number;
}

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
  now: number = Date.now(),
): RateLimitResult {
  const current = windows.get(key);

  if (!current || current.resetAt <= now) {
    const resetAt = now + windowMs;
    windows.set(key, { count: 1, resetAt });
    return { allowed: true, remaining: limit - 1, resetAt };
  }

  if (current.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: current.resetAt };
  }

  current.count += 1;
  return { allowed: true, remaining: limit - current.count, resetAt: current.resetAt };
}

/** Derive a best-effort client key from the request. */
export function clientKey(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const first = forwarded?.split(',')[0]?.trim();
  return first && first.length > 0 ? first : 'anonymous';
}

/** Test-only helper to reset limiter state between cases. */
export function resetRateLimits(): void {
  windows.clear();
}
