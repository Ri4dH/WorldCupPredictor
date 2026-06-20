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

function weightFor(model: ModelName): number {
  return predictionConfig.ensembleWeights[model] ?? 0;
}

/** Weighted blend of every model's 1X2 probabilities, renormalized to sum 1. */
function blendOutcome(outputs: readonly ModelOutput[]): OutcomeProbabilities {
  let home = 0;
  let draw = 0;
  let away = 0;
  for (const output of outputs) {
    const weight = weightFor(output.model);
    home += output.outcome.home * weight;
    draw += output.outcome.draw * weight;
    away += output.outcome.away * weight;
  }
  return normalizeOutcome(home, draw, away);
}

/** Weighted blend of expected goals across the goal-based models. */
function blendExpectedGoals(outputs: readonly ModelOutput[]): ExpectedGoals {
  const home: number[] = [];
  const away: number[] = [];
  const weights: number[] = [];
  for (const output of outputs) {
    if (output.expectedGoals) {
      home.push(output.expectedGoals.home);
      away.push(output.expectedGoals.away);
      weights.push(weightFor(output.model));
    }
  }
  if (home.length === 0) {
    const base = predictionConfig.tournamentBaseGoals;
    return { home: base, away: base };
  }
  return { home: weightedMean(home, weights), away: weightedMean(away, weights) };
}

/** Weighted blend of the scoreline grids from models that provide them. */
function blendScoreline(outputs: readonly ModelOutput[]): ScorelineProbability[] {
  const grid = new Map<string, number>();
  let totalWeight = 0;
  for (const output of outputs) {
    const weight = weightFor(output.model);
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
 * Never relies on one algorithm (CLAUDE.md › Prediction Engine).
 */
export function predictMatch(
  input: MatchPredictionInput,
  models: readonly PredictionModel[] = allModels,
): EnsemblePrediction {
  const modelOutputs = models.map((model) => model.predict(input));
  const outcome = blendOutcome(modelOutputs);
  const expectedGoals = blendExpectedGoals(modelOutputs);
  const scorelineGrid = blendScoreline(modelOutputs);

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
