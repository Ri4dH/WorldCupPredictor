import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { OutcomeBar } from './OutcomeBar';

describe('OutcomeBar', () => {
  it('renders the three outcome percentages and labels', () => {
    render(<OutcomeBar outcome={{ home: 0.5, draw: 0.3, away: 0.2 }} homeName="Brazil" awayName="Serbia" />);

    expect(screen.getByText('50%')).toBeInTheDocument();
    expect(screen.getByText('30%')).toBeInTheDocument();
    expect(screen.getByText('20%')).toBeInTheDocument();
    expect(screen.getByText('Brazil')).toBeInTheDocument();
    expect(screen.getByRole('img').getAttribute('aria-label')).toContain('Brazil 50%');
  });
});
