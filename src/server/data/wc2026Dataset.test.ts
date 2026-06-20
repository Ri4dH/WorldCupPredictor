import { describe, expect, it } from 'vitest';

import {
  deriveStrength,
  GROUP_FIXTURE_PAIRS,
  GROUP_NAMES,
  teamsByGroup,
  WC2026_TEAMS,
} from './wc2026Dataset';

describe('WC2026_TEAMS', () => {
  it('has 48 teams with unique codes', () => {
    expect(WC2026_TEAMS).toHaveLength(48);
    expect(new Set(WC2026_TEAMS.map((team) => team.code)).size).toBe(48);
  });

  it('forms 12 groups of four teams each', () => {
    expect(GROUP_NAMES).toHaveLength(12);
    const groups = teamsByGroup();
    for (const name of GROUP_NAMES) {
      expect(groups.get(name)).toHaveLength(4);
    }
  });

  it('marks exactly the three host nations', () => {
    const hosts = WC2026_TEAMS.filter((team) => team.host).map((team) => team.code);
    expect(hosts.sort()).toEqual(['CAN', 'MEX', 'USA']);
  });
});

describe('deriveStrength', () => {
  it('is deterministic for a given code', () => {
    expect(deriveStrength(1900, 'BRA')).toEqual(deriveStrength(1900, 'BRA'));
  });

  it('keeps every team within sane bounds', () => {
    for (const team of WC2026_TEAMS) {
      const strength = deriveStrength(team.elo, team.code);
      expect(strength.attackStrength).toBeGreaterThanOrEqual(0.65);
      expect(strength.attackStrength).toBeLessThanOrEqual(2.7);
      expect(strength.availability).toBeGreaterThanOrEqual(0.8);
      expect(strength.availability).toBeLessThanOrEqual(1);
      expect(strength.form).toBeGreaterThanOrEqual(0.3);
      expect(strength.form).toBeLessThanOrEqual(2.9);
    }
  });

  it('gives stronger teams more attacking output', () => {
    expect(deriveStrength(2090, 'ARG').attackStrength).toBeGreaterThan(
      deriveStrength(1620, 'NZL').attackStrength,
    );
  });
});

describe('GROUP_FIXTURE_PAIRS', () => {
  it('schedules each of four teams three times across six matches', () => {
    expect(GROUP_FIXTURE_PAIRS).toHaveLength(6);
    const counts = [0, 0, 0, 0];
    for (const [home, away] of GROUP_FIXTURE_PAIRS) {
      counts[home] = (counts[home] ?? 0) + 1;
      counts[away] = (counts[away] ?? 0) + 1;
    }
    expect(counts).toEqual([3, 3, 3, 3]);
  });
});
