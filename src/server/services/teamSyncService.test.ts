import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    group: {
      upsert: vi.fn(({ where }: { where: { name: string } }) =>
        Promise.resolve({ id: `g-${where.name}`, name: where.name }),
      ),
    },
    team: { upsert: vi.fn(() => Promise.resolve({})) },
  },
}));
vi.mock('@/server/data', () => ({
  getDataProvider: () => ({
    source: 'seed',
    getTeams: () =>
      Promise.resolve([
        {
          name: 'Brazil',
          code: 'BRA',
          confederation: 'CONMEBOL',
          group: 'C',
          flagEmoji: '🇧🇷',
          host: false,
          strength: {
            elo: 2000,
            attackStrength: 2,
            defenseStrength: 0.9,
            expectedGoalsFor: 2,
            expectedGoalsAgainst: 0.9,
            form: 2.4,
            availability: 1,
          },
        },
        {
          name: 'Friendly XI',
          code: 'FXI',
          confederation: 'UEFA',
          group: '',
          flagEmoji: '',
          host: false,
          strength: {
            elo: 1700,
            attackStrength: 1.35,
            defenseStrength: 1.35,
            expectedGoalsFor: 1.35,
            expectedGoalsAgainst: 1.35,
            form: 1.4,
            availability: 1,
          },
        },
      ]),
  }),
}));

import { prisma } from '@/lib/prisma';

import { syncTeams } from './teamSyncService';

beforeEach(() => vi.clearAllMocks());

describe('syncTeams', () => {
  it('upserts groups and teams from the provider', async () => {
    const result = await syncTeams();

    // Only 'C' is a real group; the empty group name is filtered out.
    expect(result).toEqual({ source: 'seed', groups: 1, teams: 2 });
    expect(prisma.group.upsert).toHaveBeenCalledTimes(1);
    expect(prisma.team.upsert).toHaveBeenCalledTimes(2);
  });
});
