import 'dotenv/config';

import { MatchStage, MatchStatus, PrismaClient, type Prisma } from '@prisma/client';

import {
  deriveStrength,
  GROUP_FIXTURE_PAIRS,
  teamsByGroup,
  WC2026_TEAMS,
} from '../src/server/data/wc2026Dataset';

const prisma = new PrismaClient();

/** The 16 World Cup 2026 host cities. */
const VENUES = [
  'Atlanta',
  'Boston',
  'Dallas',
  'Guadalajara',
  'Houston',
  'Kansas City',
  'Los Angeles',
  'Mexico City',
  'Miami',
  'Monterrey',
  'New York / New Jersey',
  'Philadelphia',
  'San Francisco Bay Area',
  'Seattle',
  'Toronto',
  'Vancouver',
];

const HOST_CODES = new Set(['USA', 'CAN', 'MEX']);
const TOURNAMENT_START = new Date('2026-06-11T16:00:00.000Z');
const HOURS_BETWEEN_FIXTURES = 6;

async function seedGroups(): Promise<Map<string, string>> {
  const names = [...new Set(WC2026_TEAMS.map((team) => team.group))].sort();
  const ids = new Map<string, string>();
  for (const name of names) {
    const group = await prisma.group.upsert({ where: { name }, create: { name }, update: {} });
    ids.set(name, group.id);
  }
  return ids;
}

async function seedTeams(groupIds: Map<string, string>): Promise<Map<string, string>> {
  const ids = new Map<string, string>();
  for (const team of WC2026_TEAMS) {
    const fields = {
      name: team.name,
      confederation: team.confederation,
      flagEmoji: team.flagEmoji,
      groupId: groupIds.get(team.group) ?? null,
      ...deriveStrength(team.elo, team.code),
    };
    const record = await prisma.team.upsert({
      where: { code: team.code },
      create: { code: team.code, ...fields },
      update: fields,
    });
    ids.set(team.code, record.id);
  }
  return ids;
}

async function seedGroupFixtures(
  groupIds: Map<string, string>,
  teamIds: Map<string, string>,
): Promise<number> {
  await prisma.match.deleteMany({});
  const groups = [...teamsByGroup().entries()].sort(([a], [b]) => a.localeCompare(b));
  const data: Prisma.MatchCreateManyInput[] = [];
  let index = 0;

  for (const [groupName, teams] of groups) {
    const groupId = groupIds.get(groupName);
    for (const [homeIndex, awayIndex] of GROUP_FIXTURE_PAIRS) {
      const home = teams[homeIndex];
      const away = teams[awayIndex];
      const homeTeamId = home ? teamIds.get(home.code) : undefined;
      const awayTeamId = away ? teamIds.get(away.code) : undefined;
      if (!home || !away || !homeTeamId || !awayTeamId || !groupId) {
        continue;
      }
      const homeIsHost = HOST_CODES.has(home.code);
      data.push({
        stage: MatchStage.GROUP,
        status: MatchStatus.SCHEDULED,
        kickoff: new Date(TOURNAMENT_START.getTime() + index * HOURS_BETWEEN_FIXTURES * 3_600_000),
        venue: VENUES[index % VENUES.length] ?? 'TBD',
        neutralVenue: !homeIsHost,
        homeAdvantage: homeIsHost,
        groupId,
        homeTeamId,
        awayTeamId,
      });
      index += 1;
    }
  }

  await prisma.match.createMany({ data });
  return data.length;
}

async function main(): Promise<void> {
  console.log('Seeding World Cup 2026 data…');
  const groupIds = await seedGroups();
  const teamIds = await seedTeams(groupIds);
  const fixtures = await seedGroupFixtures(groupIds, teamIds);
  console.log(`Seeded ${groupIds.size} groups, ${teamIds.size} teams, ${fixtures} group fixtures.`);
}

main()
  .catch((error: unknown) => {
    console.error('Seed failed:', error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
