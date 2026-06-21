import { predictionConfig } from '@/config/prediction';
import { explainPrediction } from '@/server/prediction/explainability';
import { allModels } from '@/server/prediction/models';
import { mostLikelyScoreline, normalizeOutcome, topScorelines } from '@/server/prediction/probability';
import type {
  EnsemblePrediction,
  ExpectedGoals,
  MatchPredictionInput,
  ModelName,
  ModelOutput,
  OutcomeProbabilities,
  PredictionModel,
  ScorelineProbability,
} from '@/types/prediction';
import { clamp, weightedMean } from '@/utils/math';

/** How many candidate scorelines to surface alongside the most likely one. */
const TOP_SCORELINE_COUNT = 5;

export type EnsembleWeights = Readonly<Record<ModelName, number>>;

export interface PredictMatchOptions {
  readonly models?: readonly PredictionModel[];
  readonly weights?: EnsembleWeights;
}

function weightFor(weights: EnsembleWeights, model: ModelName): number {
  return weights[model] ?? 0;
}

/** Weighted blend of every model's 1X2 probabilities, renormalized to sum 1. */
function blendOutcome(
  outputs: readonly ModelOutput[],
  weights: EnsembleWeights,
): OutcomeProbabilities {
  let home = 0;
  let draw = 0;
  let away = 0;
  for (const output of outputs) {
    const weight = weightFor(weights, output.model);
    home += output.outcome.home * weight;
    draw += output.outcome.draw * weight;
    away += output.outcome.away * weight;
  }
  return normalizeOutcome(home, draw, away);
}

/** Weighted blend of expected goals across the goal-based models. */
function blendExpectedGoals(
  outputs: readonly ModelOutput[],
  weights: EnsembleWeights,
): ExpectedGoals {
  const home: number[] = [];
  const away: number[] = [];
  const weightList: number[] = [];
  for (const output of outputs) {
    if (output.expectedGoals) {
      home.push(output.expectedGoals.home);
      away.push(output.expectedGoals.away);
      weightList.push(weightFor(weights, output.model));
    }
  }
  if (home.length === 0) {
    const base = predictionConfig.tournamentBaseGoals;
    return { home: base, away: base };
  }
  return { home: weightedMean(home, weightList), away: weightedMean(away, weightList) };
}

/** Weighted blend of the scoreline grids from models that provide them. */
function blendScoreline(
  outputs: readonly ModelOutput[],
  weights: EnsembleWeights,
): ScorelineProbability[] {
  const grid = new Map<string, number>();
  let totalWeight = 0;
  for (const output of outputs) {
    const weight = weightFor(weights, output.model);
    if (!output.scoreline || weight <= 0) {
      continue;
    }
    totalWeight += weight;
    for (const cell of output.scoreline) {
      const key = `${cell.home}-${cell.away}`;
      grid.set(key, (grid.get(key) ?? 0) + cell.probability * weight);
    }
  }
  if (totalWeight <= 0) {
    return [];
  }
  return [...grid.entries()].map(([key, probability]) => {
    const [home, away] = key.split('-').map(Number);
    return { home: home ?? 0, away: away ?? 0, probability: probability / totalWeight };
  });
}

/**
 * Run every model and blend their outputs into a single explainable prediction.
 * Never relies on one algorithm (CLAUDE.md › Prediction Engine). Weights default
 * to the configured ensemble but can be overridden (e.g. by admin settings).
 */
export function predictMatch(
  input: MatchPredictionInput,
  options: PredictMatchOptions = {},
): EnsemblePrediction {
  const models = options.models ?? allModels;
  const weights = options.weights ?? predictionConfig.ensembleWeights;

  const modelOutputs = models.map((model) => model.predict(input));
  const outcome = blendOutcome(modelOutputs, weights);
  const expectedGoals = blendExpectedGoals(modelOutputs, weights);
  const scorelineGrid = blendScoreline(modelOutputs, weights);

  return {
    outcome,
    expectedGoals,
    mostLikelyScoreline: mostLikelyScoreline(scorelineGrid),
    topScorelines: topScorelines(scorelineGrid, TOP_SCORELINE_COUNT),
    confidence: clamp(Math.max(outcome.home, outcome.draw, outcome.away), 0, 1),
    modelOutputs,
    explanation: explainPrediction(input, outcome, expectedGoals),
  };
}
