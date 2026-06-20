import { predictionConfig } from '@/config/prediction';
import { outcomeFromScoreline, scorelineDistribution } from '@/server/prediction/probability';
import type { MatchContext, ModelName, ModelOutput } from '@/types/prediction';
import { clamp } from '@/utils/math';

/** Floor for a Poisson rate so a side always has a non-zero scoring chance. */
const MIN_GOAL_RATE = 0.15;

/** Apply symmetric host-nation advantage to a pair of goal rates. */
export function applyHomeAdvantage(
  lambdaHome: number,
  lambdaAway: number,
  context: MatchContext,
): [number, number] {
  if (!context.homeAdvantage) {
    return [lambdaHome, lambdaAway];
  }
  const multiplier = predictionConfig.homeAdvantageGoalMultiplier;
  return [lambdaHome * multiplier, lambdaAway / multiplier];
}

/**
 * Turn two raw goal rates into a full model output (outcome + expected goals +
 * scoreline distribution). Shared by every goal-based model so the scoreline
 * machinery lives in exactly one place (DRY).
 */
export function buildGoalModelOutput(
  model: ModelName,
  rawLambdaHome: number,
  rawLambdaAway: number,
  context: MatchContext,
): ModelOutput {
  const maxGoals = predictionConfig.maxGoalsGrid;
  const [adjustedHome, adjustedAway] = applyHomeAdvantage(rawLambdaHome, rawLambdaAway, context);
  const lambdaHome = clamp(adjustedHome, MIN_GOAL_RATE, maxGoals);
  const lambdaAway = clamp(adjustedAway, MIN_GOAL_RATE, maxGoals);
  const distribution = scorelineDistribution(lambdaHome, lambdaAway, maxGoals);

  return {
    model,
    outcome: outcomeFromScoreline(distribution),
    expectedGoals: { home: lambdaHome, away: lambdaAway },
    scoreline: distribution,
  };
}
