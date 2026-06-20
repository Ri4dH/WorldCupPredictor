import { getServerEnv } from '@/config/env';
import { prisma } from '@/lib/prisma';
import { footballDataClient } from '@/server/data/footballDataClient';
import { type ProviderFixture, toProviderFixture } from '@/server/data/liveMatches';

const HOST_CODES = new Set(['USA', 'CAN', 'MEX']);

export interface MatchSyncResult {
  readonly fixtures: number;
  readonly removedSeed: number;
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

  const teams = await prisma.team.findMany({ select: { id: true, code: true } });
  const teamIdByCode = new Map(teams.map((team) => [team.code, team.id]));
  const groups = await prisma.group.findMany({ select: { id: true, name: true } });
  const groupIdByName = new Map(groups.map((group) => [group.name, group.id]));

  let upserted = 0;
  for (const fixture of fixtures) {
    const homeTeamId = teamIdByCode.get(fixture.homeCode);
    const awayTeamId = teamIdByCode.get(fixture.awayCode);
    if (!homeTeamId || !awayTeamId) {
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

  return { fixtures: upserted, removedSeed };
}
