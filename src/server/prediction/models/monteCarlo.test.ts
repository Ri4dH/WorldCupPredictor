import { describe, expect, it } from 'vitest';

import { sum } from '@/utils/math';
import { makeInput } from '@tests/fixtures/teams';

import { monteCarloModel } from './monteCarlo';

describe('monteCarloModel', () => {
  it('is reproducible for the same fixture', () => {
    const first = monteCarloModel.predict(makeInput({ id: 'bra', elo: 1980 }, { id: 'cro', elo: 1760 }));
    const second = monteCarloModel.predict(makeInput({ id: 'bra', elo: 1980 }, { id: 'cro', elo: 1760 }));
    expect(first.outcome).toEqual(second.outcome);
    expect(first.expectedGoals).toEqual(second.expectedGoals);
  });

  it('produces a normalized outcome favoring the stronger attack', () => {
    const output = monteCarloModel.predict(makeInput({ attackStrength: 2.3 }, { defenseStrength: 1.6 }));
    expect(sum([output.outcome.home, output.outcome.draw, output.outcome.away])).toBeCloseTo(1, 10);
    expect(output.outcome.home).toBeGreaterThan(output.outcome.away);
  });

  it('keeps probabilities within range and emits scorelines', () => {
    const output = monteCarloModel.predict(makeInput({ elo: 1820 }, { elo: 1700 }));
    expect(output.outcome.home).toBeGreaterThan(0);
    expect(output.outcome.home).toBeLessThan(1);
    expect((output.scoreline ?? []).length).toBeGreaterThan(0);
    expect(output.expectedGoals?.home ?? 0).toBeGreaterThan(0);
  });
});
