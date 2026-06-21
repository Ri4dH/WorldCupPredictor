import { prisma } from '@/lib/prisma';

/** Data access for teams. Soft-deleted rows (deletedAt set) are excluded. */
export const teamRepository = {
  findAll: () => prisma.team.findMany({ where: { deletedAt: null }, orderBy: { elo: 'desc' } }),

  findById: (id: string) => prisma.team.findFirst({ where: { id, deletedAt: null } }),

  findByCode: (code: string) =>
    prisma.team.findFirst({ where: { code, deletedAt: null }, include: { group: true } }),

  listByGroup: (groupId: string) =>
    prisma.team.findMany({ where: { groupId, deletedAt: null }, orderBy: { elo: 'desc' } }),
};
