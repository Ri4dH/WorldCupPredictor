import { describe, expect, it } from 'vitest';

import type { FootballDataMatch } from './footballDataClient';
import { groupLetter, mapStage, mapStatus, toProviderFixture } from './liveMatches';

describe('groupLetter', () => {
  it('extracts the group letter', () => {
    expect(groupLetter('GROUP_A')).toBe('A');
    expect(groupLetter('GROUP C')).toBe('C');
    expect(groupLetter(null)).toBe('');
  });
});

describe('mapStage / mapStatus', () => {
  it('maps known values and falls back sensibly', () => {
    expect(mapStage('GROUP_STAGE')).toBe('GROUP');
    expect(mapStage('LAST_16')).toBe('ROUND_OF_16');
    expect(mapStage('UNKNOWN')).toBe('GROUP');
    expect(mapStatus('IN_PLAY')).toBe('LIVE');
    expect(mapStatus('FINISHED')).toBe('FINISHED');
    expect(mapStatus('TIMED')).toBe('SCHEDULED');
  });
});

describe('toProviderFixture', () => {
  const base: FootballDataMatch = {
    id: 100,
    utcDate: '2026-06-15T19:00:00Z',
    status: 'FINISHED',
    stage: 'GROUP_STAGE',
    group: 'GROUP_D',
    homeTeam: { tla: 'ARG', name: 'Argentina' },
    awayTeam: { tla: 'JPN', name: 'Japan' },
    score: { fullTime: { home: 2, away: 1 } },
  };

  it('maps a complete match', () => {
    const fixture = toProviderFixture(base);
    expect(fixture).toMatchObject({
      externalId: 100,
      homeCode: 'ARG',
      awayCode: 'JPN',
      group: 'D',
      stage: 'GROUP',
      status: 'FINISHED',
      homeScore: 2,
      awayScore: 1,
    });
    expect(fixture?.kickoff.toISOString()).toBe('2026-06-15T19:00:00.000Z');
  });

  it('returns null when a team code is missing', () => {
    expect(toProviderFixture({ ...base, homeTeam: { tla: null, name: '?' } })).toBeNull();
  });
});
