import { describe, expect, it } from 'vitest';

import { hashStringToSeed, mulberry32, samplePoisson } from './random';

describe('mulberry32', () => {
  it('is deterministic for a seed', () => {
    const a = mulberry32(42);
    const b = mulberry32(42);
    expect([a(), a(), a()]).toEqual([b(), b(), b()]);
  });

  it('returns values in [0, 1)', () => {
    const next = mulberry32(7);
    for (let i = 0; i < 200; i += 1) {
      const value = next();
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });
});

describe('hashStringToSeed', () => {
  it('is deterministic and order-sensitive', () => {
    expect(hashStringToSeed('home-away')).toBe(hashStringToSeed('home-away'));
    expect(hashStringToSeed('home-away')).not.toBe(hashStringToSeed('away-home'));
  });
});

describe('samplePoisson', () => {
  it('averages close to lambda over many samples', () => {
    const next = mulberry32(123);
    const lambda = 1.6;
    const samples = 20_000;
    let total = 0;
    for (let i = 0; i < samples; i += 1) {
      total += samplePoisson(lambda, next);
    }
    expect(total / samples).toBeCloseTo(lambda, 1);
  });

  it('returns 0 for a non-positive rate', () => {
    expect(samplePoisson(0, mulberry32(1))).toBe(0);
  });
});
