import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { TeamBadge } from './TeamBadge';

describe('TeamBadge', () => {
  it('renders the team name with an emoji flag', () => {
    render(<TeamBadge team={{ name: 'Brazil', code: 'BRA', flagEmoji: '🇧🇷' }} />);
    expect(screen.getByText('Brazil')).toBeInTheDocument();
  });

  it('renders a crest image for URL flags', () => {
    const { container } = render(
      <TeamBadge team={{ name: 'Brazil', code: 'BRA', flagEmoji: 'https://x/bra.png' }} />,
    );
    expect(container.querySelector('img')).toHaveAttribute('src', 'https://x/bra.png');
  });

  it('shows the code in the code variant', () => {
    render(<TeamBadge team={{ name: 'Brazil', code: 'BRA', flagEmoji: null }} variant="code" />);
    expect(screen.getByText('BRA')).toBeInTheDocument();
  });
});
