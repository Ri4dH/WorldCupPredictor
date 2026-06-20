import { predictionConfig } from '@/config/prediction';
import { outcomeFromExpectedScore } from '@/server/prediction/probability';
import type { OutcomeProbabilities } from '@/types/prediction';

/**
 * Elo-derived probabilities shared by the Elo, Bayesian and Logistic models so
 * the rating math is defined exactly once (DRY).
 */

/** Logistic Elo expected score for the home side (win = 1, draw = 0.5). */
export function eloExpectedScore(eloHome: number, eloAway: number): number {
  return 1 / (1 + 10 ** ((eloAway - eloHome) / 400));
}

/** Draw probability that peaks for evenly matched sides and decays with the gap. */
export function drawProbabilityFromElo(eloDifference: number): number {
  const { drawMax, drawSpread } = predictionConfig;
  return drawMax * Math.exp(-((eloDifference / drawSpread) ** 2));
}

/** Full 1X2 outcome implied by two Elo ratings. */
export function eloOutcome(eloHome: number, eloAway: number): OutcomeProbabilities {
  return outcomeFromExpectedScore(
    eloExpectedScore(eloHome, eloAway),
    drawProbabilityFromElo(eloHome - eloAway),
  );
}
