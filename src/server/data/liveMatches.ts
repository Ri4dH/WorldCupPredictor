import type { MatchStage, MatchStatus } from '@prisma/client';

import type { FootballDataMatch } from './footballDataClient';

/** Extract a group letter from a raw group label ("GROUP_A" -> "A"). */
export function groupLetter(raw: string | null): string {
  return raw?.match(/GROUP[\s_-]?([A-Z])/i)?.[1]?.toUpperCase() ?? '';
}

const STAGE_MAP: Record<string, MatchStage> = {
  GROUP_STAGE: 'GROUP',
  LAST_32: 'ROUND_OF_32',
  ROUND_OF_32: 'ROUND_OF_32',
  LAST_16: 'ROUND_OF_16',
  ROUND_OF_16: 'ROUND_OF_16',
  QUARTER_FINALS: 'QUARTER_FINAL',
  QUARTER_FINAL: 'QUARTER_FINAL',
  SEMI_FINALS: 'SEMI_FINAL',
  SEMI_FINAL: 'SEMI_FINAL',
  THIRD_PLACE: 'THIRD_PLACE',
  FINAL: 'FINAL',
};

const STATUS_MAP: Record<string, MatchStatus> = {
  SCHEDULED: 'SCHEDULED',
  TIMED: 'SCHEDULED',
  IN_PLAY: 'LIVE',
  PAUSED: 'LIVE',
  SUSPENDED: 'LIVE',
  FINISHED: 'FINISHED',
  AWARDED: 'FINISHED',
  POSTPONED: 'SCHEDULED',
  CANCELLED: 'SCHEDULED',
};

export function mapStage(raw: string): MatchStage {
  return STAGE_MAP[raw] ?? 'GROUP';
}

export function mapStatus(raw: string): MatchStatus {
  return STATUS_MAP[raw] ?? 'SCHEDULED';
}

/** Normalized fixture produced from a live match. */
export interface ProviderFixture {
  readonly externalId: number;
  readonly homeCode: string;
  readonly awayCode: string;
  // Full team names are carried alongside the TLA codes because football-data
  // occasionally returns a different TLA for the same team across its endpoints
  // (e.g. "URY" vs "URU" for Uruguay). The name is stable, so the sync uses it
  // as a fallback join key (see matchSyncService).
  readonly homeName: string;
  readonly awayName: string;
  readonly group: string;
  readonly stage: MatchStage;
  readonly status: MatchStatus;
  readonly kickoff: Date;
  readonly homeScore: number | null;
  readonly awayScore: number | null;
}

/** Map a live match to a normalized fixture; null when team codes are missing. */
export function toProviderFixture(match: FootballDataMatch): ProviderFixture | null {
  const homeCode = match.homeTeam.tla;
  const awayCode = match.awayTeam.tla;
  if (!homeCode || !awayCode) {
    return null;
  }
  return {
    externalId: match.id,
    homeCode,
    awayCode,
    homeName: match.homeTeam.name,
    awayName: match.awayTeam.name,
    group: groupLetter(match.group),
    stage: mapStage(match.stage),
    status: mapStatus(match.status),
    kickoff: new Date(match.utcDate),
    homeScore: match.score.fullTime.home,
    awayScore: match.score.fullTime.away,
  };
}
