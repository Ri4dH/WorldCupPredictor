import { getServerEnv, isLiveDataSource } from '@/config/env';
import { logger } from '@/lib/logger';
import { footballDataClient, type FootballDataMatch, type FootballDataMatchTeam } from '@/server/data/footballDataClient';
import { mapStage, mapStatus } from '@/server/data/liveMatches';
import { toMatchInput, type TeamStrengthSource } from '@/server/data/teamStrength';
import { predictMatch } from '@/server/prediction';
import { matchRepository, type MatchWithTeams } from '@/server/repositories/matchRepository';
import { type EnsembleWeights, getEnsembleWeights } from '@/server/services/settingsService';
import {
  KNOCKOUT_STAGES,
  type BracketData,
  type BracketSlot,
  type BracketTeam,
  type KnockoutStage,
  type LiveBracket,
  type LiveBracketMatch,
  type LiveMatchStatus,
  type PredictedBracket,
  type PredictedBracketMatch,
} from '@/types/bracket';
import type { TournamentStage } from '@/types/prediction';

const log = logger.child('bracket');

/** A team carrying both engine strength and display fields (a persisted Team). */
type BracketTeamFull = TeamStrengthSource & { readonly code: string; readonly flagEmoji: string | null };

const CACHE_TTL_MS = 30_000;
let cache: { data: BracketData; at: number } | null = null;

function toBracketTeam(team: BracketTeamFull): BracketTeam {
  return { id: team.id, name: team.name, code: team.code, flagEmoji: team.flagEmoji };
}

/** Pair adjacent survivors so winners[2i]/winners[2i+1] meet in the next round. */
function pairUp<T>(items: readonly T[]): { home: T; away: T }[] {
  const pairs: { home: T; away: T }[] = [];
  for (let i = 0; i + 1 < items.length; i += 2) {
    pairs.push({ home: items[i] as T, away: items[i + 1] as T });
  }
  return pairs;
}

/** Simulate a single knockout tie; draws are resolved proportionally (ET/pens). */
function predictTie(
  home: BracketTeamFull,
  away: BracketTeamFull,
  stage: TournamentStage,
  weights: EnsembleWeights,
  index: number,
): { match: PredictedBracketMatch; winner: BracketTeamFull; loser: BracketTeamFull } {
  const prediction = predictMatch(
    toMatchInput(home, away, { neutralVenue: true, homeAdvantage: false, stage }),
    { weights },
  );
  const { home: h, draw: d, away: a } = prediction.outcome;
  const decisive = h + a || 1;
  const homeRaw = h + (d * h) / decisive;
  const awayRaw = a + (d * a) / decisive;
  const total = homeRaw + awayRaw || 1;
  const homeAdvanceProbability = homeRaw / total;
  const awayAdvanceProbability = awayRaw / total;
  const homeWins = homeAdvanceProbability >= awayAdvanceProbability;

  return {
    match: {
      id: `${stage}-${index}`,
      stage,
      home: toBracketTeam(home),
      away: toBracketTeam(away),
      homeAdvanceProbability,
      awayAdvanceProbability,
      winnerId: homeWins ? home.id : away.id,
      scoreHome: prediction.mostLikelyScoreline.home,
      scoreAway: prediction.mostLikelyScoreline.away,
      confidence: prediction.confidence,
    },
    winner: homeWins ? home : away,
    loser: homeWins ? away : home,
  };
}

/** Simulate the whole bracket from the Round-of-32 draw to a champion. */
function buildPredictedBracket(
  roundOf32: readonly MatchWithTeams[],
  weights: EnsembleWeights,
): PredictedBracket | null {
  const sorted = [...roundOf32].sort((a, b) => (a.externalId ?? 0) - (b.externalId ?? 0));
  let matchups = sorted.map((match) => ({
    home: match.homeTeam as BracketTeamFull,
    away: match.awayTeam as BracketTeamFull,
  }));
  if (matchups.length === 0) {
    return null;
  }

  const rounds: { stage: KnockoutStage; matches: PredictedBracketMatch[] }[] = [];
  const semiLosers: BracketTeamFull[] = [];
  let champion: BracketTeamFull | null = null;

  for (const stage of KNOCKOUT_STAGES) {
    const matches: PredictedBracketMatch[] = [];
    const winners: BracketTeamFull[] = [];
    matchups.forEach((tie, index) => {
      const { match, winner, loser } = predictTie(tie.home, tie.away, stage, weights, index);
      matches.push(match);
      winners.push(winner);
      if (stage === 'SEMI_FINAL') {
        semiLosers.push(loser);
      }
    });
    rounds.push({ stage, matches });
    if (winners.length <= 1) {
      champion = winners[0] ?? null;
      break;
    }
    matchups = pairUp(winners);
  }

  if (!champion) {
    return null;
  }
  const thirdPlace =
    semiLosers.length === 2
      ? predictTie(
          semiLosers[0] as BracketTeamFull,
          semiLosers[1] as BracketTeamFull,
          'THIRD_PLACE',
          weights,
          0,
        ).match
      : null;

  return { rounds, thirdPlace, champion: toBracketTeam(champion) };
}

