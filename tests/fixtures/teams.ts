import type { MatchContext, MatchPredictionInput, TeamStrength } from '@/types/prediction';

/** Build a `TeamStrength` with sensible mid-table defaults. */
export function makeTeam(overrides: Partial<TeamStrength> = {}): TeamStrength {
  return {
    id: 'team',
    name: 'Test Team',
    elo: 1700,
    attackStrength: 1.4,
    defenseStrength: 1.1,
    expectedGoalsFor: 1.4,
    expectedGoalsAgainst: 1.1,
    form: 1.6,
    availability: 1,
    ...overrides,
  };
}

export function makeContext(overrides: Partial<MatchContext> = {}): MatchContext {
  return { neutralVenue: true, homeAdvantage: false, stage: 'GROUP', ...overrides };
}

/** Build a full `MatchPredictionInput`, overriding only what a test cares about. */
export function makeInput(
  home: Partial<TeamStrength> = {},
  away: Partial<TeamStrength> = {},
  context: Partial<MatchContext> = {},
): MatchPredictionInput {
  return {
    home: makeTeam({ id: 'home', name: 'Home', ...home }),
    away: makeTeam({ id: 'away', name: 'Away', ...away }),
    context: makeContext(context),
  };
}
