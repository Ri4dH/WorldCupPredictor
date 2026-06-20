import type { PredictionModel } from '@/types/prediction';

import { bayesianModel } from './bayesian';
import { eloModel } from './elo';
import { expectedGoalsModel } from './expectedGoals';
import { gradientBoostedTreesModel } from './gradientBoostedTrees';
import { logisticRegressionModel } from './logisticRegression';
import { monteCarloModel } from './monteCarlo';
import { poissonModel } from './poisson';

/** Every independent model in the ensemble (CLAUDE.md › Prediction Engine). */
export const allModels: readonly PredictionModel[] = [
  poissonModel,
  eloModel,
  expectedGoalsModel,
  gradientBoostedTreesModel,
  logisticRegressionModel,
  bayesianModel,
  monteCarloModel,
];

export {
  bayesianModel,
  eloModel,
  expectedGoalsModel,
  gradientBoostedTreesModel,
  logisticRegressionModel,
  monteCarloModel,
  poissonModel,
};
