import { Trophy } from 'lucide-react';
import Link from 'next/link';

/** Global site header with primary navigation. */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="container flex h-14 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <Trophy className="h-5 w-5 text-accent" aria-hidden />
          WC2026 Predictor
        </Link>
        <nav aria-label="Primary" className="flex items-center gap-6 text-sm">
          <Link href="/matches" className="text-muted-foreground transition-colors hover:text-foreground">
            Matches
          </Link>
        </nav>
      </div>
    </header>
  );
}
