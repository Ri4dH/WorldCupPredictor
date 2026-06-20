import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { FactorList } from './FactorList';

describe('FactorList', () => {
  it('renders each factor with its impact label', () => {
    render(
      <FactorList
        factors={[
          { label: 'Elo difference', weight: 0.4, impact: 'HOME', detail: 'Higher rated' },
          { label: 'Recent form', weight: -0.2, impact: 'AWAY', detail: 'Away in form' },
          { label: 'Tournament context', weight: 0, impact: 'NEUTRAL', detail: 'Group stage' },
        ]}
      />,
    );

    expect(screen.getByText('Elo difference')).toBeInTheDocument();
    expect(screen.getByText('Favours home')).toBeInTheDocument();
    expect(screen.getByText('Favours away')).toBeInTheDocument();
    expect(screen.getByText('Even')).toBeInTheDocument();
  });
});
