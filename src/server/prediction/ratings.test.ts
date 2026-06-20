import { describe, expect, it } from 'vitest';

import { sum } from '@/utils/math';

import { drawProbabilityFromElo, eloExpectedScore, eloOutcome } from './ratings';

describe('eloExpectedScore', () => {
  it('is 0.5 at parity and rises with the rating gap', () => {
    expect(eloExpectedScore(1800, 1800)).toBeCloseTo(0.5, 10);
    expect(eloExpectedScore(2000, 1600)).toBeGreaterThan(0.5);
    expect(eloExpectedScore(1600, 2000)).toBeLessThan(0.5);
  });
});

describe('drawProbabilityFromElo', () => {
  it('peaks for evenly matched sides', () => {
    expect(drawProbabilityFromElo(0)).toBeGreaterThan(drawProbabilityFromElo(300));
    expect(drawProbabilityFromElo(0)).toBeCloseTo(0.3, 10);
  });
});

describe('eloOutcome', () => {
  it('returns a normalized distribution', () => {
    const outcome = eloOutcome(1850, 1700);
    expect(sum([outcome.home, outcome.draw, outcome.away])).toBeCloseTo(1, 10);
    expect(outcome.home).toBeGreaterThan(outcome.away);
  });
});
