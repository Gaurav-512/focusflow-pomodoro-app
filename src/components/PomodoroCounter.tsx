
"use client";

import { Target } from 'lucide-react';
import { useStats } from '@/providers/StatsProvider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function PomodoroCounter() {
  const { getTodayStats } = useStats();
  const todayStats = getTodayStats();

  return (
    <Card className="shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Today's Pomodoros</CardTitle>
        <Target className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{todayStats.completedSessions}</div>
        <p className="text-xs text-muted-foreground">
          Focus sessions completed today.
        </p>
      </CardContent>
    </Card>
  );
}
