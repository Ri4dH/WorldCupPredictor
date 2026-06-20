import { getServerEnv } from '@/config/env';
import { clamp, round } from '@/utils/math';

import type { DataProvider, ProviderTeam } from './dataProvider';
import {
  footballDataClient,
  type FootballDataStandingGroup,
  type FootballDataStandingRow,
} from './footballDataClient';
import { groupLetter } from './liveMatches';
import { type Confederation, type TeamStrengthValues, WC2026_TEAMS } from './wc2026Dataset';

const HOST_CODES = new Set(['USA', 'CAN', 'MEX']);

/** Neutral profile for teams with no games played yet (e.g. pre-tournament). */
const BASELINE_STRENGTH: TeamStrengthValues = {
  elo: 1700,
  attackStrength: 1.35,
  defenseStrength: 1.35,
  expectedGoalsFor: 1.35,
  expectedGoalsAgainst: 1.35,
  form: 1.4,
  availability: 1,
};

/** Reuse the curated confederation mapping; default to UEFA for unknown codes. */
const CONFEDERATION_BY_CODE = new Map<string, Confederation>(
  WC2026_TEAMS.map((team) => [team.code, team.confederation]),
);

// Pseudo-observations that pull small in-tournament samples toward the baseline,
// so a team that has won one game 3-0 is not rated as scoring three per match.
const SHRINKAGE_GAMES = 4;
const BASELINE_GOALS = 1.35;
const BASELINE_POINTS = 1.4;

/**
 * Derive a strength profile from a team's group-stage standing. football-data.org
 * exposes no xG or Elo, so goals are used as an xG proxy and Elo is a documented
 * heuristic of goal difference and points.
 */
function strengthFromStanding(row: FootballDataStandingRow | undefined): TeamStrengthValues {
  if (!row || row.playedGames <= 0) {
    return BASELINE_STRENGTH;
  }
  const denominator = row.playedGames + SHRINKAGE_GAMES;
  const attack = clamp((row.goalsFor + BASELINE_GOALS * SHRINKAGE_GAMES) / denominator, 0.4, 3);
  const defense = clamp((row.goalsAgainst + BASELINE_GOALS * SHRINKAGE_GAMES) / denominator, 0.4, 3);
  const form = clamp((row.points + BASELINE_POINTS * SHRINKAGE_GAMES) / denominator, 0, 3);
  const goalDifferencePerGame = (row.goalsFor - row.goalsAgainst) / denominator;
  const elo = clamp(1700 + goalDifferencePerGame * 140 + (form - BASELINE_POINTS) * 90, 1450, 2150);

  return {
    elo: round(elo, 0),
    attackStrength: round(attack, 2),
    defenseStrength: round(defense, 2),
    expectedGoalsFor: round(attack, 2),
    expectedGoalsAgainst: round(defense, 2),
    form: round(form, 2),
    availability: 1,
  };
}

/** Live provider backed by football-data.org. */
export const liveDataProvider: DataProvider = {
  source: 'live',
  async getTeams(): Promise<readonly ProviderTeam[]> {
    const competition = getServerEnv().FOOTBALL_DATA_COMPETITION;
    const [teamsResponse, standingsResponse] = await Promise.all([
      footballDataClient.getCompetitionTeams(competition),
      footballDataClient
        .getStandings(competition)
        .catch((): { standings: FootballDataStandingGroup[] } => ({ standings: [] })),
    ]);

    const standingByCode = new Map<string, FootballDataStandingRow>();
    const groupByCode = new Map<string, string>();
    for (const group of standingsResponse.standings) {
      const letter = groupLetter(group.group);
      for (const row of group.table) {
        const code = row.team.tla;
        if (!code) {
          continue;
        }
        standingByCode.set(code, row);
        if (letter) {
          groupByCode.set(code, letter);
        }
      }
    }

    const teams: ProviderTeam[] = [];
    for (const team of teamsResponse.teams) {
      const code = team.tla;
      if (!code) {
        continue;
      }
      teams.push({
        name: team.name,
        code,
        confederation: CONFEDERATION_BY_CODE.get(code) ?? 'UEFA',
        group: groupByCode.get(code) ?? '',
        flagEmoji: team.crest ?? '',
        host: HOST_CODES.has(code),
        strength: strengthFromStanding(standingByCode.get(code)),
      });
    }
    return teams;
  },
};
