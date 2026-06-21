import { isLiveDataSource } from '@/config/env';
import { predictionConfig } from '@/config/prediction';
import { prisma } from '@/lib/prisma';

export interface SystemOverview {
  dataSource: 'seed' | 'live';
  counts: { teams: number; matches: number; predictions: number; groups: number };
  statusBreakdown: { status: string; count: number }[];
  modelWeights: { model: string; weight: number }[];
  recentPredictions: { id: string; matchLabel: string; confidence: number; createdAt: Date }[];
}

/** Read-only operational overview powering the admin dashboard. */
export async function getSystemOverview(): Promise<SystemOverview> {
  const [teams, matches, predictions, groups, byStatus, recent] = await Promise.all([
    prisma.team.count({ where: { deletedAt: null } }),
    prisma.match.count({ where: { deletedAt: null } }),
    prisma.prediction.count(),
    prisma.group.count(),
    prisma.match.groupBy({ by: ['status'], where: { deletedAt: null }, _count: { _all: true } }),
    prisma.prediction.findMany({
      orderBy: { createdAt: 'desc' },
      take: 8,
      include: { match: { include: { homeTeam: true, awayTeam: true } } },
    }),
  ]);

  return {
    dataSource: isLiveDataSource() ? 'live' : 'seed',
    counts: { teams, matches, predictions, groups },
    statusBreakdown: byStatus.map((entry) => ({ status: entry.status, count: entry._count._all })),
    modelWeights: Object.entries(predictionConfig.ensembleWeights).map(([model, weight]) => ({
      model,
      weight,
    })),
    recentPredictions: recent.map((prediction) => ({
      id: prediction.id,
      matchLabel: `${prediction.match.homeTeam.code} vs ${prediction.match.awayTeam.code}`,
      confidence: prediction.confidence,
      createdAt: prediction.createdAt,
    })),
  };
}
