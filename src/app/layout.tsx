import type { Metadata, Viewport } from 'next/types';
import { Inter } from 'next/font/google';

import { Providers } from '@/app/providers';
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
      <body className="min-h-dvh font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
