
"use client";

import { Flame } from 'lucide-react';
import { useStats } from '@/providers/StatsProvider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect, useState, useRef } from 'react';

export function StreakCounter() {
  const { stats } = useStats();
  const [animate, setAnimate] = useState(false);
  const prevStreakRef = useRef<number>(stats.streak);

  useEffect(() => {
    if (stats.streak > prevStreakRef.current && stats.streak > 0) {
      setAnimate(true);
      const timer = setTimeout(() => setAnimate(false), 600); // Animation duration in ms
      return () => clearTimeout(timer);
    }
    // Always update the ref to the current streak for the next comparison
    prevStreakRef.current = stats.streak;
  }, [stats.streak]);

  return (
    <Card className="shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Daily Streak</CardTitle>
        <Flame className="h-5 w-5 text-destructive" />
      </CardHeader>
      <CardContent>
        <div 
          className={`text-2xl font-bold ${animate ? 'animate-celebrate-streak' : ''}`}
        >
          {stats.streak} {stats.streak === 1 ? "day" : "days"}
        </div>
        <p className="text-xs text-muted-foreground">
          Keep the flame alive!
        </p>
      </CardContent>
    </Card>
  );
}

