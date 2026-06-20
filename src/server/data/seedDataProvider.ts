import type { DataProvider, ProviderTeam } from './dataProvider';
import { deriveStrength, WC2026_TEAMS } from './wc2026Dataset';

/** Default provider: the curated, reproducible World Cup 2026 dataset. */
export const seedDataProvider: DataProvider = {
  source: 'seed',
  getTeams(): Promise<readonly ProviderTeam[]> {
    const teams: ProviderTeam[] = WC2026_TEAMS.map((team) => ({
      name: team.name,
      code: team.code,
      confederation: team.confederation,
      group: team.group,
      flagEmoji: team.flagEmoji,
      host: team.host ?? false,
      strength: deriveStrength(team.elo, team.code),
    }));
    return Promise.resolve(teams);
  },
};
