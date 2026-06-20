import { describe, expect, it } from 'vitest';

import type { ExpectedGoals, OutcomeProbabilities } from '@/types/prediction';
import { makeInput } from '@tests/fixtures/teams';

import { explainPrediction } from './explainability';

const expectedGoals: ExpectedGoals = { home: 1.6, away: 1.1 };

function findFactor(label: string, input = makeInput({ elo: 1950 }, { elo: 1600 })) {
  const outcome: OutcomeProbabilities = { home: 0.55, draw: 0.27, away: 0.18 };
  return explainPrediction(input, outcome, expectedGoals).factors.find((factor) => factor.label === label);
}

describe('explainPrediction', () => {
  it('covers the CLAUDE.md explainability factors', () => {
    const labels = ['Elo difference', 'Expected goals', 'Recent form', 'Injury impact'];
    for (const label of labels) {
      expect(findFactor(label)).toBeDefined();
    }
  });

  it('marks a higher-rated home side as a home-favoring factor', () => {
    const elo = findFactor('Elo difference');
    expect(elo?.impact).toBe('HOME');
    expect(elo?.weight ?? 0).toBeGreaterThan(0);
  });

  it('ranks factors by absolute influence', () => {
    const { factors } = explainPrediction(
      makeInput({ elo: 2000 }, { elo: 1500 }),
      { home: 0.6, draw: 0.25, away: 0.15 },
      expectedGoals,
    );
    for (let i = 1; i < factors.length; i += 1) {
      expect(Math.abs(factors[i - 1]?.weight ?? 0)).toBeGreaterThanOrEqual(Math.abs(factors[i]?.weight ?? 0));
    }
  });

  it('names the favored side in the summary', () => {
    const summary = explainPrediction(
      makeInput({ name: 'Argentina', elo: 2000 }, { name: 'Minnows', elo: 1500 }),
      { home: 0.7, draw: 0.2, away: 0.1 },
      expectedGoals,
    ).summary;
    expect(summary).toContain('Argentina');
  });

  it('adds a home-advantage factor only when hosting', () => {
    expect(findFactor('Home advantage', makeInput({}, {}, { homeAdvantage: true }))).toBeDefined();
    expect(findFactor('Home advantage', makeInput({}, {}, { homeAdvantage: false }))).toBeUndefined();
  });
});
