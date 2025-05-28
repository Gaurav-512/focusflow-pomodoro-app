
"use client";

import { useState, useEffect, useCallback } from 'react';
import useLocalStorage from './useLocalStorage';
import { useNotifications } from './useNotifications';
import { playAlarmSound, stopAlarmSound } from '@/lib/soundUtils';
import { LOCAL_STORAGE_KEYS, StoredAlarm } from '@/lib/constants';
import { useSettings } from '@/providers/SettingsProvider';

export const useAlarm = () => {
  const [storedAlarm, setStoredAlarm] = useLocalStorage<StoredAlarm | null>(
    LOCAL_STORAGE_KEYS.ALARM,
    null // Initial value is null
  );
  const [currentTime, setCurrentTime] = useState(new Date());
  const { sendNotification, requestNotificationPermission, permissionStatus } = useNotifications();
  const { settings } = useSettings();

  // Update current time every second
  useEffect(() => {
    const timerId = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timerId);
  }, []);
  
  // Request notification permission if needed
  useEffect(() => {
    if (permissionStatus === 'default') {
        requestNotificationPermission();
    }
  }, [permissionStatus, requestNotificationPermission]);

  // Effect to check time and set storedAlarm.isExplicitlyRinging
  useEffect(() => {
    if (storedAlarm && storedAlarm.isEnabled && !storedAlarm.isExplicitlyRinging) {
      const now = currentTime;
      if (now.getHours() === storedAlarm.hour && now.getMinutes() === storedAlarm.minute && now.getSeconds() === 0) {
        // Update localStorage to mark alarm as ringing
        // eslint-disable-next-line react-hooks/exhaustive-deps
        setStoredAlarm(prev => prev ? { ...prev, isExplicitlyRinging: true } : null);
      }
    }
  }, [currentTime, storedAlarm]); // Removed setStoredAlarm from dependencies

  // Effect to react to storedAlarm.isExplicitlyRinging for sound and notification
  useEffect(() => {
    if (storedAlarm?.isExplicitlyRinging && storedAlarm?.isEnabled) {
      sendNotification("⏰ Alarm Time! Wake up!", {
        body: "Your scheduled alarm is ringing.",
        tag: `focusflow-alarm-${storedAlarm.hour}-${storedAlarm.minute}`
      });
      playAlarmSound(settings.isMuted);
    } else {
      // If alarm is no longer enabled or no longer explicitly ringing, stop sound.
      // This handles cases like clearAlarm or dismissAlarm.
      stopAlarmSound();
    }
    // No explicit cleanup needed for playAlarmSound as it handles its own interval.
    // stopAlarmSound in the 'else' branch handles stopping.
  }, [
    storedAlarm?.isExplicitlyRinging, 
    storedAlarm?.isEnabled, 
    sendNotification, 
    settings.isMuted,
    storedAlarm?.hour, // For unique notification tag
    storedAlarm?.minute // For unique notification tag
  ]);

  const setAlarmCallback = useCallback((hour: number, minute: number) => {
    const newAlarm: StoredAlarm = { hour, minute, isEnabled: true, isExplicitlyRinging: false };
    setStoredAlarm(newAlarm);
    stopAlarmSound(); // Ensure any previous ringing stops
  }, [setStoredAlarm]);

  const clearAlarmCallback = useCallback(() => {
    // This will make storedAlarm null, leading to isEnabled=false and isExplicitlyRinging=false effectively
    setStoredAlarm(null); 
    // The effect reacting to isExplicitlyRinging/isEnabled will call stopAlarmSound()
  }, [setStoredAlarm]);

  const dismissAlarmCallback = useCallback(() => {
    // Mark as no longer enabled and no longer ringing in localStorage
    setStoredAlarm(prev => prev ? { ...prev, isEnabled: false, isExplicitlyRinging: false } : null);
    // The effect reacting to isExplicitlyRinging/isEnabled will call stopAlarmSound()
  }, [setStoredAlarm]);

  const formatTo12Hour = (hour: number, minute: number): string => {
    const h = hour % 12 || 12;
    const m = minute.toString().padStart(2, '0');
    const ampm = hour < 12 || hour === 24 ? 'AM' : 'PM';
    return `${h.toString().padStart(2, '0')}:${m} ${ampm}`;
  };

  const formattedAlarmTime = storedAlarm && storedAlarm.isEnabled && !storedAlarm.isExplicitlyRinging
    ? formatTo12Hour(storedAlarm.hour, storedAlarm.minute)
    : null;

  return {
    alarm: storedAlarm,
    // True if an alarm is set, enabled, AND NOT currently explicitly ringing
    isAlarmSet: !!(storedAlarm && storedAlarm.isEnabled && !storedAlarm.isExplicitlyRinging),
    // True if an alarm is set, enabled, AND is currently explicitly ringing
    isRinging: !!(storedAlarm && storedAlarm.isEnabled && storedAlarm.isExplicitlyRinging),
    setAlarm: setAlarmCallback,
    clearAlarm: clearAlarmCallback,
    dismissAlarm: dismissAlarmCallback,
    formattedAlarmTime,
  };
};
