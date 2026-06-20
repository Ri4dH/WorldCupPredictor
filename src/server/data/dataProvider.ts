import type { Confederation, TeamStrengthValues } from './wc2026Dataset';

/** A team as supplied by a data provider (seed today, live API later). */
export interface ProviderTeam {
  readonly name: string;
  readonly code: string;
  readonly confederation: Confederation;
  readonly group: string;
  readonly flagEmoji: string;
  readonly host: boolean;
  readonly strength: TeamStrengthValues;
}

/**
 * Abstraction over the source of team/match data. The curated seed provider is
 * the default; a live football-data provider can implement the same interface
 * and be swapped in without touching consumers (CLAUDE.md data strategy).
 */
export interface DataProvider {
  readonly source: 'seed' | 'live';
  getTeams(): Promise<readonly ProviderTeam[]>;
}