function toLiveSlot(team: FootballDataMatchTeam): BracketSlot {
  if (!team.tla) {
    return null;
  }
  return { id: String(team.id ?? team.tla), name: team.name, code: team.tla, flagEmoji: team.crest ?? null };
}

function toLiveMatch(
  match: FootballDataMatch,
  stage: TournamentStage,
  index: number,
  dbIdByExternal: Map<number, string>,
): LiveBracketMatch {
  const home = toLiveSlot(match.homeTeam);
  const away = toLiveSlot(match.awayTeam);
  const status: LiveMatchStatus = home && away ? mapStatus(match.status) : 'TBD';
  return {
    id: `${stage}-${index}`,
    stage,
    home,
    away,
    status,
    homeScore: match.score.fullTime.home,
    awayScore: match.score.fullTime.away,
    kickoff: match.utcDate,
    matchId: dbIdByExternal.get(match.id) ?? null,
  };
}

/** Official bracket from the live feed, positioned by id-order within each stage. */
async function buildLiveBracketFromFeed(dbIdByExternal: Map<number, string>): Promise<LiveBracket | null> {
  let feed: readonly FootballDataMatch[];
  try {
    const response = await footballDataClient.getMatches(getServerEnv().FOOTBALL_DATA_COMPETITION);
    feed = response.matches;
  } catch (error) {
    log.warn('Knockout feed fetch failed; falling back to DB', {
      error: error instanceof Error ? error.message : String(error),
    });
    return null;
  }

  const byStage = new Map<TournamentStage, FootballDataMatch[]>();
  for (const match of feed) {
    const stage = mapStage(match.stage);
    if (stage === 'GROUP') {
      continue;
    }
    const bucket = byStage.get(stage);
    if (bucket) {
      bucket.push(match);
    } else {
      byStage.set(stage, [match]);
    }
  }

  const orderById = (matches: FootballDataMatch[]) => [...matches].sort((a, b) => a.id - b.id);
  const rounds = KNOCKOUT_STAGES.map((stage) => ({
    stage,
    matches: orderById(byStage.get(stage) ?? []).map((match, index) =>
      toLiveMatch(match, stage, index, dbIdByExternal),
    ),
  }));
  const thirdFeed = orderById(byStage.get('THIRD_PLACE') ?? [])[0];
  const thirdPlace = thirdFeed ? toLiveMatch(thirdFeed, 'THIRD_PLACE', 0, dbIdByExternal) : null;

  return { rounds, thirdPlace };
}

/** Degraded bracket from DB knockout matches only (seed mode / feed unavailable). */
function buildLiveBracketFromDb(knockout: readonly MatchWithTeams[]): LiveBracket {
  const slotOf = (team: MatchWithTeams['homeTeam']): BracketSlot => ({
    id: team.id,
    name: team.name,
    code: team.code,
    flagEmoji: team.flagEmoji,
  });
  const toMatch = (match: MatchWithTeams, stage: TournamentStage, index: number): LiveBracketMatch => ({
    id: `${stage}-${index}`,
    stage,
    home: slotOf(match.homeTeam),
    away: slotOf(match.awayTeam),
    status: match.status,
    homeScore: match.homeScore,
    awayScore: match.awayScore,
    kickoff: match.kickoff.toISOString(),
    matchId: match.id,
  });

  const rounds = KNOCKOUT_STAGES.map((stage) => ({
    stage,
    matches: knockout
      .filter((match) => match.stage === stage)
      .sort((a, b) => (a.externalId ?? 0) - (b.externalId ?? 0))
      .map((match, index) => toMatch(match, stage, index)),
  }));
  const third = knockout.find((match) => match.stage === 'THIRD_PLACE');
  return { rounds, thirdPlace: third ? toMatch(third, 'THIRD_PLACE', 0) : null };
}

/**
 * Assemble both bracket views (cached briefly, as the predicted simulation is
 * the page's heaviest work). Returns null until the Round-of-32 draw exists.
 */
export async function getBracketData(): Promise<BracketData | null> {
  if (cache && Date.now() - cache.at < CACHE_TTL_MS) {
    return cache.data;
  }

  const allMatches = await matchRepository.listAll(200);
  const roundOf32 = allMatches.filter((match) => match.stage === 'ROUND_OF_32');
  const weights = await getEnsembleWeights();
  const predicted = buildPredictedBracket(roundOf32, weights);
  if (!predicted) {
    return null;
  }

  const dbIdByExternal = new Map<number, string>();
  for (const match of allMatches) {
    if (match.externalId !== null) {
      dbIdByExternal.set(match.externalId, match.id);
    }
  }

  let live: LiveBracket | null = null;
  if (isLiveDataSource()) {
    live = await buildLiveBracketFromFeed(dbIdByExternal);
  }
  const liveFromSource = live !== null;
  if (!live) {
    live = buildLiveBracketFromDb(allMatches.filter((match) => match.stage !== 'GROUP'));
  }

  const data: BracketData = { predicted, live, liveFromSource };
  cache = { data, at: Date.now() };
  return data;
}
