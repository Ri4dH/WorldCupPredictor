import { getServerEnv } from '@/config/env';

/**
 * Minimal typed client for the football-data.org v4 API.
 * Only the fields the engine needs are modelled.
 */

export interface FootballDataArea {
  readonly name: string;
  readonly code: string;
  readonly flag: string | null;
}

export interface FootballDataTeam {
  readonly id: number;
  readonly name: string;
  readonly shortName: string | null;
  readonly tla: string | null;
  readonly crest: string | null;
  readonly area: FootballDataArea | null;
}

export interface FootballDataStandingRow {
  readonly team: { readonly id: number; readonly name: string; readonly tla: string | null; readonly crest: string | null };
  readonly playedGames: number;
  readonly won: number;
  readonly draw: number;
  readonly lost: number;
  readonly points: number;
  readonly goalsFor: number;
  readonly goalsAgainst: number;
  readonly goalDifference: number;
}

export interface FootballDataStandingGroup {
  readonly stage: string;
  readonly type: string;
  readonly group: string | null;
  readonly table: readonly FootballDataStandingRow[];
}

async function request<T>(path: string): Promise<T> {
  const env = getServerEnv();
  if (!env.FOOTBALL_DATA_API_KEY) {
    throw new Error('FOOTBALL_DATA_API_KEY is not configured');
  }

  const response = await fetch(`${env.FOOTBALL_DATA_BASE_URL}${path}`, {
    headers: { 'X-Auth-Token': env.FOOTBALL_DATA_API_KEY },
  });

  if (!response.ok) {
    throw new Error(`football-data request failed: ${path} -> ${response.status}`);
  }
  return (await response.json()) as T;
}

export const footballDataClient = {
  getCompetitionTeams: (competition: string) =>
    request<{ teams: FootballDataTeam[] }>(`/competitions/${competition}/teams`),

  getStandings: (competition: string) =>
    request<{ standings: FootballDataStandingGroup[] }>(`/competitions/${competition}/standings`),
};
