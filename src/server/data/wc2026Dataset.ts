import { clamp, round } from '../../utils/math';
import { hashStringToSeed, mulberry32 } from '../../utils/random';

/**
 * Curated FIFA World Cup 2026 seed dataset.
 *
 * Elo ratings and group assignments are realistic approximations for seeding the
 * database — they are intended to be replaced by official data or the live data
 * provider (when a football-data API key is configured). Per-team strength values
 * are derived deterministically from Elo, so the seed is fully reproducible.
 *
 * Relative imports (not the `@/` alias) keep this module loadable by the `tsx`
 * seed script without alias resolution.
 */

export type Confederation = 'UEFA' | 'CONMEBOL' | 'CONCACAF' | 'CAF' | 'AFC' | 'OFC';

export interface SeedTeam {
  readonly name: string;
  readonly code: string;
  readonly confederation: Confederation;
  readonly group: string;
  readonly elo: number;
  readonly flagEmoji: string;
  readonly host?: boolean;
}

export interface TeamStrengthValues {
  readonly elo: number;
  readonly attackStrength: number;
  readonly defenseStrength: number;
  readonly expectedGoalsFor: number;
  readonly expectedGoalsAgainst: number;
  readonly form: number;
  readonly availability: number;
}

export const WC2026_TEAMS: readonly SeedTeam[] = [
  { name: 'Mexico', code: 'MEX', confederation: 'CONCACAF', group: 'A', elo: 1880, flagEmoji: '🇲🇽', host: true },
  { name: 'Croatia', code: 'CRO', confederation: 'UEFA', group: 'A', elo: 1960, flagEmoji: '🇭🇷' },
  { name: 'Nigeria', code: 'NGA', confederation: 'CAF', group: 'A', elo: 1830, flagEmoji: '🇳🇬' },
  { name: 'Saudi Arabia', code: 'KSA', confederation: 'AFC', group: 'A', elo: 1680, flagEmoji: '🇸🇦' },
  { name: 'Canada', code: 'CAN', confederation: 'CONCACAF', group: 'B', elo: 1820, flagEmoji: '🇨🇦', host: true },
  { name: 'Belgium', code: 'BEL', confederation: 'UEFA', group: 'B', elo: 1940, flagEmoji: '🇧🇪' },
  { name: 'Egypt', code: 'EGY', confederation: 'CAF', group: 'B', elo: 1800, flagEmoji: '🇪🇬' },
  { name: 'South Korea', code: 'KOR', confederation: 'AFC', group: 'B', elo: 1790, flagEmoji: '🇰🇷' },
  { name: 'United States', code: 'USA', confederation: 'CONCACAF', group: 'C', elo: 1850, flagEmoji: '🇺🇸', host: true },
  { name: 'Netherlands', code: 'NED', confederation: 'UEFA', group: 'C', elo: 1980, flagEmoji: '🇳🇱' },
  { name: 'Ghana', code: 'GHA', confederation: 'CAF', group: 'C', elo: 1760, flagEmoji: '🇬🇭' },
  { name: 'Qatar', code: 'QAT', confederation: 'AFC', group: 'C', elo: 1700, flagEmoji: '🇶🇦' },
  { name: 'Argentina', code: 'ARG', confederation: 'CONMEBOL', group: 'D', elo: 2090, flagEmoji: '🇦🇷' },
  { name: 'Japan', code: 'JPN', confederation: 'AFC', group: 'D', elo: 1840, flagEmoji: '🇯🇵' },
  { name: 'Senegal', code: 'SEN', confederation: 'CAF', group: 'D', elo: 1850, flagEmoji: '🇸🇳' },
  { name: 'Costa Rica', code: 'CRC', confederation: 'CONCACAF', group: 'D', elo: 1720, flagEmoji: '🇨🇷' },
  { name: 'France', code: 'FRA', confederation: 'UEFA', group: 'E', elo: 2050, flagEmoji: '🇫🇷' },
  { name: 'Uruguay', code: 'URU', confederation: 'CONMEBOL', group: 'E', elo: 1900, flagEmoji: '🇺🇾' },
  { name: 'Iran', code: 'IRN', confederation: 'AFC', group: 'E', elo: 1810, flagEmoji: '🇮🇷' },
  { name: 'Panama', code: 'PAN', confederation: 'CONCACAF', group: 'E', elo: 1690, flagEmoji: '🇵🇦' },
  { name: 'Brazil', code: 'BRA', confederation: 'CONMEBOL', group: 'F', elo: 2020, flagEmoji: '🇧🇷' },
  { name: 'Switzerland', code: 'SUI', confederation: 'UEFA', group: 'F', elo: 1880, flagEmoji: '🇨🇭' },
  { name: 'Cameroon', code: 'CMR', confederation: 'CAF', group: 'F', elo: 1770, flagEmoji: '🇨🇲' },
  { name: 'Australia', code: 'AUS', confederation: 'AFC', group: 'F', elo: 1760, flagEmoji: '🇦🇺' },
  { name: 'Spain', code: 'ESP', confederation: 'UEFA', group: 'G', elo: 2040, flagEmoji: '🇪🇸' },
  { name: 'Denmark', code: 'DEN', confederation: 'UEFA', group: 'G', elo: 1870, flagEmoji: '🇩🇰' },
  { name: 'Ivory Coast', code: 'CIV', confederation: 'CAF', group: 'G', elo: 1780, flagEmoji: '🇨🇮' },
  { name: 'New Zealand', code: 'NZL', confederation: 'OFC', group: 'G', elo: 1620, flagEmoji: '🇳🇿' },
  { name: 'England', code: 'ENG', confederation: 'UEFA', group: 'H', elo: 2000, flagEmoji: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  { name: 'Colombia', code: 'COL', confederation: 'CONMEBOL', group: 'H', elo: 1910, flagEmoji: '🇨🇴' },
  { name: 'Tunisia', code: 'TUN', confederation: 'CAF', group: 'H', elo: 1740, flagEmoji: '🇹🇳' },
  { name: 'Jamaica', code: 'JAM', confederation: 'CONCACAF', group: 'H', elo: 1680, flagEmoji: '🇯🇲' },
  { name: 'Portugal', code: 'POR', confederation: 'UEFA', group: 'I', elo: 1990, flagEmoji: '🇵🇹' },
  { name: 'Sweden', code: 'SWE', confederation: 'UEFA', group: 'I', elo: 1810, flagEmoji: '🇸🇪' },
  { name: 'Algeria', code: 'ALG', confederation: 'CAF', group: 'I', elo: 1790, flagEmoji: '🇩🇿' },
  { name: 'Paraguay', code: 'PAR', confederation: 'CONMEBOL', group: 'I', elo: 1760, flagEmoji: '🇵🇾' },
  { name: 'Germany', code: 'GER', confederation: 'UEFA', group: 'J', elo: 1960, flagEmoji: '🇩🇪' },
  { name: 'Ecuador', code: 'ECU', confederation: 'CONMEBOL', group: 'J', elo: 1830, flagEmoji: '🇪🇨' },
  { name: 'Morocco', code: 'MAR', confederation: 'CAF', group: 'J', elo: 1860, flagEmoji: '🇲🇦' },
  { name: 'Norway', code: 'NOR', confederation: 'UEFA', group: 'J', elo: 1820, flagEmoji: '🇳🇴' },
  { name: 'Italy', code: 'ITA', confederation: 'UEFA', group: 'K', elo: 1950, flagEmoji: '🇮🇹' },
  { name: 'Serbia', code: 'SRB', confederation: 'UEFA', group: 'K', elo: 1820, flagEmoji: '🇷🇸' },
  { name: 'Peru', code: 'PER', confederation: 'CONMEBOL', group: 'K', elo: 1750, flagEmoji: '🇵🇪' },
  { name: 'Austria', code: 'AUT', confederation: 'UEFA', group: 'K', elo: 1850, flagEmoji: '🇦🇹' },
  { name: 'Poland', code: 'POL', confederation: 'UEFA', group: 'L', elo: 1810, flagEmoji: '🇵🇱' },
  { name: 'Ukraine', code: 'UKR', confederation: 'UEFA', group: 'L', elo: 1830, flagEmoji: '🇺🇦' },
  { name: 'Mali', code: 'MLI', confederation: 'CAF', group: 'L', elo: 1720, flagEmoji: '🇲🇱' },
  { name: 'Uzbekistan', code: 'UZB', confederation: 'AFC', group: 'L', elo: 1680, flagEmoji: '🇺🇿' },
];

/** Ordered list of group names present in the dataset. */
export const GROUP_NAMES: readonly string[] = [...new Set(WC2026_TEAMS.map((team) => team.group))].sort();

/**
 * Round-robin pairings (by team index) for a four-team group: six matches in
 * which each side plays the other three exactly once.
 */
export const GROUP_FIXTURE_PAIRS: readonly (readonly [number, number])[] = [
  [0, 1],
  [2, 3],
  [0, 2],
  [3, 1],
  [0, 3],
  [1, 2],
];

/** Deterministically derive a team's strength profile from its Elo rating. */
export function deriveStrength(elo: number, code: string): TeamStrengthValues {
  const random = mulberry32(hashStringToSeed(code));
  const noise = (): number => random() - 0.5;
  const relative = (elo - 1800) / 300;

  const attackStrength = clamp(1.4 + relative * 0.55 + noise() * 0.25, 0.65, 2.7);
  const defenseStrength = clamp(1.4 - relative * 0.5 + noise() * 0.22, 0.6, 2.3);
  const expectedGoalsFor = clamp(attackStrength * (0.95 + noise() * 0.12), 0.6, 2.8);
  const expectedGoalsAgainst = clamp(defenseStrength * (0.97 + noise() * 0.12), 0.55, 2.4);
  const form = clamp(1.4 + relative * 0.7 + noise() * 0.5, 0.3, 2.9);
  const availability = clamp(0.97 + noise() * 0.08, 0.8, 1);

  return {
    elo,
    attackStrength: round(attackStrength, 2),
    defenseStrength: round(defenseStrength, 2),
    expectedGoalsFor: round(expectedGoalsFor, 2),
    expectedGoalsAgainst: round(expectedGoalsAgainst, 2),
    form: round(form, 2),
    availability: round(availability, 2),
  };
}

/** Group the seed teams by their group name, preserving dataset order. */
export function teamsByGroup(): Map<string, SeedTeam[]> {
  const groups = new Map<string, SeedTeam[]>();
  for (const team of WC2026_TEAMS) {
    const existing = groups.get(team.group) ?? [];
    existing.push(team);
    groups.set(team.group, existing);
  }
  return groups;
}
