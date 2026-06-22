import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/config/env', () => ({ getServerEnv: () => ({ FOOTBALL_DATA_COMPETITION: 'WC' }) }));
vi.mock('@/lib/prisma', () => ({
  prisma: {
    team: {
      findMany: vi.fn(() =>
        Promise.resolve([
          { id: 'th', code: 'ARG', name: 'Argentina' },
          { id: 'ta', code: 'JPN', name: 'Japan' },
        ]),
      ),
    },
    group: { findMany: vi.fn(() => Promise.resolve([{ id: 'gd', name: 'D' }])) },
    match: {
      upsert: vi.fn(() => Promise.resolve({})),
      deleteMany: vi.fn(() => Promise.resolve({ count: 72 })),
    },
  },
}));
vi.mock('@/server/data/footballDataClient', () => ({
  footballDataClient: { getMatches: vi.fn() },
}));

import { prisma } from '@/lib/prisma';
import { footballDataClient } from '@/server/data/footballDataClient';

import { syncLiveMatches } from './matchSyncService';

function liveMatch(overrides: Record<string, unknown> = {}) {
  return {
    id: 1,
    utcDate: '2026-06-15T19:00:00Z',
    status: 'FINISHED',
    stage: 'GROUP_STAGE',
    group: 'GROUP_D',
    homeTeam: { tla: 'ARG', name: 'Argentina' },
    awayTeam: { tla: 'JPN', name: 'Japan' },
    score: { fullTime: { home: 2, away: 1 } },
    ...overrides,
  };
}

beforeEach(() => vi.clearAllMocks());

describe('syncLiveMatches', () => {
  it('upserts resolvable fixtures and removes seed matches', async () => {
    vi.mocked(footballDataClient.getMatches).mockResolvedValue({
      matches: [
        liveMatch({ id: 1 }),
        liveMatch({ id: 2, awayTeam: { tla: 'ZZZ', name: 'Unknown' } }), // unresolved -> skipped
      ],
    });

    const result = await syncLiveMatches();

    expect(result.fixtures).toBe(1);
    expect(result.removedSeed).toBe(72);
    expect(result.skipped).toBe(1);
    expect(prisma.match.upsert).toHaveBeenCalledTimes(1);
    expect(prisma.match.deleteMany).toHaveBeenCalledWith({ where: { externalId: null } });
  });

  it('resolves a fixture by team name when its TLA does not match', async () => {
    // football-data sometimes returns a different TLA (e.g. "ARG" -> "ARp")
    // for the same team; the stable full name must still resolve it.
    vi.mocked(footballDataClient.getMatches).mockResolvedValue({
      matches: [liveMatch({ id: 5, homeTeam: { tla: 'ARp', name: 'Argentina' } })],
    });

    const result = await syncLiveMatches();

    expect(result.fixtures).toBe(1);
    expect(result.skipped).toBe(0);
    expect(prisma.match.upsert).toHaveBeenCalledTimes(1);
  });

  it('does not remove seed matches when nothing resolves', async () => {
    vi.mocked(footballDataClient.getMatches).mockResolvedValue({ matches: [] });

    const result = await syncLiveMatches();

    expect(result).toEqual({ fixtures: 0, removedSeed: 0, skipped: 0 });
    expect(prisma.match.deleteMany).not.toHaveBeenCalled();
  });
});
