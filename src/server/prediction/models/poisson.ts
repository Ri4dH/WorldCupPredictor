import { predictionConfig } from '@/config/prediction';
import type { MatchPredictionInput, ModelOutput, PredictionModel } from '@/types/prediction';

import { buildGoalModelOutput } from './goalModel';

/**
 * Poisson goal model. Goal rates are derived from each side's scoring and
 * conceding rates relative to the tournament baseline (a Dixon-Coles style
 * attack × opponent-defense interaction).
 */
export const poissonModel: PredictionModel = {
  name: 'poisson',
  predict(input: MatchPredictionInput): ModelOutput {
    const { home, away, context } = input;
    const base = predictionConfig.tournamentBaseGoals;
    const lambdaHome = (home.attackStrength * away.defenseStrength) / base;
    const lambdaAway = (away.attackStrength * home.defenseStrength) / base;

    return buildGoalModelOutput('poisson', lambdaHome, lambdaAway, context);
  },
};
