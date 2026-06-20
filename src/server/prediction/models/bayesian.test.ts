import { describe, expect, it } from 'vitest';

import { sum } from '@/utils/math';
import { makeInput } from '@tests/fixtures/teams';

import { bayesianModel } from './bayesian';

describe('bayesianModel', () => {
  it('returns the prior when evidence is neutral', () => {
    const output = bayesianModel.predict(makeInput({ elo: 1800 }, { elo: 1800 }));
    expect(output.outcome.home).toBeCloseTo(output.outcome.away, 6);
    expect(sum([output.outcome.home, output.outcome.draw, output.outcome.away])).toBeCloseTo(1, 10);
  });

  it('shifts toward the side with better form and availability', () => {
    const base = bayesianModel.predict(makeInput({ elo: 1800 }, { elo: 1800 }));
    const updated = bayesianModel.predict(
      makeInput(
        { elo: 1800, form: 2.6, availability: 1 },
        { elo: 1800, form: 0.6, availability: 0.8 },
      ),
    );
    expect(updated.outcome.home).toBeGreaterThan(base.outcome.home);
    expect(updated.outcome.away).toBeLessThan(base.outcome.away);
  });
});
