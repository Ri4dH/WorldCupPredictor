import { prisma } from '@/lib/prisma';
import type { Prisma } from '@prisma/client';

/** Persisted fields of a prediction (the engine summary plus full payload). */
export interface PredictionRecordData {
  readonly homeWinProbability: number;
  readonly drawProbability: number;
  readonly awayWinProbability: number;
  readonly expectedHomeGoals: number;
  readonly expectedAwayGoals: number;
  readonly mostLikelyHomeGoals: number;
  readonly mostLikelyAwayGoals: number;
  readonly confidence: number;
  readonly detail: Prisma.InputJsonValue;
}

/** Data access for predictions, keyed by (match, model version). */
export const predictionRepository = {
  findLatestForMatch: (matchId: string) =>
    prisma.prediction.findFirst({ where: { matchId }, orderBy: { createdAt: 'desc' } }),

  upsert: (matchId: string, modelVersion: string, data: PredictionRecordData) =>
    prisma.prediction.upsert({
      where: { matchId_modelVersion: { matchId, modelVersion } },
      create: { matchId, modelVersion, ...data },
      update: data,
    }),
};
