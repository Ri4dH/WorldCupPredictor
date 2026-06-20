import { predictionConfig } from '@/config/prediction';
import { normalizeOutcome } from '@/server/prediction/probability';
import { eloOutcome } from '@/server/prediction/ratings';
import type { MatchPredictionInput, ModelOutput, PredictionModel } from '@/types/prediction';

/**
 * Bayesian update model. Takes the Elo-implied outcome as a prior, then updates
 * it with current-form and squad-availability evidence via a likelihood ratio:
 * posterior ∝ prior × likelihood.
 */
export const bayesianModel: PredictionModel = {
  name: 'bayesian',
  predict(input: MatchPredictionInput): ModelOutput {
    const { home, away, context } = input;
    const homeBonus = context.homeAdvantage ? predictionConfig.homeAdvantageEloBonus : 0;
    const prior = eloOutcome(home.elo + homeBonus, away.elo);

    const { form, availability } = predictionConfig.bayesianEvidence;
    const evidence =
      form * (home.form - away.form) + availability * (home.availability - away.availability);

    // Evidence favoring home scales the home outcome up and the away outcome
    // down symmetrically; the draw likelihood stays neutral.
    const homeLikelihood = Math.exp(evidence);
    const awayLikelihood = Math.exp(-evidence);

    return {
      model: 'bayesian',
      outcome: normalizeOutcome(prior.home * homeLikelihood, prior.draw, prior.away * awayLikelihood),
    };
  },
};
