import { describe, expect, it } from 'vitest';

import { makeInput } from '@tests/fixtures/teams';

import { expectedGoalsModel } from './expectedGoals';

describe('expectedGoalsModel', () => {
  it('favors the side creating better chances', () => {
    const output = expectedGoalsModel.predict(
      makeInput({ expectedGoalsFor: 2.2 }, { expectedGoalsAgainst: 1.6 }),
    );
    expect(output.model).toBe('expectedGoals');
    expect(output.outcome.home).toBeGreaterThan(output.outcome.away);
  });

  it('is driven by xG, not actual-goal fields', () => {
    const highXg = expectedGoalsModel.predict(
      makeInput({ expectedGoalsFor: 2.5, attackStrength: 0.5 }, {}),
    );
    const lowXg = expectedGoalsModel.predict(
      makeInput({ expectedGoalsFor: 0.6, attackStrength: 3.0 }, {}),
    );
    expect(highXg.expectedGoals?.home ?? 0).toBeGreaterThan(lowXg.expectedGoals?.home ?? 0);
  });
});
