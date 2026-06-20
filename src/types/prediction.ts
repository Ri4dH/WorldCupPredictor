/**
 * Shared domain types for the prediction engine.
 *
 * These types are framework-agnostic and contain no I/O — every model and the
 * ensemble depend only on this contract, which keeps the engine reusable across
 * competitions (see CLAUDE.md › Long-Term Vision).
 */

/** A three-way match outcome from the home team's perspective. */
export type MatchOutcome = 'HOME' | 'DRAW' | 'AWAY';

/** Probabilities for the three match outcomes. Always normalized to sum to 1. */
export interface OutcomeProbabilities {
  readonly home: number;
  readonly draw: number;
  readonly away: number;
}

/** Expected (mean) goals for each side. */
export interface ExpectedGoals {
  readonly home: number;
  readonly away: number;
}

/** A single exact scoreline and its probability. */
export interface ScorelineProbability {
  readonly home: number;
  readonly away: number;
  readonly probability: number;
}

/** Snapshot of a team's strength used as model input. */
export interface TeamStrength {
  readonly id: string;
  readonly name: string;
  /** Elo rating, typically ~1200–2100. */
  readonly elo: number;
  /** Mean goals scored per match over the rating window. */
  readonly attackStrength: number;
  /** Mean goals conceded per match over the rating window. */
  readonly defenseStrength: number;
  /** Expected goals created per match (chance quality). */
  readonly expectedGoalsFor: number;
  /** Expected goals conceded per match. */
  readonly expectedGoalsAgainst: number;
  /** Recent form as points-per-match over the last N matches (0–3). */
  readonly form: number;
  /** Share of key players available, 0–1 (1 = full-strength squad). */
  readonly availability: number;
}

/** Tournament round, used for context weighting. */
export type TournamentStage =
  | 'GROUP'
  | 'ROUND_OF_32'
  | 'ROUND_OF_16'
  | 'QUARTER_FINAL'
  | 'SEMI_FINAL'
  | 'THIRD_PLACE'
  | 'FINAL';

/** Where and how a fixture is played. */
export interface MatchContext {
  /** True when neither side plays at home (the default for World Cup fixtures). */
  readonly neutralVenue: boolean;
  /** True when the home side has genuine host-nation advantage. */
  readonly homeAdvantage: boolean;
  readonly stage: TournamentStage;
}

/** Complete input to the engine for one fixture. */
export interface MatchPredictionInput {
  readonly home: TeamStrength;
  readonly away: TeamStrength;
  readonly context: MatchContext;
}

/** Identifies each independent model in the ensemble. */
export type ModelName =
  | 'poisson'
  | 'elo'
  | 'expectedGoals'
  | 'gradientBoostedTrees'
  | 'logisticRegression'
  | 'bayesian'
  | 'monteCarlo';

/** Output produced by a single model. */
export interface ModelOutput {
  readonly model: ModelName;
  readonly outcome: OutcomeProbabilities;
  /** Provided by goal-based models (Poisson, xG, Monte Carlo). */
  readonly expectedGoals?: ExpectedGoals;
  /** Provided by models that produce a full scoreline distribution. */
  readonly scoreline?: readonly ScorelineProbability[];
}

/** A model that turns match input into probabilities. Pure and deterministic. */
export interface PredictionModel {
  readonly name: ModelName;
  predict(input: MatchPredictionInput): ModelOutput;
}

/** Which side a factor favors. */
export type FactorImpact = 'HOME' | 'AWAY' | 'NEUTRAL';

/** A single human-readable driver behind a prediction (explainability). */
export interface PredictionFactor {
  readonly label: string;
  /** Signed magnitude in [-1, 1]; positive favors the home side. */
  readonly weight: number;
  readonly impact: FactorImpact;
  readonly detail: string;
}

/** The reasons behind a prediction (CLAUDE.md › Explainability). */
export interface PredictionExplanation {
  readonly summary: string;
  readonly factors: readonly PredictionFactor[];
}

/** The final ensemble prediction returned to callers. */
export interface EnsemblePrediction {
  readonly outcome: OutcomeProbabilities;
  readonly expectedGoals: ExpectedGoals;
  readonly mostLikelyScoreline: ScorelineProbability;
  readonly topScorelines: readonly ScorelineProbability[];
  /** Confidence in the favored outcome, 0–1. */
  readonly confidence: number;
  readonly modelOutputs: readonly ModelOutput[];
  readonly explanation: PredictionExplanation;
}
