import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/server/repositories/matchRepository', () => ({
  matchRepository: { findById: vi.fn() },
}));
vi.mock('@/server/repositories/predictionRepository', () => ({
  predictionRepository: { upsert: vi.fn().mockResolvedValue(undefined) },
}));
vi.mock('@/server/services/settingsService', () => ({
  getEnsembleWeights: () =>
    Promise.resolve({
      poisson: 0.18,
      elo: 0.16,
      expectedGoals: 0.16,
      gradientBoostedTrees: 0.18,
      logisticRegression: 0.12,
      bayesian: 0.1,
      monteCarlo: 0.1,
    }),
}));

import { matchRepository } from '@/server/repositories/matchRepository';
import { predictionRepository } from '@/server/repositories/predictionRepository';

import { getMatchPrediction, MODEL_VERSION } from './predictionService';

function team(overrides: Record<string, unknown> = {}) {
  return {
    id: 'x',
    name: 'X',
    elo: 1800,
    attackStrength: 1.4,
    defenseStrength: 1.1,
    expectedGoalsFor: 1.4,
    expectedGoalsAgainst: 1.1,
    form: 1.6,
    availability: 1,
    ...overrides,
  };
}

const fakeMatch = {
  id: 'm1',
  neutralVenue: true,
  homeAdvantage: false,
  stage: 'GROUP',
  homeTeam: team({ id: 'h', name: 'Home', elo: 1950, attackStrength: 1.9 }),
  awayTeam: team({ id: 'a', name: 'Away', elo: 1650, attackStrength: 1.0 }),
};

beforeEach(() => vi.clearAllMocks());

describe('getMatchPrediction', () => {
  it('returns null when the match is missing', async () => {
    vi.mocked(matchRepository.findById).mockResolvedValue(null);
    expect(await getMatchPrediction('nope')).toBeNull();
    expect(predictionRepository.upsert).not.toHaveBeenCalled();
  });

  it('runs the ensemble, persists and returns the prediction', async () => {
    vi.mocked(matchRepository.findById).mockResolvedValue(fakeMatch as never);

    const result = await getMatchPrediction('m1');

    expect(result?.prediction.outcome.home).toBeGreaterThan(result?.prediction.outcome.away ?? 1);
    expect(predictionRepository.upsert).toHaveBeenCalledOnce();

    const call = vi.mocked(predictionRepository.upsert).mock.calls[0];
    expect(call?.[0]).toBe('m1');
    expect(call?.[1]).toBe(MODEL_VERSION);
    expect(call?.[2]?.confidence).toBeGreaterThan(0);
  });
});
