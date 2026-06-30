import type { Prisma } from '@prisma/client';

import { logger } from '@/lib/logger';
import { toMatchInput } from '@/server/data/teamStrength';
import { predictMatch } from '@/server/prediction';
import { matchRepository, type MatchWithTeams } from '@/server/repositories/matchRepository';
import { predictionRepository } from '@/server/repositories/predictionRepository';
import { getEnsembleWeights } from '@/server/services/settingsService';
import type { EnsemblePrediction, MatchContext } from '@/types/prediction';

const log = logger.child('prediction');

/** Version stamped on stored predictions so model changes are traceable. */
export const MODEL_VERSION = '1.0.0';

export interface MatchPredictionResult {
  readonly match: MatchWithTeams;
  readonly prediction: EnsemblePrediction;
}

function buildContext(match: MatchWithTeams): MatchContext {
  return {
    neutralVenue: match.neutralVenue,
    homeAdvantage: match.homeAdvantage,
    stage: match.stage,
  };
}

async function persist(matchId: string, prediction: EnsemblePrediction): Promise<void> {
  await predictionRepository.upsert(matchId, MODEL_VERSION, {
    homeWinProbability: prediction.outcome.home,
    drawProbability: prediction.outcome.draw,
    awayWinProbability: prediction.outcome.away,
    expectedHomeGoals: prediction.expectedGoals.home,
    expectedAwayGoals: prediction.expectedGoals.away,
    mostLikelyHomeGoals: prediction.mostLikelyScoreline.home,
    mostLikelyAwayGoals: prediction.mostLikelyScoreline.away,
    confidence: prediction.confidence,
    detail: prediction as unknown as Prisma.InputJsonValue,
  });
}

/**
 * Load a match, run the ensemble, persist the prediction (upsert by model
 * version) and return both. Returns null when the match does not exist.
 */
export async function getMatchPrediction(matchId: string): Promise<MatchPredictionResult | null> {
  const match = await matchRepository.findById(matchId);
  if (!match) {
    return null;
  }
  const weights = await getEnsembleWeights();
  const prediction = predictMatch(toMatchInput(match.homeTeam, match.awayTeam, buildContext(match)), {
    weights,
  });
  await persist(matchId, prediction);
  return { match, prediction };
}

export interface RegenerateResult {
  readonly generated: number;
  readonly failed: number;
}

/**
 * Re-run the ensemble for every current fixture and persist the results, so
 * stored predictions stay in step with freshly synced team strengths. Finished
 * matches are skipped by default to preserve their original pre-match forecast.
 * Resilient: a single failure is logged and counted, never aborting the batch.
 */
export async function regeneratePredictions(
  options: { includeFinished?: boolean } = {},
): Promise<RegenerateResult> {
  const matches = await matchRepository.listAll(200);
  const weights = await getEnsembleWeights();

  let generated = 0;
  let failed = 0;
  for (const match of matches) {
    if (!options.includeFinished && match.status === 'FINISHED') {
      continue;
    }
    try {
      const prediction = predictMatch(
        toMatchInput(match.homeTeam, match.awayTeam, buildContext(match)),
        { weights },
      );
      await persist(match.id, prediction);
      generated += 1;
    } catch (error) {
      failed += 1;
      log.warn('Failed to regenerate prediction', {
        matchId: match.id,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }
  return { generated, failed };
}
