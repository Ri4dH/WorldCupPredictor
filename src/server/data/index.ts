import { isLiveDataSource } from '@/config/env';

import type { DataProvider } from './dataProvider';
import { liveDataProvider } from './liveDataProvider';
import { seedDataProvider } from './seedDataProvider';

export type { DataProvider, ProviderTeam } from './dataProvider';
export { liveDataProvider } from './liveDataProvider';
export { seedDataProvider } from './seedDataProvider';
export { toMatchInput, toTeamStrength, type TeamStrengthSource } from './teamStrength';

/**
 * The active data provider. Uses the live football-data provider when
 * `PREDICTION_DATA_SOURCE=live` and an API key is configured; otherwise the
 * curated seed provider (CLAUDE.md data strategy: "Both").
 */
export function getDataProvider(): DataProvider {
  return isLiveDataSource() ? liveDataProvider : seedDataProvider;
}
