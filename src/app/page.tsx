
"use client";

import { TimerDisplay } from '@/components/TimerDisplay';
import { TimerControls } from '@/components/TimerControls';
import { PomodoroCounter } from '@/components/PomodoroCounter';
import { StreakCounter } from '@/components/StreakCounter';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { useTimer } from '@/providers/TimerProvider';
import { useNotifications } from '@/hooks/useNotifications';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { SessionType } from '@/lib/constants';
import { Download } from 'lucide-react';

// Interface for the BeforeInstallPromptEvent
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export default function HomePage() {
  const { currentSession } = useTimer();
  const { permissionStatus, requestNotificationPermission } = useNotifications();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallButton, setShowInstallButton] = useState(false);

  useEffect(() => {
    document.title = `FocusFlow | ${currentSession}`;
  }, [currentSession]);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Update UI to notify the user they can add to home screen
      setShowInstallButton(true);
      console.log('`beforeinstallprompt` event was fired.');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Listen for appinstalled event
    const handleAppInstalled = () => {
      console.log('FocusFlow PWA was installed');
      // Hide the install button if the app is installed
      setShowInstallButton(false);
      setDeferredPrompt(null);
    };
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      return;
    }
    // Show the install prompt
    deferredPrompt.prompt();
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);
    // We've used the prompt, and can't use it again, discard it
    setDeferredPrompt(null);
    setShowInstallButton(false);
  };


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

      {showInstallButton && (
        <Card className="w-full max-w-md shadow-lg bg-secondary/20 border-secondary/40">
          <CardHeader>
            <CardTitle className="flex items-center text-secondary-foreground">
              <Download className="mr-2 h-5 w-5" /> Install FocusFlow
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-secondary-foreground/80 mb-4">
              Get the best experience by installing FocusFlow to your device.
            </p>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={handleInstallClick} 
              className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground"
            >
              Install App
            </Button>
          </CardFooter>
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
