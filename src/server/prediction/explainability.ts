import type {
  ExpectedGoals,
  MatchOutcome,
  MatchPredictionInput,
  OutcomeProbabilities,
  PredictionExplanation,
  PredictionFactor,
  TournamentStage,
} from '@/types/prediction';
import { clamp } from '@/utils/math';

/** Threshold below which a factor is considered neutral rather than directional. */
const NEUTRAL_BAND = 0.02;

const STAGE_LABELS: Record<TournamentStage, string> = {
  GROUP: 'Group stage',
  ROUND_OF_32: 'Round of 32',
  ROUND_OF_16: 'Round of 16',
  QUARTER_FINAL: 'Quarter-final',
  SEMI_FINAL: 'Semi-final',
  THIRD_PLACE: 'Third-place play-off',
  FINAL: 'Final',
};

function signed(value: number): string {
  return value >= 0 ? `+${value}` : `${value}`;
}

function formatPercent(probability: number): string {
  return `${Math.round(probability * 100)}%`;
}

function makeFactor(label: string, normalizedWeight: number, detail: string): PredictionFactor {
  const weight = clamp(normalizedWeight, -1, 1);
  const impact = weight > NEUTRAL_BAND ? 'HOME' : weight < -NEUTRAL_BAND ? 'AWAY' : 'NEUTRAL';
  return { label, weight, impact, detail };
}

function buildFactors(input: MatchPredictionInput): PredictionFactor[] {
  const { home, away, context } = input;
  const factors: PredictionFactor[] = [
    makeFactor(
      'Elo difference',
      (home.elo - away.elo) / 400,
      `${home.name} ${Math.round(home.elo)} vs ${away.name} ${Math.round(away.elo)} (${signed(Math.round(home.elo - away.elo))})`,
    ),
    makeFactor(
      'Expected goals',
      (home.expectedGoalsFor - away.expectedGoalsFor) / 1.5,
      `xG created ${home.expectedGoalsFor.toFixed(2)} vs ${away.expectedGoalsFor.toFixed(2)} per match`,
    ),
    makeFactor(
      'Recent form',
      (home.form - away.form) / 3,
      `${home.form.toFixed(1)} vs ${away.form.toFixed(1)} points per match`,
    ),
    makeFactor(
      'Injury impact',
      home.availability - away.availability,
      `${formatPercent(home.availability)} vs ${formatPercent(away.availability)} of key players available`,
    ),
  ];

  if (context.homeAdvantage) {
    factors.push(makeFactor('Home advantage', 0.3, `${home.name} play on home soil`));
  }
  factors.push(makeFactor('Tournament context', 0, STAGE_LABELS[context.stage]));

  return factors.sort((a, b) => Math.abs(b.weight) - Math.abs(a.weight));
}

function favoredOutcome(outcome: OutcomeProbabilities): MatchOutcome {
  if (outcome.home >= outcome.draw && outcome.home >= outcome.away) {
    return 'HOME';
  }
  if (outcome.away >= outcome.home && outcome.away >= outcome.draw) {
    return 'AWAY';
  }
  return 'DRAW';
}

function buildSummary(
  input: MatchPredictionInput,
  outcome: OutcomeProbabilities,
  expectedGoals: ExpectedGoals,
): string {
  const score = `${expectedGoals.home.toFixed(1)}–${expectedGoals.away.toFixed(1)}`;
  const favored = favoredOutcome(outcome);

  if (favored === 'DRAW') {
    return `Honours look even — a draw is the most likely result (${formatPercent(outcome.draw)}), with an expected score around ${score}.`;
  }
  const team = favored === 'HOME' ? input.home.name : input.away.name;
  const probability = favored === 'HOME' ? outcome.home : outcome.away;
  return `${team} are favored with a ${formatPercent(probability)} chance, on an expected score around ${score}.`;
}

/**
 * Produce a human-readable explanation of a prediction (CLAUDE.md ›
 * Explainability): the most influential statistics, form, injuries, Elo and xG
 * differences, and tournament context, each with a signed, normalized weight.
 */
export function explainPrediction(
  input: MatchPredictionInput,
  outcome: OutcomeProbabilities,
  expectedGoals: ExpectedGoals,
): PredictionExplanation {
  return {
    summary: buildSummary(input, outcome, expectedGoals),
    factors: buildFactors(input),
  };
}
