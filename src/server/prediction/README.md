# Prediction engine

Pure-TypeScript, framework-agnostic ensemble that turns a `MatchPredictionInput`
into an explainable `EnsemblePrediction`. No I/O, no framework imports — every
function is deterministic and unit-tested, which keeps the engine reusable across
competitions (CLAUDE.md › Long-Term Vision).

## Public API

```ts
import { predictMatch } from '@/server/prediction';

const prediction = predictMatch(input); // EnsemblePrediction
```

## Layout

```
ensemble.ts          Runs all models and blends them into the final prediction
explainability.ts    Builds the human-readable factors + summary
probability.ts       Shared 1X2 / scoreline transforms (DRY)
ratings.ts           Shared Elo + draw math
models/
  poisson.ts                Goal-rate distribution from scoring/conceding rates
  expectedGoals.ts          Poisson driven by chance quality (xG)
  elo.ts                    Rating-gap outcome
  logisticRegression.ts     Calibrated linear-in-features baseline
  bayesian.ts               Elo prior updated with form/availability evidence
  gradientBoostedTrees.ts   Additive regression-tree inference (TS) for supremacy
  monteCarlo.ts             Seeded, reproducible match simulation
  goalModel.ts              Shared builder for goal-based models
```

## Design notes

- **Never one algorithm.** Seven independent models each produce probabilities;
  the ensemble blends them with configurable weights (`src/config/prediction.ts`).
- **Reproducible.** Monte Carlo seeds a deterministic PRNG from the fixture, so a
  given input always yields the same prediction.
- **GBT in TypeScript.** XGBoost/LightGBM are Python and cannot run on serverless
  Node, so the gradient-boosted-trees *inference* is implemented here; the tree
  array is a seeded model a trained export can replace without engine changes.
- **Tunables in config.** Baselines, home advantage, draw model, logistic
  coefficients and ensemble weights all live in configuration, not in the models.
