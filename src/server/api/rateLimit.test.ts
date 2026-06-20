import { beforeEach, describe, expect, it } from 'vitest';

import { rateLimit, resetRateLimits } from './rateLimit';

beforeEach(() => resetRateLimits());

describe('rateLimit', () => {
  it('allows up to the limit, then blocks', () => {
    expect(rateLimit('k', 2, 1000, 1000).allowed).toBe(true);
    expect(rateLimit('k', 2, 1000, 1000).allowed).toBe(true);
    const blocked = rateLimit('k', 2, 1000, 1000);
    expect(blocked.allowed).toBe(false);
    expect(blocked.remaining).toBe(0);
  });

  it('resets once the window elapses', () => {
    expect(rateLimit('k', 1, 1000, 1000).allowed).toBe(true);
    expect(rateLimit('k', 1, 1000, 1500).allowed).toBe(false);
    expect(rateLimit('k', 1, 1000, 2001).allowed).toBe(true);
  });

  it('tracks keys independently', () => {
    expect(rateLimit('a', 1, 1000, 1000).allowed).toBe(true);
    expect(rateLimit('b', 1, 1000, 1000).allowed).toBe(true);
    expect(rateLimit('a', 1, 1000, 1000).allowed).toBe(false);
  });
});
