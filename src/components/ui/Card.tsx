import type { ReactNode } from 'react';

import { cn } from '@/utils/cn';

/** Surface container used throughout the app. */
export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className={cn('rounded-xl border border-border bg-card p-5', className)}>{children}</div>
  );
}
