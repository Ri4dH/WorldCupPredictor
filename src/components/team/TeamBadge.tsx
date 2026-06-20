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
}

function isCrestUrl(value: string): boolean {
  return value.startsWith('http');
}

/** A team's flag/crest with its name or code. Handles crest URLs and emoji flags. */
export function TeamBadge({ team, className, variant = 'name' }: TeamBadgeProps) {
  const flag = team.flagEmoji ?? '';

  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      {isCrestUrl(flag) ? (
        <img
          src={flag}
          alt=""
          width={24}
          height={24}
          className="h-6 w-6 shrink-0 rounded-sm object-contain"
        />
      ) : (
        <span className="text-xl leading-none" aria-hidden>
          {flag || '⚽'}
        </span>
      )}
      {variant === 'name' ? (
        <span className="font-medium">{team.name}</span>
      ) : (
        <span className="font-mono text-sm text-muted-foreground">{team.code}</span>
      )}
    </span>
  );
}
