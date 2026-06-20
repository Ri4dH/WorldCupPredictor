import { prisma } from '@/lib/prisma';
import type { MatchStage } from '@prisma/client';

const withTeams = { homeTeam: true, awayTeam: true, group: true } as const;

/** A match joined with both teams and its group. */
export type MatchWithTeams = NonNullable<Awaited<ReturnType<typeof matchRepository.findById>>>;

/** Data access for matches. Soft-deleted rows are excluded. */
export const matchRepository = {
  findById: (id: string) =>
    prisma.match.findFirst({ where: { id, deletedAt: null }, include: withTeams }),

  listAll: (limit = 104) =>
    prisma.match.findMany({
      where: { deletedAt: null },
      include: withTeams,
      orderBy: { kickoff: 'asc' },
      take: limit,
    }),

  listUpcoming: (limit = 20) =>
    prisma.match.findMany({
      where: { deletedAt: null, status: 'SCHEDULED' },
      include: withTeams,
      orderBy: { kickoff: 'asc' },
      take: limit,
    }),

  listByStage: (stage: MatchStage) =>
    prisma.match.findMany({
      where: { deletedAt: null, stage },
      include: withTeams,
      orderBy: { kickoff: 'asc' },
    }),
};
