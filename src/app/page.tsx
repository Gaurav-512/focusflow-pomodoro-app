
"use client";

import { TimerDisplay } from '@/components/TimerDisplay';
import { TimerControls } from '@/components/TimerControls';
import { PomodoroCounter } from '@/components/PomodoroCounter';
import { StreakCounter } from '@/components/StreakCounter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTimer } from '@/providers/TimerProvider';
import { useNotifications } from '@/hooks/useNotifications';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { SessionType } from '@/lib/constants';

export default function HomePage() {
  const { currentSession } = useTimer();
  const { permissionStatus, requestNotificationPermission } = useNotifications();

  useEffect(() => {
    document.title = `FocusFlow | ${currentSession}`;
  }, [currentSession]);


  const getCardColor = () => {
    switch (currentSession) {
      case SessionType.FOCUS:
        return 'bg-primary/10 border-primary/30';
      case SessionType.SHORT_BREAK:
        return 'bg-accent/10 border-accent/30';
      case SessionType.LONG_BREAK:
        return 'bg-[hsl(var(--long-break))]/10 border-[hsl(var(--long-break))]/30';
      default:
        return 'bg-card';
    }
  };
  
  return (
    <div className="flex flex-col items-center justify-center py-8 space-y-8">
      {permissionStatus === 'default' && (
        <Card className="w-full max-w-md bg-[hsl(var(--warning))]/10 border-[hsl(var(--warning))]/30">
          <CardHeader>
            <CardTitle className="text-[hsl(var(--warning-foreground))]">Enable Notifications</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[hsl(var(--warning-foreground))]/80 mb-4">
              To get alerts when your sessions end, please enable browser notifications.
            </p>
            <Button 
              onClick={requestNotificationPermission} 
              className="bg-[hsl(var(--warning))] hover:bg-[hsl(var(--warning))]/90 text-[hsl(var(--warning-foreground))]"
            >
              Enable Notifications
            </Button>
          </CardContent>
        </Card>
      )}

      <Card className={`w-full max-w-md shadow-xl transition-all duration-500 ${getCardColor()}`}>
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">
            {currentSession}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-6">
          <TimerDisplay />
          <TimerControls />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-md">
        <PomodoroCounter />
        <StreakCounter />
      </div>
    </div>
  );
}
