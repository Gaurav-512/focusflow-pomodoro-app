
"use client";

import { useTimer } from '@/providers/TimerProvider';

export function TimerDisplay() {
  const { formattedTimeLeft } = useTimer();

  return (
    <div 
      className="text-7xl sm:text-8xl font-mono font-bold text-foreground select-none tabular-nums"
      aria-live="polite"
      aria-atomic="true"
    >
      {formattedTimeLeft}
    </div>
  );
}
