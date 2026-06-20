import type { DataProvider } from './dataProvider';
import { seedDataProvider } from './seedDataProvider';

export type { DataProvider, ProviderTeam } from './dataProvider';
export { seedDataProvider } from './seedDataProvider';
export { toMatchInput, toTeamStrength, type TeamStrengthSource } from './teamStrength';

/**
 * The active data provider. Returns the curated seed provider today; a live
 * football-data provider implementing `DataProvider` slots in here once a
 * FOOTBALL_DATA_API_KEY integration is added (CLAUDE.md data strategy: "Both").
 */
export function getDataProvider(): DataProvider {
  return seedDataProvider;
}
