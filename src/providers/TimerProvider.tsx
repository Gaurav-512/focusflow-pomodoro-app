
"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useSettings } from './SettingsProvider';
import { useStats } from './StatsProvider';
import { useNotifications } from '@/hooks/useNotifications';
import { SessionType, SESSIONS_BEFORE_LONG_BREAK } from '@/lib/constants';

interface TimerContextType {
  currentSession: SessionType;
  timeLeft: number;
  isRunning: boolean;
  pomodoroCycle: number; // Number of focus sessions in the current cycle (1 to SESSIONS_BEFORE_LONG_BREAK)
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  skipSession: () => void;
  formattedTimeLeft: string;
}

const TimerContext = createContext<TimerContextType | undefined>(undefined);

export const TimerProvider = ({ children }: { children: ReactNode }) => {
  const { settings } = useSettings();
  const { addCompletedSession } = useStats();
  const { requestNotificationPermission, sendNotification, permissionStatus } = useNotifications();

  const [currentSession, setCurrentSession] = useState<SessionType>(SessionType.FOCUS);
  const [timeLeft, setTimeLeft] = useState<number>(settings.focusDuration);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [pomodoroCycle, setPomodoroCycle] = useState<number>(1); // Tracks focus sessions for long break

  useEffect(() => {
    // Initialize notification permission on mount
    if (permissionStatus === 'default' || permissionStatus === 'loading') {
      requestNotificationPermission();
    }
  }, [requestNotificationPermission, permissionStatus]);

  const getDuration = useCallback((sessionType: SessionType): number => {
    switch (sessionType) {
      case SessionType.FOCUS:
        return settings.focusDuration;
      case SessionType.SHORT_BREAK:
        return settings.shortBreakDuration;
      case SessionType.LONG_BREAK:
        return settings.longBreakDuration;
      default:
        return settings.focusDuration;
    }
  }, [settings]);

  // Update timeLeft when settings or currentSession change IF timer is not running
  useEffect(() => {
    if (!isRunning) {
      setTimeLeft(getDuration(currentSession));
    }
  }, [settings, currentSession, isRunning, getDuration]);


  const advanceSession = useCallback(() => {
    let nextSession: SessionType;
    let newPomodoroCycle = pomodoroCycle;

    if (currentSession === SessionType.FOCUS) {
      addCompletedSession();
      if (pomodoroCycle >= settings.longBreakInterval) {
        nextSession = SessionType.LONG_BREAK;
        newPomodoroCycle = 1; // Reset cycle
      } else {
        nextSession = SessionType.SHORT_BREAK;
        newPomodoroCycle = pomodoroCycle + 1;
      }
      if (settings.autoStartBreaks) setIsRunning(true); else setIsRunning(false);

    } else { // currentSession is Short Break or Long Break
      nextSession = SessionType.FOCUS;
      if (settings.autoStartFocus) setIsRunning(true); else setIsRunning(false);
    }
    
    setCurrentSession(nextSession);
    setPomodoroCycle(newPomodoroCycle);
    setTimeLeft(getDuration(nextSession)); // Set timeLeft for the new session
    sendNotification(`${nextSession} Started!`, { body: `Time for your ${nextSession.toLowerCase()} session.` });

  }, [currentSession, pomodoroCycle, addCompletedSession, getDuration, sendNotification, settings.autoStartBreaks, settings.autoStartFocus, settings.longBreakInterval]);


  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
    } else if (isRunning && timeLeft === 0) {
      advanceSession();
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timeLeft, advanceSession]);

  const startTimer = () => {
    if(permissionStatus === 'default') requestNotificationPermission();
    setIsRunning(true);
  };

  const pauseTimer = () => setIsRunning(false);

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(getDuration(currentSession));
  };

  const skipSession = () => {
    setIsRunning(false); // Stop current timer before skipping
    advanceSession(); // Advance to next session logic
     // If autoStart is on for the next session type, it will be handled by advanceSession
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  const formattedTimeLeft = formatTime(timeLeft);

  return (
    <TimerContext.Provider
      value={{
        currentSession,
        timeLeft,
        isRunning,
        pomodoroCycle,
        startTimer,
        pauseTimer,
        resetTimer,
        skipSession,
        formattedTimeLeft,
      }}
    >
      {children}
    </TimerContext.Provider>
  );
};

export const useTimer = (): TimerContextType => {
  const context = useContext(TimerContext);
  if (!context) {
    throw new Error('useTimer must be used within a TimerProvider');
  }
  return context;
};
