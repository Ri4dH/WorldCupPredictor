import type { Prisma } from '@prisma/client';

import { toMatchInput } from '@/server/data/teamStrength';
import { predictMatch } from '@/server/prediction';
import { matchRepository, type MatchWithTeams } from '@/server/repositories/matchRepository';
import { predictionRepository } from '@/server/repositories/predictionRepository';
import { getEnsembleWeights } from '@/server/services/settingsService';
import type { EnsemblePrediction, MatchContext } from '@/types/prediction';

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
