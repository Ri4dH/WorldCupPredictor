/** Presentation formatters shared across the UI. */

/** Format a 0–1 probability as a percentage string. */
export function formatPercent(value: number, digits = 0): string {
  return `${(value * 100).toFixed(digits)}%`;
}

/** Format a scoreline with an en dash, e.g. `2–1`. */
export function formatScoreline(home: number, away: number): string {
  return `${home}–${away}`;
}

/** Format a kickoff time for display. */
export function formatKickoff(value: string | Date): string {
  const date = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) {
    return 'TBD';
  }
  return date.toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

/**
 * Bottom-line time label for a match.
 * - FINISHED → "Full time"
 * - LIVE / SCHEDULED → the kickoff time (football-data's free tier exposes no
 *   live match minute, so an elapsed clock cannot be shown).
 */
export function formatMatchTimeLabel(status: string, kickoff: string | Date): string {
  return status === 'FINISHED' ? 'Full time' : formatKickoff(kickoff);
}

/** Human-readable label for a tournament stage enum value. */
export function formatStage(stage: string): string {
  return stage
    .toLowerCase()
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
