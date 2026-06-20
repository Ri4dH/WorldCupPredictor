import { describe, expect, it } from 'vitest';

import { formatKickoff, formatPercent, formatScoreline, formatStage } from './format';

describe('formatPercent', () => {
  it('formats probabilities', () => {
    expect(formatPercent(0.523)).toBe('52%');
    expect(formatPercent(0.5, 1)).toBe('50.0%');
  });
});

describe('formatScoreline', () => {
  it('uses an en dash', () => {
    expect(formatScoreline(2, 1)).toBe('2–1');
  });
});

describe('formatStage', () => {
  it('humanizes enum stages', () => {
    expect(formatStage('GROUP')).toBe('Group');
    expect(formatStage('ROUND_OF_16')).toBe('Round Of 16');
    expect(formatStage('QUARTER_FINAL')).toBe('Quarter Final');
  });
});

describe('formatKickoff', () => {
  it('returns TBD for an invalid date', () => {
    expect(formatKickoff('not-a-date')).toBe('TBD');
  });

  it('formats a valid date', () => {
    expect(formatKickoff('2026-06-15T19:00:00Z')).toContain('Jun');
  });
});
