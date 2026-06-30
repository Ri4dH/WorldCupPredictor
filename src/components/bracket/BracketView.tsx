'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Trophy } from 'lucide-react';
import { type ReactNode, useState } from 'react';

import { TeamFlag } from '@/components/team/TeamBadge';
import type { BracketData, BracketTeam, LiveMatchStatus } from '@/types/bracket';
import { cn } from '@/utils/cn';

import { LiveTieCard } from './LiveTieCard';
import { PredictedTieCard } from './PredictedTieCard';

const STAGE_LABELS: Record<string, string> = {
  ROUND_OF_32: 'Round of 32',
  ROUND_OF_16: 'Round of 16',
  QUARTER_FINAL: 'Quarterfinals',
  SEMI_FINAL: 'Semifinals',
  FINAL: 'Final',
  THIRD_PLACE: 'Third place',
};

type View = 'predicted' | 'live';

/** Equal-height column whose ties flex-distribute so rounds line up as a bracket. */
function RoundColumn({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex w-[158px] shrink-0 flex-col sm:w-[186px]">
      <h3 className="mb-2 text-center text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </h3>
      <div className="flex flex-1 flex-col">{children}</div>
    </div>
  );
}

function Tie({ index, round, delay, children }: { index: number; round: number; delay: number; children: ReactNode }) {
  return (
    <motion.div
      className="flex flex-1 items-center py-1"
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: round * 0.28 + index * 0.04 + delay, duration: 0.35, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}

function ChampionBanner({ champion, delay }: { champion: BracketTeam; delay: number }) {
  return (
    <motion.div
      className="mb-5 flex items-center gap-3 rounded-xl border border-accent/40 bg-gradient-to-r from-accent/15 to-transparent p-3.5 shadow-[0_0_28px_-10px] shadow-accent/50"
      initial={{ opacity: 0, y: -8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, type: 'spring', stiffness: 180, damping: 16 }}
    >
      <Trophy className="h-7 w-7 shrink-0 text-accent" aria-hidden />
      <div className="min-w-0">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-accent">
          Predicted champion
        </div>
        <div className="mt-0.5 flex items-center gap-2">
          <TeamFlag flag={champion.flagEmoji} size="lg" />
          <span className="truncate text-lg font-bold">{champion.name}</span>
        </div>
      </div>
    </motion.div>
  );
}

function BracketScroller({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-x-auto pb-3">
      <div className="flex min-w-max gap-3 md:gap-4">{children}</div>
    </div>
  );
}

function PredictedBracket({ bracket }: { bracket: BracketData['predicted'] }) {
  return (
    <div className="space-y-6">
      <ChampionBanner champion={bracket.champion} delay={0.5} />
      <BracketScroller>
        {bracket.rounds.map((round, roundIndex) => (
          <RoundColumn key={round.stage} label={STAGE_LABELS[round.stage] ?? round.stage}>
            {round.matches.map((match, index) => (
              <Tie key={match.id} index={index} round={roundIndex} delay={0}>
                <PredictedTieCard match={match} />
              </Tie>
            ))}
          </RoundColumn>
        ))}
      </BracketScroller>

      {bracket.thirdPlace ? (
        <div className="max-w-xs">
          <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {STAGE_LABELS.THIRD_PLACE}
          </h3>
          <PredictedTieCard match={bracket.thirdPlace} />
        </div>
      ) : null}
    </div>
  );
}

const LEGEND: { status: LiveMatchStatus; label: string; dot: string }[] = [
  { status: 'FINISHED', label: 'Completed', dot: 'bg-muted-foreground' },
  { status: 'LIVE', label: 'Live', dot: 'bg-destructive' },
  { status: 'SCHEDULED', label: 'Upcoming', dot: 'bg-primary' },
  { status: 'TBD', label: 'To be decided', dot: 'bg-border' },
];

function LiveBracket({ bracket, fromSource }: { bracket: BracketData['live']; fromSource: boolean }) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
        {LEGEND.map((item) => (
          <span key={item.status} className="flex items-center gap-1.5">
            <span className={cn('h-2 w-2 rounded-full', item.dot)} aria-hidden />
            {item.label}
          </span>
        ))}
      </div>

      <BracketScroller>
        {bracket.rounds.map((round) => (
          <RoundColumn key={round.stage} label={STAGE_LABELS[round.stage] ?? round.stage}>
            {round.matches.map((match) => (
              <div key={match.id} className="flex flex-1 items-center py-1">
                <LiveTieCard match={match} />
              </div>
            ))}
          </RoundColumn>
        ))}
      </BracketScroller>

      {bracket.thirdPlace ? (
        <div className="max-w-xs">
          <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {STAGE_LABELS.THIRD_PLACE}
          </h3>
          <LiveTieCard match={bracket.thirdPlace} />
        </div>
      ) : null}

      {!fromSource ? (
        <p className="text-xs text-muted-foreground">
          Showing fixtures from the database; later rounds appear as the draw is confirmed.
        </p>
      ) : null}
    </div>
  );
}

const TABS: { id: View; label: string }[] = [
  { id: 'predicted', label: 'AI Predicted' },
  { id: 'live', label: 'Live Tournament' },
];

/** Bracket page body: a toggle between the AI-simulated and official brackets. */
export function BracketView({ data }: { data: BracketData }) {
  const [view, setView] = useState<View>('predicted');

  return (
    <div>
      <div
        role="tablist"
        aria-label="Bracket view"
        className="mb-5 inline-flex rounded-lg border border-border bg-card p-1 text-sm"
      >
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={view === tab.id}
            onClick={() => setView(tab.id)}
            className={cn(
              'rounded-md px-3 py-1.5 font-medium transition-colors',
              view === tab.id ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={view}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {view === 'predicted' ? (
            <PredictedBracket bracket={data.predicted} />
          ) : (
            <LiveBracket bracket={data.live} fromSource={data.liveFromSource} />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
