import { describe, expect, it } from 'vitest';

import {
  clamp,
  factorial,
  mean,
  normalize,
  poissonProbability,
  round,
  sigmoid,
  sum,
  weightedMean,
} from './math';

describe('clamp', () => {
  it('constrains values to the range', () => {
    expect(clamp(5, 0, 10)).toBe(5);
    expect(clamp(-1, 0, 10)).toBe(0);
    expect(clamp(99, 0, 10)).toBe(10);
  });

  it('collapses NaN to the minimum', () => {
    expect(clamp(Number.NaN, 2, 10)).toBe(2);
  });
});

describe('sum / mean', () => {
  it('sums values', () => {
    expect(sum([1, 2, 3])).toBe(6);
  });

  it('averages values and handles the empty case', () => {
    expect(mean([2, 4, 6])).toBe(4);
    expect(mean([])).toBe(0);
  });
});

describe('sigmoid', () => {
  it('maps 0 to 0.5 and is monotonic', () => {
    expect(sigmoid(0)).toBeCloseTo(0.5, 10);
    expect(sigmoid(2)).toBeGreaterThan(sigmoid(1));
  });
});

describe('factorial', () => {
  it('computes known values', () => {
    expect(factorial(0)).toBe(1);
    expect(factorial(5)).toBe(120);
  });

  it('rejects negative and non-integer input', () => {
    expect(() => factorial(-1)).toThrow();
    expect(() => factorial(1.5)).toThrow();
  });
});

describe('poissonProbability', () => {
  it('matches known Poisson masses', () => {
    expect(poissonProbability(0, 1)).toBeCloseTo(0.367879, 5);
    expect(poissonProbability(2, 1.5)).toBeCloseTo(0.251021, 5);
  });

  it('handles edge rates', () => {
    expect(poissonProbability(0, 0)).toBe(1);
    expect(poissonProbability(3, 0)).toBe(0);
    expect(poissonProbability(-1, 2)).toBe(0);
  });
});

describe('normalize', () => {
  it('scales to sum 1', () => {
    expect(sum(normalize([1, 1, 2]))).toBeCloseTo(1, 10);
    expect(normalize([1, 3])).toEqual([0.25, 0.75]);
  });

  it('falls back to a uniform split when total is 0', () => {
    expect(normalize([0, 0])).toEqual([0.5, 0.5]);
    expect(normalize([])).toEqual([]);
  });
});

describe('weightedMean', () => {
  it('weights values', () => {
    expect(weightedMean([1, 3], [3, 1])).toBeCloseTo(1.5, 10);
  });

  it('falls back to the plain mean when weights are zero', () => {
    expect(weightedMean([2, 4], [0, 0])).toBe(3);
  });

  it('rejects mismatched lengths', () => {
    expect(() => weightedMean([1, 2], [1])).toThrow();
  });
});

describe('round', () => {
  it('rounds to decimals', () => {
    expect(round(1.2345, 2)).toBe(1.23);
    expect(round(1.9)).toBe(2);
  });
});
