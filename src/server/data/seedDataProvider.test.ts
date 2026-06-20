import { describe, expect, it } from 'vitest';

import { seedDataProvider } from './seedDataProvider';

describe('seedDataProvider', () => {
  it('identifies as the seed source', () => {
    expect(seedDataProvider.source).toBe('seed');
  });

  it('returns all 48 teams with derived strength', async () => {
    const teams = await seedDataProvider.getTeams();
    expect(teams).toHaveLength(48);
    const first = teams[0];
    expect(first?.strength.attackStrength).toBeGreaterThan(0);
    expect(first?.host).toBeTypeOf('boolean');
  });
});
