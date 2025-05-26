
"use client";

import { useEffect, useState, useCallback } from 'react';
import { format } from 'date-fns';
import useLocalStorage from '@/hooks/useLocalStorage';
import { useNotifications } from '@/hooks/useNotifications';
import { useSettings } from '@/providers/SettingsProvider';
import { TimetableEntry, LOCAL_STORAGE_KEYS, DAYS_OF_WEEK } from '@/lib/constants';
import { playSoundEffect } from '@/lib/soundUtils';

export const useTimetableScheduler = () => {
  const [timetableEntries] = useLocalStorage<TimetableEntry[]>(LOCAL_STORAGE_KEYS.TIMETABLE, []);
  const { sendNotification, requestNotificationPermission, permissionStatus } = useNotifications();
  const { settings } = useSettings();
  const [notifiedEntriesToday, setNotifiedEntriesToday] = useState<Record<string, Set<string>>>({});

  useEffect(() => {
     // Request permission if not already granted or denied
    if (permissionStatus === 'default') {
      requestNotificationPermission();
    }
  }, [permissionStatus, requestNotificationPermission]);

  const checkTimetable = useCallback(() => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const dayIndex = (now.getDay() + 6) % 7; // 0=Monday, ..., 6=Sunday
    const currentDayName = DAYS_OF_WEEK[dayIndex];
    const todayISO = format(now, 'yyyy-MM-dd');

    // Initialize or clear entries for the new day
    if (!notifiedEntriesToday[todayISO]) {
      setNotifiedEntriesToday(prev => ({ [todayISO]: new Set() }));
    }
    
    const todaysNotifiedIds = notifiedEntriesToday[todayISO] || new Set();

    timetableEntries.forEach(entry => {
      if (entry.day === currentDayName) {
        const [entryHour, entryMinute] = entry.startTime.split(':').map(Number);
        if (entryHour === currentHour && entryMinute === currentMinute) {
          if (!todaysNotifiedIds.has(entry.id)) {
            sendNotification(`Time for ${entry.subject}!`, {
              body: `Your scheduled session for ${entry.subject} from ${entry.startTime} to ${entry.endTime} is starting now.`,
              tag: `timetable-${entry.id}-${todayISO}`, // Unique tag to prevent re-notification if somehow triggered again
            });
            playSoundEffect(settings.isMuted);
            
            setNotifiedEntriesToday(prev => {
              const updatedTodaySet = new Set(prev[todayISO] || []);
              updatedTodaySet.add(entry.id);
              return { ...prev, [todayISO]: updatedTodaySet };
            });
          }
        }
      }
    });
  }, [timetableEntries, sendNotification, settings.isMuted, notifiedEntriesToday]);

  useEffect(() => {
    const intervalId = setInterval(checkTimetable, 60000); // Check every minute
    checkTimetable(); // Initial check on mount

    return () => clearInterval(intervalId);
  }, [checkTimetable]);
};
