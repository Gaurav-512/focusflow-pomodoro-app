
"use client";

import { Flame } from 'lucide-react';
import { useStats } from '@/providers/StatsProvider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function StreakCounter() {
  const { stats } = useStats();

  return (
    <Card className="shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Daily Streak</CardTitle>
        <Flame className="h-5 w-5 text-destructive" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{stats.streak} {stats.streak === 1 ? "day" : "days"}</div>
        <p className="text-xs text-muted-foreground">
          Keep the flame alive!
        </p>
      </CardContent>
    </Card>
  );
}
