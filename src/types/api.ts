import type { EnsemblePrediction } from './prediction';

/** Standard API envelope returned by every `/api/v1` route. */
export interface ApiEnvelope<T> {
  readonly success: boolean;
  readonly data: T;
  readonly error: string | null;
  readonly message: string;
}

/** Team fields the UI renders (a subset of the persisted row, JSON-safe). */
export interface TeamDTO {
  readonly id: string;
  readonly name: string;
  readonly code: string;
  readonly flagEmoji: string | null;
  readonly elo: number;
  readonly form: number;
  readonly confederation: string;
}

export interface PredictionMatchSummary {
  readonly id: string;
  readonly stage: string;
  readonly kickoff: string;
  readonly venue: string | null;
  readonly homeTeam: TeamDTO;
  readonly awayTeam: TeamDTO;
}

/** Body of `GET /api/v1/matches/:id/prediction`. */
export interface MatchPredictionResponse {
  readonly match: PredictionMatchSummary;
  readonly prediction: EnsemblePrediction;
}
