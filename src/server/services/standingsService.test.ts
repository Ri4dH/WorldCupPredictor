import { describe, expect, it } from 'vitest';

import { computeStandings } from './standingsService';

const teams = [
  { id: 'a', code: 'AAA', name: 'Alpha', flagEmoji: null },
  { id: 'b', code: 'BBB', name: 'Bravo', flagEmoji: null },
  { id: 'c', code: 'CCC', name: 'Charlie', flagEmoji: null },
];

describe('computeStandings', () => {
  it('tallies points and goals, ignores unfinished matches, and sorts', () => {
    const table = computeStandings(teams, [
      { homeTeamId: 'a', awayTeamId: 'b', homeScore: 2, awayScore: 0, status: 'FINISHED' },
      { homeTeamId: 'b', awayTeamId: 'c', homeScore: 1, awayScore: 1, status: 'FINISHED' },
      { homeTeamId: 'a', awayTeamId: 'c', homeScore: 0, awayScore: 0, status: 'SCHEDULED' },
    ]);

    expect(table[0]).toMatchObject({ code: 'AAA', points: 3, goalDifference: 2, played: 1 });
    // Charlie (GD 0) edges Bravo (GD -2) on the tiebreak, both on 1 point.
    expect(table[1]?.code).toBe('CCC');
    expect(table[2]?.code).toBe('BBB');
  });

  it('returns zeroed rows for teams with no finished matches', () => {
    const table = computeStandings(teams, []);
    expect(table).toHaveLength(3);
    expect(table.every((row) => row.played === 0 && row.points === 0)).toBe(true);
  });
});
