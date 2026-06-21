import { prisma } from '@/lib/prisma';

export interface TeamStanding {
  teamId: string;
  code: string;
  name: string;
  flagEmoji: string | null;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
}

export interface GroupStandings {
  group: string;
  table: TeamStanding[];
}

interface StandingTeam {
  id: string;
  code: string;
  name: string;
  flagEmoji: string | null;
}

interface StandingMatch {
  homeTeamId: string;
  awayTeamId: string;
  homeScore: number | null;
  awayScore: number | null;
  status: string;
}

/**
 * Compute a sorted group table from teams and their finished matches.
 * Pure and deterministic. Sort: points, goal difference, goals for, then name.
 */
export function computeStandings(
  teams: readonly StandingTeam[],
  matches: readonly StandingMatch[],
): TeamStanding[] {
  const table = new Map<string, TeamStanding>();
  for (const team of teams) {
    table.set(team.id, {
      teamId: team.id,
      code: team.code,
      name: team.name,
      flagEmoji: team.flagEmoji,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDifference: 0,
      points: 0,
    });
  }

  for (const match of matches) {
    if (match.status !== 'FINISHED' || match.homeScore === null || match.awayScore === null) {
      continue;
    }
    const home = table.get(match.homeTeamId);
    const away = table.get(match.awayTeamId);
    if (!home || !away) {
      continue;
    }

    home.played += 1;
    away.played += 1;
    home.goalsFor += match.homeScore;
    home.goalsAgainst += match.awayScore;
    away.goalsFor += match.awayScore;
    away.goalsAgainst += match.homeScore;

    if (match.homeScore > match.awayScore) {
      home.won += 1;
      home.points += 3;
      away.lost += 1;
    } else if (match.homeScore < match.awayScore) {
      away.won += 1;
      away.points += 3;
      home.lost += 1;
    } else {
      home.drawn += 1;
      away.drawn += 1;
      home.points += 1;
      away.points += 1;
    }
  }

  const rows = [...table.values()];
  for (const row of rows) {
    row.goalDifference = row.goalsFor - row.goalsAgainst;
  }
  rows.sort(
    (a, b) =>
      b.points - a.points ||
      b.goalDifference - a.goalDifference ||
      b.goalsFor - a.goalsFor ||
      a.name.localeCompare(b.name),
  );
  return rows;
}

/** Group tables for every group, computed from finished matches. */
export async function getAllGroupStandings(): Promise<GroupStandings[]> {
  const [groups, matches] = await Promise.all([
    prisma.group.findMany({
      orderBy: { name: 'asc' },
      include: { teams: { where: { deletedAt: null } } },
    }),
    prisma.match.findMany({
      where: { deletedAt: null, status: 'FINISHED', groupId: { not: null } },
      select: {
        groupId: true,
        homeTeamId: true,
        awayTeamId: true,
        homeScore: true,
        awayScore: true,
        status: true,
      },
    }),
  ]);

  return groups
    .filter((group) => group.teams.length > 0)
    .map((group) => ({
      group: group.name,
      table: computeStandings(
        group.teams,
        matches.filter((match) => match.groupId === group.id),
      ),
    }));
}
