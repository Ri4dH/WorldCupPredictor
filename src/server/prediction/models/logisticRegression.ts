import { predictionConfig } from '@/config/prediction';
import { outcomeFromExpectedScore } from '@/server/prediction/probability';
import { drawProbabilityFromElo } from '@/server/prediction/ratings';
import type { MatchPredictionInput, ModelOutput, PredictionModel } from '@/types/prediction';
import { sigmoid } from '@/utils/math';

/**
 * Logistic regression model. A calibrated linear-in-features estimate of the
 * home expected score, split into 1X2 via the shared draw model. Coefficients
 * are configured priors (CLAUDE.md › Principle 7) that a fit on historical
 * results can later replace.
 */
export const logisticRegressionModel: PredictionModel = {
  name: 'logisticRegression',
  predict(input: MatchPredictionInput): ModelOutput {
    const { home, away, context } = input;
    const coefficients = predictionConfig.logisticCoefficients;

    const eloDifference = (home.elo - away.elo) / 100;
    const formDifference = home.form - away.form;
    const expectedGoalsDifference =
      home.expectedGoalsFor -
      home.expectedGoalsAgainst -
      (away.expectedGoalsFor - away.expectedGoalsAgainst);
    const availabilityDifference = home.availability - away.availability;
    const homeAdvantage = context.homeAdvantage ? 1 : 0;

    const z =
      coefficients.intercept +
      coefficients.eloDifferencePer100 * eloDifference +
      coefficients.formDifference * formDifference +
      coefficients.expectedGoalsDifference * expectedGoalsDifference +
      coefficients.availabilityDifference * availabilityDifference +
      coefficients.homeAdvantage * homeAdvantage;

    const effectiveEloDifference =
      home.elo - away.elo + (homeAdvantage ? predictionConfig.homeAdvantageEloBonus : 0);

    return {
      model: 'logisticRegression',
      outcome: outcomeFromExpectedScore(sigmoid(z), drawProbabilityFromElo(effectiveEloDifference)),
    };
  },
};
