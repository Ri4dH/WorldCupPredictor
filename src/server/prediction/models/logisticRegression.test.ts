import { describe, expect, it } from 'vitest';

import { sum } from '@/utils/math';
import { makeInput } from '@tests/fixtures/teams';

import { logisticRegressionModel } from './logisticRegression';

describe('logisticRegressionModel', () => {
  it('is balanced for identical sides', () => {
    const output = logisticRegressionModel.predict(makeInput());
    expect(output.outcome.home).toBeCloseTo(output.outcome.away, 6);
    expect(sum([output.outcome.home, output.outcome.draw, output.outcome.away])).toBeCloseTo(1, 10);
  });

  it('favors the side stronger across every feature', () => {
    const output = logisticRegressionModel.predict(
      makeInput(
        { elo: 1950, form: 2.4, expectedGoalsFor: 1.9, availability: 1 },
        { elo: 1550, form: 0.8, expectedGoalsFor: 1.0, availability: 0.7 },
      ),
    );
    expect(output.outcome.home).toBeGreaterThan(output.outcome.away);
    expect(output.outcome.home).toBeGreaterThan(0.5);
  });
});
