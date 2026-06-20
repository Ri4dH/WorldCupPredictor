import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/config/env', () => ({
  getServerEnv: () => ({
    FOOTBALL_DATA_API_KEY: 'test-key',
    FOOTBALL_DATA_BASE_URL: 'https://api.football-data.org/v4',
    FOOTBALL_DATA_COMPETITION: 'WC',
  }),
}));

import { footballDataClient } from './footballDataClient';

afterEach(() => vi.unstubAllGlobals());

describe('footballDataClient', () => {
  it('sends the auth token and parses the response', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ teams: [{ id: 1, name: 'Brazil', tla: 'BRA' }] }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const result = await footballDataClient.getCompetitionTeams('WC');

    expect(result.teams[0]?.tla).toBe('BRA');
    expect(fetchMock).toHaveBeenCalledWith('https://api.football-data.org/v4/competitions/WC/teams', {
      headers: { 'X-Auth-Token': 'test-key' },
    });
  });

  it('throws on a non-ok response', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: false, status: 429, json: () => Promise.resolve({}) }),
    );
    await expect(footballDataClient.getStandings('WC')).rejects.toThrow('429');
  });
});
