import type { Metadata, Viewport } from 'next/types';
import { Inter } from 'next/font/google';
import Link from 'next/link';

import { Providers } from '@/app/providers';
import { SiteHeader } from '@/components/layout/SiteHeader';
import '@/styles/globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'World Cup 2026 Predictor',
    template: '%s · World Cup 2026 Predictor',
  },
  description:
    'Explainable FIFA World Cup 2026 match predictions powered by an ensemble of statistical and machine-learning models.',
  applicationName: 'World Cup 2026 Predictor',
  keywords: ['World Cup 2026', 'football predictions', 'Elo', 'Poisson', 'expected goals', 'Monte Carlo'],
};

export const viewport: Viewport = {
  themeColor: '#0b0f10',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} dark`}>
      <body className="flex min-h-dvh flex-col font-sans">
        <Providers>
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <footer className="border-t border-border">
            <div className="container flex flex-col gap-2 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
              <span>
                Built for the FIFA World Cup 2026. Predictions are probabilistic estimates, not
                guarantees.
              </span>
              <Link href="/admin" className="transition-colors hover:text-foreground">
                Admin
              </Link>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
