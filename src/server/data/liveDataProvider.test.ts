import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/config/env', () => ({
  getServerEnv: () => ({
    FOOTBALL_DATA_COMPETITION: 'WC',
    FOOTBALL_DATA_API_KEY: 'k',
    FOOTBALL_DATA_BASE_URL: 'https://x',
  }),
}));
vi.mock('./footballDataClient', () => ({
  footballDataClient: { getCompetitionTeams: vi.fn(), getStandings: vi.fn() },
}));

import { footballDataClient } from './footballDataClient';

import { liveDataProvider } from './liveDataProvider';

beforeEach(() => vi.clearAllMocks());

describe('liveDataProvider', () => {
  it('maps teams and derives strength from standings', async () => {
    vi.mocked(footballDataClient.getCompetitionTeams).mockResolvedValue({
      teams: [
        { id: 1, name: 'Brazil', shortName: 'Brazil', tla: 'BRA', crest: 'https://x/bra.png', area: { name: 'Brazil', code: 'BRA', flag: null } },
        { id: 2, name: 'United States', shortName: 'USA', tla: 'USA', crest: null, area: null },
        { id: 3, name: 'No Code', shortName: null, tla: null, crest: null, area: null },
      ],
    });
    vi.mocked(footballDataClient.getStandings).mockResolvedValue({
      standings: [
        {
          stage: 'GROUP_STAGE',
          type: 'TOTAL',
          group: 'GROUP_C',
          table: [
            { team: { id: 1, name: 'Brazil', tla: 'BRA', crest: null }, playedGames: 3, won: 3, draw: 0, lost: 0, points: 9, goalsFor: 7, goalsAgainst: 2, goalDifference: 5 },
          ],
        },
      ],
    });

    const teams = await liveDataProvider.getTeams();

    expect(liveDataProvider.source).toBe('live');
    expect(teams).toHaveLength(2); // the null-tla team is dropped

    const brazil = teams.find((team) => team.code === 'BRA');
    expect(brazil?.group).toBe('C');
    expect(brazil?.confederation).toBe('CONMEBOL'); // from the curated mapping
    expect(brazil?.strength.attackStrength).toBeCloseTo(7 / 3, 2);
    expect(brazil?.strength.form).toBeCloseTo(3, 2);
    expect(brazil?.strength.elo).toBeGreaterThan(1700);

    const usa = teams.find((team) => team.code === 'USA');
    expect(usa?.host).toBe(true);
    expect(usa?.strength.elo).toBe(1700); // baseline — no standing
  });

  it('tolerates standings being unavailable', async () => {
    vi.mocked(footballDataClient.getCompetitionTeams).mockResolvedValue({
      teams: [{ id: 1, name: 'Brazil', shortName: 'Brazil', tla: 'BRA', crest: null, area: null }],
    });
    vi.mocked(footballDataClient.getStandings).mockRejectedValue(new Error('404'));

    const teams = await liveDataProvider.getTeams();

    expect(teams).toHaveLength(1);
    expect(teams[0]?.strength.elo).toBe(1700);
  });
});
