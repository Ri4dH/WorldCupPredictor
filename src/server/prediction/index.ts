/**
 * Public API of the prediction engine.
 *
 * Consumers (API routes, jobs, scripts) should import from here rather than
 * reaching into individual models, so the internal structure can evolve freely.
 */
export { predictMatch } from '@/server/prediction/ensemble';
export { allModels } from '@/server/prediction/models';
export type {
  EnsemblePrediction,
  MatchPredictionInput,
  ModelOutput,
  PredictionExplanation,
  TeamStrength,
} from '@/types/prediction';
