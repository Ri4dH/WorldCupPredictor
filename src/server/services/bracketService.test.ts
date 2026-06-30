import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/config/env', () => ({
  isLiveDataSource: () => false,
  getServerEnv: () => ({ FOOTBALL_DATA_COMPETITION: 'WC' }),
}));
vi.mock('@/server/repositories/matchRepository', () => ({
  matchRepository: { listAll: vi.fn() },
}));
vi.mock('@/server/services/settingsService', () => ({
  getEnsembleWeights: () =>
    Promise.resolve({
      poisson: 0.18,
      elo: 0.16,
      expectedGoals: 0.16,
      gradientBoostedTrees: 0.18,
      logisticRegression: 0.12,
      bayesian: 0.1,
      monteCarlo: 0.1,
    }),
}));

import { matchRepository } from '@/server/repositories/matchRepository';

function team(id: string, code: string, elo: number) {
  return {
    id,
    name: code,
    code,
    flagEmoji: null,
    elo,
    attackStrength: 1.4,
    defenseStrength: 1.1,
    expectedGoalsFor: 1.4,
    expectedGoalsAgainst: 1.1,
    form: 1.6,
    availability: 1,
  };
}

function r32Match(externalId: number, home: ReturnType<typeof team>, away: ReturnType<typeof team>) {
  return {
    id: `m${externalId}`,
    externalId,
    stage: 'ROUND_OF_32',
    status: 'FINISHED',
    homeScore: 2,
    awayScore: 0,
    kickoff: new Date('2026-06-29T18:00:00Z'),
    homeTeam: home,
    awayTeam: away,
  };
}

const strong = team('t-str', 'STR', 2080);
const weak = team('t-wk', 'WKK', 1340);
const mid = team('t-mid', 'MID', 1820);
const mid2 = team('t-md2', 'MD2', 1600);

async function loadService() {
  vi.resetModules();
  return import('./bracketService');
}

beforeEach(() => vi.clearAllMocks());

describe('getBracketData', () => {
  it('returns null before the Round of 32 exists', async () => {
    vi.mocked(matchRepository.listAll).mockResolvedValue([] as never);
    const { getBracketData } = await loadService();
    expect(await getBracketData()).toBeNull();
  });

  it('simulates the bracket to a champion and advances the strongest side', async () => {
    vi.mocked(matchRepository.listAll).mockResolvedValue([
      r32Match(1, strong, weak),
      r32Match(2, mid, mid2),
    ] as never);

    const { getBracketData } = await loadService();
    const data = await getBracketData();

    expect(data).not.toBeNull();
    // Two R32 ties collapse to a one-tie final round, then a champion.
    expect(data?.predicted.rounds.map((r) => r.stage)).toEqual(['ROUND_OF_32', 'ROUND_OF_16']);
    expect(data?.predicted.champion.code).toBe('STR');

    const firstTie = data?.predicted.rounds[0]?.matches[0];
    expect(firstTie?.winnerId).toBe('t-str');
    expect((firstTie?.homeAdvanceProbability ?? 0) + (firstTie?.awayAdvanceProbability ?? 0)).toBeCloseTo(1, 5);
  });

  it('falls back to a DB-derived live bracket when the feed is unavailable', async () => {
    vi.mocked(matchRepository.listAll).mockResolvedValue([
      r32Match(1, strong, weak),
      r32Match(2, mid, mid2),
    ] as never);

    const { getBracketData } = await loadService();
    const data = await getBracketData();

    expect(data?.liveFromSource).toBe(false);
    const liveR32 = data?.live.rounds.find((r) => r.stage === 'ROUND_OF_32');
    expect(liveR32?.matches).toHaveLength(2);
    expect(liveR32?.matches[0]?.matchId).toBe('m1');
  });
});
