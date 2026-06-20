# data

The data layer that feeds the prediction engine.

- `wc2026Dataset.ts` — curated WC2026 teams, groups and round-robin fixtures.
  Team strength is derived deterministically from Elo, so the seed is
  reproducible. Ratings/groups are realistic approximations meant to be replaced
  by official data or the live provider. Uses relative imports so the `tsx` seed
  script can load it.
- `teamStrength.ts` — maps a persisted team row to the engine's `TeamStrength`
  input (and builds a full `MatchPredictionInput`).
- `dataProvider.ts` / `seedDataProvider.ts` — the `DataProvider` abstraction and
  its seed implementation. A live football-data provider can implement the same
  interface and be swapped in via `getDataProvider()` (`index.ts`).
