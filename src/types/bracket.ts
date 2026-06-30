/**
 * DTOs for the knockout bracket page.
 *
 * Two views are produced from one shared topology (the official single-
 * elimination draw, where knockout fixtures are ordered so adjacent pairs feed
 * the next round): an AI-simulated bracket from the prediction engine, and the
 * live/official bracket from real results.
 */
import type { TournamentStage } from '@/types/prediction';

/** The knockout rounds, in order, that the bracket renders. */
export const KNOCKOUT_STAGES = [
  'ROUND_OF_32',
  'ROUND_OF_16',
  'QUARTER_FINAL',
  'SEMI_FINAL',
  'FINAL',
] as const satisfies readonly TournamentStage[];

export type KnockoutStage = (typeof KNOCKOUT_STAGES)[number];

/** Minimal team shape for bracket rendering (compatible with TeamBadge). */
export interface BracketTeam {
  readonly id: string;
  readonly name: string;
  readonly code: string;
  /** Emoji or crest URL, as stored on Team.flagEmoji / provided by the feed. */
  readonly flagEmoji: string | null;
}

/** A bracket slot: a known team or a not-yet-determined placeholder. */
export type BracketSlot = BracketTeam | null;

/** One simulated knockout tie produced by the prediction engine. */
export interface PredictedBracketMatch {
  readonly id: string;
  readonly stage: TournamentStage;
  readonly home: BracketTeam;
  readonly away: BracketTeam;
  /** Probability (0–1) each side advances, after resolving draws via the engine. */
  readonly homeAdvanceProbability: number;
  readonly awayAdvanceProbability: number;
  readonly winnerId: string;
  /** Engine's most-likely scoreline, oriented home–away. */
  readonly scoreHome: number;
  readonly scoreAway: number;
  /** Engine confidence in the favored outcome (0–1). */
  readonly confidence: number;
}

/** The full AI-simulated bracket, advancing predicted winners to a champion. */
export interface PredictedBracket {
  readonly rounds: readonly { readonly stage: KnockoutStage; readonly matches: readonly PredictedBracketMatch[] }[];
  readonly thirdPlace: PredictedBracketMatch | null;
  readonly champion: BracketTeam;
}

export type LiveMatchStatus = 'SCHEDULED' | 'LIVE' | 'FINISHED' | 'TBD';

/** One real/official knockout tie (results when played, kickoff when upcoming). */
export interface LiveBracketMatch {
  readonly id: string;
  readonly stage: TournamentStage;
  readonly home: BracketSlot;
  readonly away: BracketSlot;
  readonly status: LiveMatchStatus;
  readonly homeScore: number | null;
  readonly awayScore: number | null;
  /** ISO kickoff string when known. */
  readonly kickoff: string | null;
  /** Our DB match id when this tie exists in the database (links to detail). */
  readonly matchId: string | null;
}

/** The official tournament bracket as it stands. */
export interface LiveBracket {
  readonly rounds: readonly { readonly stage: KnockoutStage; readonly matches: readonly LiveBracketMatch[] }[];
  readonly thirdPlace: LiveBracketMatch | null;
}

/** Everything the bracket page needs. */
export interface BracketData {
  readonly predicted: PredictedBracket;
  readonly live: LiveBracket;
  /** True when the live view reflects the real feed; false in degraded mode. */
  readonly liveFromSource: boolean;
}
