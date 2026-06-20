import { prisma } from '@/lib/prisma';
import { getDataProvider } from '@/server/data';

export interface SyncResult {
  readonly source: 'seed' | 'live';
  readonly groups: number;
  readonly teams: number;
}

/**
 * Upsert teams (and their groups) from the active data provider into the
 * database. Idempotent: groups are keyed by name and teams by code.
 */
export async function syncTeams(): Promise<SyncResult> {
  const provider = getDataProvider();
  const providerTeams = await provider.getTeams();

  const groupNames = [
    ...new Set(providerTeams.map((team) => team.group).filter((group) => group.length > 0)),
  ].sort();

  const groupIds = new Map<string, string>();
  for (const name of groupNames) {
    const group = await prisma.group.upsert({ where: { name }, create: { name }, update: {} });
    groupIds.set(name, group.id);
  }

  for (const team of providerTeams) {
    const fields = {
      name: team.name,
      confederation: team.confederation,
      flagEmoji: team.flagEmoji,
      groupId: team.group ? (groupIds.get(team.group) ?? null) : null,
      ...team.strength,
    };
    await prisma.team.upsert({
      where: { code: team.code },
      create: { code: team.code, ...fields },
      update: fields,
    });
  }

  return { source: provider.source, groups: groupIds.size, teams: providerTeams.length };
}
