import { predictionConfig } from '@/config/prediction';
import { buildGoalModelOutput } from '@/server/prediction/models/goalModel';
import type { MatchPredictionInput, ModelOutput, PredictionModel } from '@/types/prediction';
import { clamp } from '@/utils/math';

/**
 * Gradient Boosted Trees model.
 *
 * XGBoost/LightGBM are Python libraries that cannot run in a serverless Node
 * runtime, so this implements the *inference* side in TypeScript: an additive
 * ensemble of regression trees whose summed leaf values estimate home goal
 * supremacy. The tree array below is a seeded heuristic model; a real model
 * trained on historical matches can replace it by swapping `SUPREMACY_TREES`
 * (same structure) without touching the engine.
 */

interface TreeNode {
  readonly feature?: number;
  readonly threshold?: number;
  readonly left?: TreeNode;
  readonly right?: TreeNode;
  readonly value?: number;
}

function leaf(value: number): TreeNode {
  return { value };
}

function split(feature: number, threshold: number, left: TreeNode, right: TreeNode): TreeNode {
  return { feature, threshold, left, right };
}

// Feature vector: [0] eloDiff/100, [1] formDiff, [2] xGForDiff, [3] availabilityDiff.
const SUPREMACY_TREES: readonly TreeNode[] = [
  split(
    0,
    -2,
    leaf(-0.55),
    split(0, -0.5, leaf(-0.2), split(0, 0.5, leaf(0), split(0, 2, leaf(0.2), leaf(0.55)))),
  ),
  split(1, -0.5, leaf(-0.22), split(1, 0.5, leaf(0), leaf(0.22))),
  split(2, -0.3, leaf(-0.2), split(2, 0.3, leaf(0), leaf(0.2))),
  split(3, -0.2, leaf(-0.16), split(3, 0.2, leaf(0), leaf(0.16))),
];

function evaluateTree(node: TreeNode, features: readonly number[]): number {
  if (node.value !== undefined) {
    return node.value;
  }
  if (node.feature === undefined || node.threshold === undefined || !node.left || !node.right) {
    return 0;
  }
  const featureValue = features[node.feature] ?? 0;
  return evaluateTree(featureValue <= node.threshold ? node.left : node.right, features);
}

export const gradientBoostedTreesModel: PredictionModel = {
  name: 'gradientBoostedTrees',
  predict(input: MatchPredictionInput): ModelOutput {
    const { home, away, context } = input;
    const features: readonly number[] = [
      (home.elo - away.elo) / 100,
      home.form - away.form,
      home.expectedGoalsFor - away.expectedGoalsFor,
      home.availability - away.availability,
    ];

    const supremacy = SUPREMACY_TREES.reduce((total, tree) => total + evaluateTree(tree, features), 0);
    const totalGoals = clamp(home.attackStrength + away.attackStrength, 1.4, 4);
    const lambdaHome = clamp((totalGoals + supremacy) / 2, 0.15, predictionConfig.maxGoalsGrid);
    const lambdaAway = clamp((totalGoals - supremacy) / 2, 0.15, predictionConfig.maxGoalsGrid);

    return buildGoalModelOutput('gradientBoostedTrees', lambdaHome, lambdaAway, context);
  },
};
