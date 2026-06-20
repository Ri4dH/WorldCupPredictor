import { cn } from '@/utils/cn';

const STYLES: Record<string, string> = {
  LIVE: 'bg-destructive/15 text-destructive',
  FINISHED: 'bg-muted text-muted-foreground',
  SCHEDULED: 'bg-primary/15 text-primary',
};

const LABELS: Record<string, string> = {
  LIVE: 'Live',
  FINISHED: 'Full time',
  SCHEDULED: 'Upcoming',
};

/** Coloured pill for a match status. */
export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium',
        STYLES[status] ?? 'bg-muted text-muted-foreground',
      )}
    >
      {status === 'LIVE' ? (
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-destructive" aria-hidden />
      ) : null}
      {LABELS[status] ?? status}
    </span>
  );
}
