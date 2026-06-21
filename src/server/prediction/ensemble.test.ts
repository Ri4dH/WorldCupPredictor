import { describe, expect, it } from 'vitest';

import { sum } from '@/utils/math';
import { makeInput } from '@tests/fixtures/teams';

import { predictMatch } from './ensemble';
import { eloModel } from './models/elo';

describe('predictMatch', () => {
  it('returns a normalized, complete ensemble prediction', () => {
    const prediction = predictMatch(makeInput());

    expect(sum([prediction.outcome.home, prediction.outcome.draw, prediction.outcome.away])).toBeCloseTo(
      1,
      10,
    );
    expect(prediction.modelOutputs).toHaveLength(7);
    expect(prediction.confidence).toBeGreaterThan(0);
    expect(prediction.confidence).toBeLessThanOrEqual(1);
    expect(prediction.expectedGoals.home).toBeGreaterThan(0);
    expect(prediction.topScorelines.length).toBeGreaterThan(0);
    expect(prediction.topScorelines.length).toBeLessThanOrEqual(5);
  });

  it('reports confidence as the favored-outcome probability', () => {
    const prediction = predictMatch(makeInput());
    const max = Math.max(prediction.outcome.home, prediction.outcome.draw, prediction.outcome.away);
    expect(prediction.confidence).toBeCloseTo(max, 10);
  });

  it('favors the clearly stronger side', () => {
    const prediction = predictMatch(
      makeInput(
        { name: 'Favorites', elo: 2010, attackStrength: 2.0, expectedGoalsFor: 2.0, form: 2.5 },
        { name: 'Underdogs', elo: 1520, attackStrength: 0.9, expectedGoalsFor: 0.9, form: 0.8 },
      ),
    );
    expect(prediction.outcome.home).toBeGreaterThan(prediction.outcome.away);
    expect(prediction.outcome.home).toBeGreaterThan(0.5);
    expect(prediction.mostLikelyScoreline.home).toBeGreaterThanOrEqual(
      prediction.mostLikelyScoreline.away,
    );
  });

  it('keeps the top scorelines ordered by probability', () => {
    const { topScorelines } = predictMatch(makeInput());
    for (let i = 1; i < topScorelines.length; i += 1) {
      expect(topScorelines[i - 1]?.probability ?? 0).toBeGreaterThanOrEqual(
        topScorelines[i]?.probability ?? 0,
      );
    }
  });

  it('attaches an explanation with ranked factors', () => {
    const { explanation } = predictMatch(makeInput({ elo: 1950 }, { elo: 1600 }));
    expect(explanation.summary.length).toBeGreaterThan(0);
    expect(explanation.factors.length).toBeGreaterThanOrEqual(4);
  });

  it('falls back gracefully for models without goals or scorelines', () => {
    const prediction = predictMatch(makeInput(), { models: [eloModel] });
    expect(sum([prediction.outcome.home, prediction.outcome.draw, prediction.outcome.away])).toBeCloseTo(
      1,
      10,
    );
    expect(prediction.modelOutputs).toHaveLength(1);
    expect(prediction.topScorelines).toHaveLength(0);
    expect(prediction.mostLikelyScoreline).toEqual({ home: 0, away: 0, probability: 0 });
    // Expected goals fall back to the tournament baseline rather than 0.
    expect(prediction.expectedGoals.home).toBeGreaterThan(0);
  });
});
