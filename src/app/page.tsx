
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

export default function HomePage() {
  const { currentSession } = useTimer();
  const { permissionStatus, requestNotificationPermission } = useNotifications();

  useEffect(() => {
    document.title = `FocusFlow | ${currentSession}`;
  }, [currentSession]);


  const getCardColor = () => {
    switch (currentSession) {
      case 'Focus':
        return 'bg-primary/10 border-primary/30';
      case 'Short Break':
        return 'bg-green-500/10 border-green-500/30';
      case 'Long Break':
        return 'bg-blue-500/10 border-blue-500/30';
      default:
        return 'bg-card';
    }
  };
  
  return (
    <div className="flex flex-col items-center justify-center py-8 space-y-8">
      {permissionStatus === 'default' && (
        <Card className="w-full max-w-md bg-yellow-100 dark:bg-yellow-900 border-yellow-400">
          <CardHeader>
            <CardTitle className="text-yellow-700 dark:text-yellow-300">Enable Notifications</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-yellow-600 dark:text-yellow-200 mb-4">
              To get alerts when your sessions end, please enable browser notifications.
            </p>
            <Button onClick={requestNotificationPermission} variant="default" className="bg-yellow-500 hover:bg-yellow-600 text-white">
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
