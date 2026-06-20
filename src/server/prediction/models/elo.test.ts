import { describe, expect, it } from 'vitest';

import { sum } from '@/utils/math';
import { makeInput } from '@tests/fixtures/teams';

import { eloModel } from './elo';

describe('eloModel', () => {
  it('is balanced for equal ratings on a neutral venue', () => {
    const output = eloModel.predict(makeInput({ elo: 1800 }, { elo: 1800 }));
    expect(output.outcome.home).toBeCloseTo(output.outcome.away, 10);
    expect(sum([output.outcome.home, output.outcome.draw, output.outcome.away])).toBeCloseTo(1, 10);
  });

  it('favors the higher-rated side', () => {
    const output = eloModel.predict(makeInput({ elo: 2000 }, { elo: 1600 }));
    expect(output.outcome.home).toBeGreaterThan(output.outcome.away);
    expect(output.outcome.home).toBeGreaterThan(0.5);
  });

  it('lifts the home probability when host advantage applies', () => {
    const neutral = eloModel.predict(makeInput({ elo: 1800 }, { elo: 1800 }, { homeAdvantage: false }));
    const host = eloModel.predict(makeInput({ elo: 1800 }, { elo: 1800 }, { homeAdvantage: true }));
    expect(host.outcome.home).toBeGreaterThan(neutral.outcome.home);
  });

  it('does not emit a scoreline', () => {
    const output = eloModel.predict(makeInput());
    expect(output.model).toBe('elo');
    expect(output.scoreline).toBeUndefined();
  });
});
