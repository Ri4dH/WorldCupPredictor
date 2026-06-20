import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { MatchCard, type MatchCardMatch } from './MatchCard';

const base: MatchCardMatch = {
  id: 'm1',
  status: 'FINISHED',
  stage: 'GROUP',
  kickoff: '2026-06-15T19:00:00Z',
  homeScore: 2,
  awayScore: 1,
  homeTeam: { name: 'Argentina', code: 'ARG', flagEmoji: '🇦🇷' },
  awayTeam: { name: 'Japan', code: 'JPN', flagEmoji: '🇯🇵' },
};

describe('MatchCard', () => {
  it('renders teams and the score, linking to the match', () => {
    render(<MatchCard match={base} />);

    expect(screen.getByText('Argentina')).toBeInTheDocument();
    expect(screen.getByText('Japan')).toBeInTheDocument();
    expect(screen.getByText('2–1')).toBeInTheDocument();
    expect(screen.getByRole('link')).toHaveAttribute('href', '/matches/m1');
  });

  it('shows "vs" for matches not yet played', () => {
    render(<MatchCard match={{ ...base, status: 'SCHEDULED', homeScore: null, awayScore: null }} />);
    expect(screen.getByText('vs')).toBeInTheDocument();
  });
});
