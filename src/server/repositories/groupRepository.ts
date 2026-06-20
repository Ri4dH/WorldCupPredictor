import { prisma } from '@/lib/prisma';

/** Data access for groups, including their (non-deleted) teams. */
export const groupRepository = {
  listWithTeams: () =>
    prisma.group.findMany({
      orderBy: { name: 'asc' },
      include: { teams: { where: { deletedAt: null }, orderBy: { elo: 'desc' } } },
    }),
};
