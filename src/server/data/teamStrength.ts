import type { MatchContext, MatchPredictionInput, TeamStrength } from '@/types/prediction';

/**
 * The subset of a persisted `Team` needed to build engine input. Declared
 * structurally so callers (and tests) need not construct a full Prisma row.
 */
export interface TeamStrengthSource {
  readonly id: string;
  readonly name: string;
  readonly elo: number;
  readonly attackStrength: number;
  readonly defenseStrength: number;
  readonly expectedGoalsFor: number;
  readonly expectedGoalsAgainst: number;
  readonly form: number;
  readonly availability: number;
}

/** Map a persisted team to the engine's `TeamStrength` input. */
export function toTeamStrength(team: TeamStrengthSource): TeamStrength {
  return {
    id: team.id,
    name: team.name,
    elo: team.elo,
    attackStrength: team.attackStrength,
    defenseStrength: team.defenseStrength,
    expectedGoalsFor: team.expectedGoalsFor,
    expectedGoalsAgainst: team.expectedGoalsAgainst,
    form: team.form,
    availability: team.availability,
  };
}

/** Build a complete prediction input from two persisted teams and match context. */
export function toMatchInput(
  home: TeamStrengthSource,
  away: TeamStrengthSource,
  context: MatchContext,
): MatchPredictionInput {
  return { home: toTeamStrength(home), away: toTeamStrength(away), context };
}
