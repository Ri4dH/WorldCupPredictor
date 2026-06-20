import { predictionConfig } from '@/config/prediction';
import { eloOutcome } from '@/server/prediction/ratings';
import type { MatchPredictionInput, ModelOutput, PredictionModel } from '@/types/prediction';

/**
 * Elo rating model. Converts the rating gap (plus host advantage) into 1X2
 * probabilities via the shared Elo/draw math.
 */
export const eloModel: PredictionModel = {
  name: 'elo',
  predict(input: MatchPredictionInput): ModelOutput {
    const { home, away, context } = input;
    const homeBonus = context.homeAdvantage ? predictionConfig.homeAdvantageEloBonus : 0;

    return {
      model: 'elo',
      outcome: eloOutcome(home.elo + homeBonus, away.elo),
    };
  },
};
