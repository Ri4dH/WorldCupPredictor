import { predictionConfig } from '@/config/prediction';
import { prisma } from '@/lib/prisma';
import type { ModelName } from '@/types/prediction';

export type EnsembleWeights = Record<ModelName, number>;

const ENSEMBLE_WEIGHTS_KEY = 'ensembleWeights';
const MODEL_NAMES = Object.keys(predictionConfig.ensembleWeights) as ModelName[];

/** Keep only known model keys with finite, non-negative numbers. */
function sanitizeWeights(raw: unknown): Partial<EnsembleWeights> {
  if (typeof raw !== 'object' || raw === null) {
    return {};
  }
  const record = raw as Record<string, unknown>;
  const result: Partial<EnsembleWeights> = {};
  for (const name of MODEL_NAMES) {
    const value = record[name];
    if (typeof value === 'number' && Number.isFinite(value) && value >= 0) {
      result[name] = value;
    }
  }
  return result;
}

/** Active ensemble weights: stored overrides merged over the config defaults. */
export async function getEnsembleWeights(): Promise<EnsembleWeights> {
  const setting = await prisma.setting.findUnique({ where: { key: ENSEMBLE_WEIGHTS_KEY } });
  return { ...predictionConfig.ensembleWeights, ...sanitizeWeights(setting?.value) };
}

/** Persist an ensemble-weight override. */
export async function setEnsembleWeights(weights: EnsembleWeights): Promise<void> {
  await prisma.setting.upsert({
    where: { key: ENSEMBLE_WEIGHTS_KEY },
    create: { key: ENSEMBLE_WEIGHTS_KEY, value: weights },
    update: { value: weights },
  });
}
