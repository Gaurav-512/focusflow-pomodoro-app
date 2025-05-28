
"use client";

import { Play, Pause, RotateCcw, SkipForward } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTimer } from '@/providers/TimerProvider';

export function TimerControls() {
  const { isRunning, startTimer, pauseTimer, resetTimer, skipSession } = useTimer();

  return (
    <div className="flex items-center space-x-2 sm:space-x-4">
      {!isRunning ? (
        <Button 
          onClick={startTimer} 
          size="default" 
          className="px-6 py-5 text-md sm:px-8 sm:py-6 sm:text-lg rounded-full shadow-md hover:shadow-lg transition-shadow bg-primary hover:bg-primary/90" 
          aria-label="Start timer"
        >
          <Play className="h-5 w-5 sm:h-6 sm:w-6 mr-2" />
          Start
        </Button>
      ) : (
        <Button 
          onClick={pauseTimer} 
          size="default" 
          variant="secondary" 
          className="px-6 py-5 text-md sm:px-8 sm:py-6 sm:text-lg rounded-full shadow-md hover:shadow-lg transition-shadow" 
          aria-label="Pause timer"
        >
          <Pause className="h-5 w-5 sm:h-6 sm:w-6 mr-2" />
          Pause
        </Button>
      )}
      <Button 
        onClick={resetTimer} 
        variant="outline" 
        size="default" 
        className="p-3 sm:p-4 text-md sm:text-lg rounded-full shadow-md hover:shadow-lg transition-shadow aspect-square h-auto sm:px-6 sm:py-6" 
        aria-label="Reset timer"
      >
        <RotateCcw className="h-5 w-5" />
         <span className="sr-only sm:not-sr-only sm:ml-2">Reset</span>
      </Button>
      <Button 
        onClick={skipSession} 
        variant="ghost" 
        size="default" 
        className="p-3 sm:p-4 text-md sm:text-lg rounded-full aspect-square h-auto sm:px-6 sm:py-6" 
        aria-label="Skip session"
      >
        <SkipForward className="h-5 w-5" />
        <span className="sr-only sm:not-sr-only sm:ml-2">Skip</span>
      </Button>
    </div>
  );
}
