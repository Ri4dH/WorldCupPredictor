import { describe, expect, it } from 'vitest';

import { sum } from '@/utils/math';
import { makeInput } from '@tests/fixtures/teams';

import { poissonModel } from './poisson';

describe('poissonModel', () => {
  it('produces a normalized scoreline and outcome', () => {
    const output = poissonModel.predict(makeInput());
    expect(output.scoreline).toBeDefined();
    expect(sum((output.scoreline ?? []).map((cell) => cell.probability))).toBeCloseTo(1, 10);
    expect(sum([output.outcome.home, output.outcome.draw, output.outcome.away])).toBeCloseTo(1, 10);
    expect(output.expectedGoals?.home ?? 0).toBeGreaterThan(0);
  });

  it('favors the side with the stronger attack', () => {
    const output = poissonModel.predict(makeInput({ attackStrength: 2.4 }, { defenseStrength: 1.5 }));
    expect(output.outcome.home).toBeGreaterThan(output.outcome.away);
    expect(output.expectedGoals?.home ?? 0).toBeGreaterThan(output.expectedGoals?.away ?? 0);
  });

  it('raises home expected goals under host advantage', () => {
    const neutral = poissonModel.predict(makeInput({}, {}, { homeAdvantage: false }));
    const host = poissonModel.predict(makeInput({}, {}, { homeAdvantage: true }));
    expect(host.expectedGoals?.home ?? 0).toBeGreaterThan(neutral.expectedGoals?.home ?? 0);
  });
});
