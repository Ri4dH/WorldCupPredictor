import { getServerEnv } from '@/config/env';
import { logger } from '@/lib/logger';
import { prisma } from '@/lib/prisma';
import { footballDataClient } from '@/server/data/footballDataClient';
import { type ProviderFixture, toProviderFixture } from '@/server/data/liveMatches';

const HOST_CODES = new Set(['USA', 'CAN', 'MEX']);

const log = logger.child('matchSync');

export interface MatchSyncResult {
  readonly fixtures: number;
  readonly removedSeed: number;
  /** Fixtures dropped because neither team code nor name matched a known team. */
  readonly skipped: number;
}

/**
 * Fetch live fixtures and upsert them by external id (so re-runs update scores
 * and status), then remove leftover curated seed matches once live data exists.
 */
export async function syncLiveMatches(): Promise<MatchSyncResult> {
  const competition = getServerEnv().FOOTBALL_DATA_COMPETITION;
  const response = await footballDataClient.getMatches(competition);
  const fixtures = response.matches
    .map(toProviderFixture)
    .filter((fixture): fixture is ProviderFixture => fixture !== null);

  const teams = await prisma.team.findMany({ select: { id: true, code: true, name: true } });
  const teamIdByCode = new Map(teams.map((team) => [team.code, team.id]));
  const teamIdByName = new Map(teams.map((team) => [team.name.toLowerCase(), team.id]));
  const groups = await prisma.group.findMany({ select: { id: true, name: true } });
  const groupIdByName = new Map(groups.map((group) => [group.name, group.id]));

  // Resolve a fixture team by its (volatile) TLA, falling back to its stable
  // full name — football-data sometimes reports a different TLA for the same
  // team across endpoints, which would otherwise silently drop the fixture.
  const resolveTeamId = (code: string, name: string): string | undefined =>
    teamIdByCode.get(code) ?? teamIdByName.get(name.toLowerCase());

  let upserted = 0;
  let skipped = 0;
  for (const fixture of fixtures) {
    const homeTeamId = resolveTeamId(fixture.homeCode, fixture.homeName);
    const awayTeamId = resolveTeamId(fixture.awayCode, fixture.awayName);
    if (!homeTeamId || !awayTeamId) {
      skipped += 1;
      log.warn('Skipped fixture with unresolved team(s)', {
        externalId: fixture.externalId,
        home: `${fixture.homeName} (${fixture.homeCode})`,
        away: `${fixture.awayName} (${fixture.awayCode})`,
      });
      continue;
    }
    const homeIsHost = HOST_CODES.has(fixture.homeCode);
    const data = {
      stage: fixture.stage,
      status: fixture.status,
      kickoff: fixture.kickoff,
      neutralVenue: !homeIsHost,
      homeAdvantage: homeIsHost,
      homeScore: fixture.homeScore,
      awayScore: fixture.awayScore,
      groupId: fixture.group ? (groupIdByName.get(fixture.group) ?? null) : null,
      homeTeamId,
      awayTeamId,
    };
    await prisma.match.upsert({
      where: { externalId: fixture.externalId },
      create: { externalId: fixture.externalId, ...data },
      update: data,
    });
    upserted += 1;
  }

  const removedSeed =
    upserted > 0 ? (await prisma.match.deleteMany({ where: { externalId: null } })).count : 0;

  return { fixtures: upserted, removedSeed, skipped };
}
