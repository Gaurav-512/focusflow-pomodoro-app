
"use client";

import { Play, Pause, RotateCcw, SkipForward } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTimer } from '@/providers/TimerProvider';

export function TimerControls() {
  const { isRunning, startTimer, pauseTimer, resetTimer, skipSession } = useTimer();

  return (
    <div className="flex items-center space-x-3 sm:space-x-4">
      {!isRunning ? (
        <Button onClick={startTimer} size="lg" className="px-8 py-6 text-lg rounded-full shadow-md hover:shadow-lg transition-shadow bg-primary hover:bg-primary/90" aria-label="Start timer">
          <Play className="h-6 w-6 mr-2" />
          Start
        </Button>
      ) : (
        <Button onClick={pauseTimer} size="lg" variant="secondary" className="px-8 py-6 text-lg rounded-full shadow-md hover:shadow-lg transition-shadow" aria-label="Pause timer">
          <Pause className="h-6 w-6 mr-2" />
          Pause
        </Button>
      )}
      <Button onClick={resetTimer} variant="outline" size="lg" className="px-6 py-6 text-lg rounded-full shadow-md hover:shadow-lg transition-shadow" aria-label="Reset timer">
        <RotateCcw className="h-5 w-5" />
      </Button>
      <Button onClick={skipSession} variant="ghost" size="lg" className="px-6 py-6 text-lg rounded-full" aria-label="Skip session">
        <SkipForward className="h-5 w-5" />
      </Button>
    </div>
  );
}
