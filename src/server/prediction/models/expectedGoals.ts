import { predictionConfig } from '@/config/prediction';
import type { MatchPredictionInput, ModelOutput, PredictionModel } from '@/types/prediction';

import { buildGoalModelOutput } from './goalModel';

/**
 * Expected Goals (xG) model. Structurally a Poisson model, but driven by chance
 * quality (xG for / against) rather than actual goals, so it rewards teams that
 * create good chances even when finishing has lagged.
 */
export const expectedGoalsModel: PredictionModel = {
  name: 'expectedGoals',
  predict(input: MatchPredictionInput): ModelOutput {
    const { home, away, context } = input;
    const base = predictionConfig.tournamentBaseGoals;
    const lambdaHome = (home.expectedGoalsFor * away.expectedGoalsAgainst) / base;
    const lambdaAway = (away.expectedGoalsFor * home.expectedGoalsAgainst) / base;

    return buildGoalModelOutput('expectedGoals', lambdaHome, lambdaAway, context);
  },
};
