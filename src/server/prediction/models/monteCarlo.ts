import { predictionConfig } from '@/config/prediction';
import { applyHomeAdvantage } from '@/server/prediction/models/goalModel';
import { normalizeOutcome } from '@/server/prediction/probability';
import type {
  MatchPredictionInput,
  ModelOutput,
  PredictionModel,
  ScorelineProbability,
} from '@/types/prediction';
import { clamp } from '@/utils/math';
import { hashStringToSeed, mulberry32, samplePoisson } from '@/utils/random';

/**
 * Monte Carlo model. Simulates the fixture many times by drawing goals from
 * each side's Poisson rate, then tallies outcomes and scorelines. Seeded from
 * the fixture so results are reproducible (CLAUDE.md › Mission).
 */
export const monteCarloModel: PredictionModel = {
  name: 'monteCarlo',
  predict(input: MatchPredictionInput): ModelOutput {
    const { home, away, context } = input;
    const { tournamentBaseGoals, maxGoalsGrid, monteCarloIterations } = predictionConfig;

    const rawHome = (home.attackStrength * away.defenseStrength) / tournamentBaseGoals;
    const rawAway = (away.attackStrength * home.defenseStrength) / tournamentBaseGoals;
    const [adjustedHome, adjustedAway] = applyHomeAdvantage(rawHome, rawAway, context);
    const lambdaHome = clamp(adjustedHome, 0.15, maxGoalsGrid);
    const lambdaAway = clamp(adjustedAway, 0.15, maxGoalsGrid);

    const seed = hashStringToSeed(
      `${home.id}:${away.id}:${Math.round(home.elo)}:${Math.round(away.elo)}`,
    );
    const random = mulberry32(seed);

    let homeWins = 0;
    let draws = 0;
    let awayWins = 0;
    let totalHomeGoals = 0;
    let totalAwayGoals = 0;
    const scorelineCounts = new Map<string, number>();

    for (let i = 0; i < monteCarloIterations; i += 1) {
      const homeGoals = samplePoisson(lambdaHome, random);
      const awayGoals = samplePoisson(lambdaAway, random);
      totalHomeGoals += homeGoals;
      totalAwayGoals += awayGoals;

      if (homeGoals > awayGoals) {
        homeWins += 1;
      } else if (homeGoals === awayGoals) {
        draws += 1;
      } else {
        awayWins += 1;
      }

      const key = `${Math.min(homeGoals, maxGoalsGrid)}-${Math.min(awayGoals, maxGoalsGrid)}`;
      scorelineCounts.set(key, (scorelineCounts.get(key) ?? 0) + 1);
    }

    const scoreline: ScorelineProbability[] = [...scorelineCounts.entries()].map(([key, count]) => {
      const [homeGoals, awayGoals] = key.split('-').map(Number);
      return { home: homeGoals ?? 0, away: awayGoals ?? 0, probability: count / monteCarloIterations };
    });

    return {
      model: 'monteCarlo',
      outcome: normalizeOutcome(homeWins, draws, awayWins),
      expectedGoals: {
        home: totalHomeGoals / monteCarloIterations,
        away: totalAwayGoals / monteCarloIterations,
      },
      scoreline,
    };
  },
};
