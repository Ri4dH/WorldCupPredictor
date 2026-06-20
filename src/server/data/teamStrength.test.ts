import { describe, expect, it } from 'vitest';

import type { MatchContext } from '@/types/prediction';

import { toMatchInput, toTeamStrength, type TeamStrengthSource } from './teamStrength';

const source: TeamStrengthSource = {
  id: 't1',
  name: 'Brazil',
  elo: 2020,
  attackStrength: 2.1,
  defenseStrength: 0.9,
  expectedGoalsFor: 2.0,
  expectedGoalsAgainst: 0.8,
  form: 2.4,
  availability: 0.95,
};

describe('toTeamStrength', () => {
  it('maps persisted fields to engine input', () => {
    expect(toTeamStrength(source)).toEqual(source);
  });
});

describe('toMatchInput', () => {
  it('builds a full prediction input with context', () => {
    const context: MatchContext = { neutralVenue: true, homeAdvantage: false, stage: 'GROUP' };
    const input = toMatchInput(source, { ...source, id: 't2', name: 'Serbia' }, context);

    expect(input.home.name).toBe('Brazil');
    expect(input.away.name).toBe('Serbia');
    expect(input.context.stage).toBe('GROUP');
  });
});
