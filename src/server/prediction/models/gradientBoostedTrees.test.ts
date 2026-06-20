import { describe, expect, it } from 'vitest';

import { sum } from '@/utils/math';
import { makeInput } from '@tests/fixtures/teams';

import { gradientBoostedTreesModel } from './gradientBoostedTrees';

describe('gradientBoostedTreesModel', () => {
  it('produces a normalized outcome and scoreline', () => {
    const output = gradientBoostedTreesModel.predict(makeInput());
    expect(output.model).toBe('gradientBoostedTrees');
    expect(sum([output.outcome.home, output.outcome.draw, output.outcome.away])).toBeCloseTo(1, 10);
    expect(output.scoreline).toBeDefined();
  });

  it('is roughly balanced for identical sides', () => {
    const output = gradientBoostedTreesModel.predict(makeInput());
    expect(output.outcome.home).toBeCloseTo(output.outcome.away, 6);
  });

  it('raises home supremacy with a large rating and form edge', () => {
    const reversed = gradientBoostedTreesModel.predict(
      makeInput({ elo: 1600, form: 0.5 }, { elo: 2000, form: 2.5 }),
    );
    const favored = gradientBoostedTreesModel.predict(
      makeInput({ elo: 2000, form: 2.5 }, { elo: 1600, form: 0.5 }),
    );
    expect(favored.outcome.home).toBeGreaterThan(reversed.outcome.home);
    expect((favored.expectedGoals?.home ?? 0) - (favored.expectedGoals?.away ?? 0)).toBeGreaterThan(0);
  });
});
