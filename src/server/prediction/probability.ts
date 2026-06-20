import type { ExpectedGoals, OutcomeProbabilities, ScorelineProbability } from '@/types/prediction';
import { clamp, normalize, poissonProbability } from '@/utils/math';

/**
 * Shared probability transforms used by several models and the ensemble.
 * Keeping them here avoids duplicating the 1X2 / scoreline logic (DRY).
 */

const EMPTY_SCORELINE: ScorelineProbability = { home: 0, away: 0, probability: 0 };

/** Clamp three raw outcome scores to be non-negative and renormalize to sum 1. */
export function normalizeOutcome(home: number, draw: number, away: number): OutcomeProbabilities {
  const [normalizedHome, normalizedDraw, normalizedAway] = normalize([
    Math.max(home, 0),
    Math.max(draw, 0),
    Math.max(away, 0),
  ]);
  return {
    home: normalizedHome ?? 0,
    draw: normalizedDraw ?? 0,
    away: normalizedAway ?? 0,
  };
}

/**
 * Derive 1X2 probabilities from a home expected score (0..1, where 0.5 is even)
 * and a draw probability, preserving the identity homeWin + 0.5·draw ≈ score.
 */
export function outcomeFromExpectedScore(
  expectedScore: number,
  drawProbability: number,
): OutcomeProbabilities {
  const score = clamp(expectedScore, 0, 1);
  const draw = clamp(drawProbability, 0, 0.6);
  const home = clamp(score - draw / 2, 0, 1);
  const away = clamp(1 - home - draw, 0, 1);
  return normalizeOutcome(home, draw, away);
}

/** Build a scoreline distribution from two independent Poisson goal rates. */
export function scorelineDistribution(
  lambdaHome: number,
  lambdaAway: number,
  maxGoals: number,
): ScorelineProbability[] {
  const distribution: ScorelineProbability[] = [];
  for (let home = 0; home <= maxGoals; home += 1) {
    const pHome = poissonProbability(home, lambdaHome);
    for (let away = 0; away <= maxGoals; away += 1) {
      distribution.push({ home, away, probability: pHome * poissonProbability(away, lambdaAway) });
    }
  }
  // Truncating at maxGoals discards a little probability mass, so renormalize.
  const total = distribution.reduce((acc, cell) => acc + cell.probability, 0);
  if (total <= 0) {
    return distribution;
  }
  return distribution.map((cell) => ({ ...cell, probability: cell.probability / total }));
}

/** Aggregate a scoreline distribution into 1X2 outcome probabilities. */
export function outcomeFromScoreline(
  distribution: readonly ScorelineProbability[],
): OutcomeProbabilities {
  let home = 0;
  let draw = 0;
  let away = 0;
  for (const cell of distribution) {
    if (cell.home > cell.away) {
      home += cell.probability;
    } else if (cell.home === cell.away) {
      draw += cell.probability;
    } else {
      away += cell.probability;
    }
  }
  return normalizeOutcome(home, draw, away);
}

/** Mean goals per side implied by a scoreline distribution. */
export function expectedGoalsFromScoreline(
  distribution: readonly ScorelineProbability[],
): ExpectedGoals {
  let home = 0;
  let away = 0;
  for (const cell of distribution) {
    home += cell.home * cell.probability;
    away += cell.away * cell.probability;
  }
  return { home, away };
}

/** The single most probable scoreline (or 0-0 for an empty distribution). */
export function mostLikelyScoreline(
  distribution: readonly ScorelineProbability[],
): ScorelineProbability {
  return distribution.reduce((best, cell) => (cell.probability > best.probability ? cell : best), EMPTY_SCORELINE);
}

/** The `count` most probable scorelines, highest first. */
export function topScorelines(
  distribution: readonly ScorelineProbability[],
  count: number,
): ScorelineProbability[] {
  return [...distribution].sort((a, b) => b.probability - a.probability).slice(0, Math.max(count, 0));
}
