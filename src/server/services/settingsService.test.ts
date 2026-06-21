import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/prisma', () => ({
  prisma: { setting: { findUnique: vi.fn(), upsert: vi.fn() } },
}));

import { predictionConfig } from '@/config/prediction';
import { prisma } from '@/lib/prisma';

import { getEnsembleWeights, setEnsembleWeights } from './settingsService';

beforeEach(() => vi.clearAllMocks());

describe('getEnsembleWeights', () => {
  it('returns config defaults when no override exists', async () => {
    vi.mocked(prisma.setting.findUnique).mockResolvedValue(null as never);
    expect(await getEnsembleWeights()).toEqual(predictionConfig.ensembleWeights);
  });

  it('merges valid overrides over defaults and ignores invalid values', async () => {
    vi.mocked(prisma.setting.findUnique).mockResolvedValue({
      key: 'ensembleWeights',
      value: { poisson: 0.5, elo: -1, bogus: 9, monteCarlo: 'x' },
      updatedAt: new Date(),
    } as never);

    const weights = await getEnsembleWeights();
    expect(weights.poisson).toBe(0.5); // valid override applied
    expect(weights.elo).toBe(predictionConfig.ensembleWeights.elo); // negative ignored
    expect(weights.monteCarlo).toBe(predictionConfig.ensembleWeights.monteCarlo); // non-number ignored
    expect(weights).not.toHaveProperty('bogus'); // unknown key dropped
  });
});

describe('setEnsembleWeights', () => {
  it('upserts the weights', async () => {
    await setEnsembleWeights({ ...predictionConfig.ensembleWeights, poisson: 0.3 });
    expect(prisma.setting.upsert).toHaveBeenCalledOnce();
  });
});
