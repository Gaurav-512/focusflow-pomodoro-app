
"use client";

import React, { createContext, useContext, ReactNode, useCallback, useEffect } from 'react';
import useLocalStorage from '@/hooks/useLocalStorage';
import { LOCAL_STORAGE_KEYS, Stats, DailyStats } from '@/lib/constants';
import { format, differenceInCalendarDays, subDays, isToday } from 'date-fns';

const initialStats: Stats = {
  daily: {},
  streak: 0,
  lastCompletedDate: null,
};

interface StatsContextType {
  stats: Stats;
  addCompletedSession: () => void;
  getTodayStats: () => DailyStats;
}

const StatsContext = createContext<StatsContextType | undefined>(undefined);

export const StatsProvider = ({ children }: { children: ReactNode }) => {
  const [stats, setStats] = useLocalStorage<Stats>(
    LOCAL_STORAGE_KEYS.STATS,
    initialStats
  );

  const getTodayISO = () => format(new Date(), 'yyyy-MM-dd');

  const addCompletedSession = useCallback(() => {
    setStats((prevStats) => {
      const todayISO = getTodayISO();
      const newDailyStats = { ...prevStats.daily };
      
      if (!newDailyStats[todayISO]) {
        newDailyStats[todayISO] = { completedSessions: 0 };
      }
      newDailyStats[todayISO].completedSessions += 1;

      let newStreak = prevStats.streak;
      if (prevStats.lastCompletedDate) {
        const lastDate = new Date(prevStats.lastCompletedDate);
        const today = new Date();
        const yesterday = subDays(today, 1);

        if (format(lastDate, 'yyyy-MM-dd') === format(yesterday, 'yyyy-MM-dd')) {
          newStreak += 1;
        } else if (format(lastDate, 'yyyy-MM-dd') !== todayISO) {
          // Reset streak if not today and not yesterday
          newStreak = 1; 
        }
        // If it's the same day, streak doesn't change until tomorrow
      } else {
        // First session ever
        newStreak = 1;
      }
      
      // If this is the first completion of the day, update streak
      if (!prevStats.lastCompletedDate || !isToday(new Date(prevStats.lastCompletedDate))) {
         // Check if yesterday was the last completed date
        if (prevStats.lastCompletedDate && differenceInCalendarDays(new Date(), new Date(prevStats.lastCompletedDate)) === 1) {
           // Streak continues
        } else if (prevStats.lastCompletedDate && differenceInCalendarDays(new Date(), new Date(prevStats.lastCompletedDate)) > 1) {
          newStreak = 1; // Streak broken
        } else if (!prevStats.lastCompletedDate) {
          newStreak = 1; // First time use
        }
        // If it's the same day and lastCompletedDate is already today, streak should not increment again.
        // It only increments if the new completion is on a subsequent day.
      }


      return {
        daily: newDailyStats,
        streak: newStreak,
        lastCompletedDate: todayISO,
      };
    });
  }, [setStats]);

  const getTodayStats = useCallback((): DailyStats => {
    const todayISO = getTodayISO();
    return stats.daily[todayISO] || { completedSessions: 0 };
  }, [stats.daily]);
  
  // Effect to potentially reset streak if a day is missed
  useEffect(() => {
    const today = new Date();
    if (stats.lastCompletedDate) {
      const lastDate = new Date(stats.lastCompletedDate);
      if (differenceInCalendarDays(today, lastDate) > 1) {
        setStats(prev => ({ ...prev, streak: 0 })); // Reset streak if more than 1 day passed
      }
    }
  }, [stats.lastCompletedDate, setStats]);


  return (
    <StatsContext.Provider value={{ stats, addCompletedSession, getTodayStats }}>
      {children}
    </StatsContext.Provider>
  );
};

export const useStats = (): StatsContextType => {
  const context = useContext(StatsContext);
  if (!context) {
    throw new Error('useStats must be used within a StatsProvider');
  }
  return context;
};

