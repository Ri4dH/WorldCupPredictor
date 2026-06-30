import { cn } from '@/utils/cn';

export interface TeamBadgeTeam {
  readonly name: string;
  readonly code: string;
  readonly flagEmoji: string | null;
}

interface TeamBadgeProps {
  readonly team: TeamBadgeTeam;
  readonly className?: string;
  readonly variant?: 'name' | 'code';
  readonly size?: 'sm' | 'lg';
}

const SIZES = {
  sm: { box: 24, image: 'h-6 w-6', emoji: 'text-xl', name: 'font-medium' },
  lg: { box: 40, image: 'h-10 w-10', emoji: 'text-4xl', name: 'text-xl font-semibold' },
} as const;

function isCrestUrl(value: string): boolean {
  return value.startsWith('http');
}

/** Just a team's flag/crest (emoji or image). Reused by TeamBadge and the bracket. */
export function TeamFlag({
  flag,
  size = 'sm',
  className,
}: {
  readonly flag: string | null;
  readonly size?: 'sm' | 'lg';
  readonly className?: string;
}) {
  const value = flag ?? '';
  const sizing = SIZES[size];

  return isCrestUrl(value) ? (
    <img
      src={value}
      alt=""
      width={sizing.box}
      height={sizing.box}
      className={cn('shrink-0 rounded-sm object-contain', sizing.image, className)}
    />
  ) : (
    <span className={cn('leading-none', sizing.emoji, className)} aria-hidden>
      {value || '⚽'}
    </span>
  );
}

/** A team's flag/crest with its name or code. Handles crest URLs and emoji flags. */
export function TeamBadge({ team, className, variant = 'name', size = 'sm' }: TeamBadgeProps) {
  const sizing = SIZES[size];

  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <TeamFlag flag={team.flagEmoji} size={size} />
      {variant === 'name' ? (
        <span className={sizing.name}>{team.name}</span>
      ) : (
        <span className="font-mono text-sm text-muted-foreground">{team.code}</span>
      )}
    </span>
  );
}
