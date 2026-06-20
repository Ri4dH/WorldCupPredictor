import { describe, expect, it } from 'vitest';

import { sum } from '@/utils/math';

import {
  expectedGoalsFromScoreline,
  mostLikelyScoreline,
  normalizeOutcome,
  outcomeFromExpectedScore,
  outcomeFromScoreline,
  scorelineDistribution,
  topScorelines,
} from './probability';

describe('normalizeOutcome', () => {
  it('renormalizes to sum 1 and floors negatives', () => {
    const outcome = normalizeOutcome(2, 1, 1);
    expect(outcome.home).toBeCloseTo(0.5, 10);
    expect(sum([outcome.home, outcome.draw, outcome.away])).toBeCloseTo(1, 10);
  });

  it('treats negative scores as zero', () => {
    const outcome = normalizeOutcome(1, -5, 1);
    expect(outcome.draw).toBe(0);
  });
});

describe('outcomeFromExpectedScore', () => {
  it('is symmetric for an even match', () => {
    const outcome = outcomeFromExpectedScore(0.5, 0.28);
    expect(outcome.home).toBeCloseTo(outcome.away, 10);
    expect(sum([outcome.home, outcome.draw, outcome.away])).toBeCloseTo(1, 10);
  });

  it('favors the home side as expected score rises', () => {
    const strong = outcomeFromExpectedScore(0.75, 0.2);
    expect(strong.home).toBeGreaterThan(strong.away);
  });
});

describe('scorelineDistribution', () => {
  it('produces a normalized (maxGoals+1)^2 grid', () => {
    const distribution = scorelineDistribution(1.4, 1.1, 6);
    expect(distribution).toHaveLength(49);
    expect(sum(distribution.map((cell) => cell.probability))).toBeCloseTo(1, 10);
  });

  it('recovers the goal rates as expected goals (within truncation)', () => {
    const distribution = scorelineDistribution(1.6, 1.2, 10);
    const expected = expectedGoalsFromScoreline(distribution);
    expect(expected.home).toBeCloseTo(1.6, 2);
    expect(expected.away).toBeCloseTo(1.2, 2);
  });
});

describe('outcomeFromScoreline', () => {
  it('assigns more probability to the stronger side', () => {
    const distribution = scorelineDistribution(2.1, 0.8, 8);
    const outcome = outcomeFromScoreline(distribution);
    expect(outcome.home).toBeGreaterThan(outcome.away);
    expect(sum([outcome.home, outcome.draw, outcome.away])).toBeCloseTo(1, 10);
  });
});

describe('mostLikelyScoreline / topScorelines', () => {
  it('returns the highest-probability scoreline first', () => {
    const distribution = scorelineDistribution(1.3, 1.1, 6);
    const top = topScorelines(distribution, 3);
    expect(top).toHaveLength(3);
    expect(top[0]?.probability).toBeGreaterThanOrEqual(top[1]?.probability ?? 0);
    expect(mostLikelyScoreline(distribution)).toEqual(top[0]);
  });

  it('returns a safe default for an empty distribution', () => {
    expect(mostLikelyScoreline([])).toEqual({ home: 0, away: 0, probability: 0 });
  });
});
