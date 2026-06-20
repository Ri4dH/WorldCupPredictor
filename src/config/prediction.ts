import type { ModelName } from '@/types/prediction';

/**
 * Tunable hyperparameters for the prediction engine.
 *
 * Per CLAUDE.md › Principle 7, these values live in configuration rather than
 * being scattered as magic numbers across the models, so they can be calibrated
 * in one place as the engine learns.
 */
export interface PredictionConfig {
  /** Largest goal total modelled per side in scoreline grids. */
  readonly maxGoalsGrid: number;
  /** Tournament-average goals per team per match (the Poisson baseline). */
  readonly tournamentBaseGoals: number;
  /** Goal-rate multiplier applied to a genuine host-nation home side. */
  readonly homeAdvantageGoalMultiplier: number;
  /** Elo points added to a genuine host-nation home side. */
  readonly homeAdvantageEloBonus: number;
  /** Number of simulated matches per Monte Carlo prediction. */
  readonly monteCarloIterations: number;
  /** Peak draw probability when two sides are evenly matched. */
  readonly drawMax: number;
  /** Elo-difference scale controlling how quickly draw probability decays. */
  readonly drawSpread: number;
  /** Logistic-regression coefficients (calibratable priors; trainable later). */
  readonly logisticCoefficients: {
    readonly intercept: number;
    readonly eloDifferencePer100: number;
    readonly formDifference: number;
    readonly expectedGoalsDifference: number;
    readonly availabilityDifference: number;
    readonly homeAdvantage: number;
  };
  /** Evidence weights the Bayesian model applies to the Elo prior. */
  readonly bayesianEvidence: {
    readonly form: number;
    readonly availability: number;
  };
  /** Ensemble blend weights per model (normalized at use). */
  readonly ensembleWeights: Readonly<Record<ModelName, number>>;
}

export const predictionConfig: PredictionConfig = {
  maxGoalsGrid: 8,
  tournamentBaseGoals: 1.35,
  homeAdvantageGoalMultiplier: 1.12,
  homeAdvantageEloBonus: 65,
  monteCarloIterations: 10_000,
  drawMax: 0.3,
  drawSpread: 280,
  logisticCoefficients: {
    intercept: 0,
    eloDifferencePer100: 0.34,
    formDifference: 0.25,
    expectedGoalsDifference: 0.45,
    availabilityDifference: 0.6,
    homeAdvantage: 0.3,
  },
  bayesianEvidence: {
    form: 0.35,
    availability: 0.5,
  },
  ensembleWeights: {
    poisson: 0.18,
    elo: 0.16,
    expectedGoals: 0.16,
    gradientBoostedTrees: 0.18,
    logisticRegression: 0.12,
    bayesian: 0.1,
    monteCarlo: 0.1,
  },
};
