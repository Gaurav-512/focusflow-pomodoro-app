
"use client";

import { useState, useEffect, useCallback } from 'react';
import useLocalStorage from './useLocalStorage';
import { useNotifications } from './useNotifications';
import { playAlarmSound, stopAlarmSound } from '@/lib/soundUtils';
import { LOCAL_STORAGE_KEYS, StoredAlarm } from '@/lib/constants';
import { useSettings } from '@/providers/SettingsProvider';

const initialAlarmState: StoredAlarm | null = null;

export const useAlarm = () => {
  const [storedAlarm, setStoredAlarm] = useLocalStorage<StoredAlarm | null>(
    LOCAL_STORAGE_KEYS.ALARM,
    initialAlarmState
  );
  const [isRinging, setIsRinging] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const { sendNotification, requestNotificationPermission, permissionStatus } = useNotifications();
  const { settings } = useSettings(); // To check if sound is muted

  useEffect(() => {
    const timerId = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timerId);
  }, []);
  
  useEffect(() => {
    if (permissionStatus === 'default') {
        requestNotificationPermission();
    }
  }, [permissionStatus, requestNotificationPermission]);

  const setAlarm = useCallback((hour: number, minute: number) => {
    const newAlarm: StoredAlarm = { hour, minute, isEnabled: true };
    setStoredAlarm(newAlarm);
    setIsRinging(false); // Ensure ringing stops if a new alarm is set
    stopAlarmSound();
  }, [setStoredAlarm]);

  const clearAlarm = useCallback(() => {
    setStoredAlarm(null);
    setIsRinging(false);
    stopAlarmSound();
  }, [setStoredAlarm]);

  const dismissAlarm = useCallback(() => {
    setIsRinging(false);
    stopAlarmSound();
    // Optionally, disable the alarm after dismissal or require re-set
    if (storedAlarm) {
      setStoredAlarm({ ...storedAlarm, isEnabled: false });
    }
  }, [storedAlarm, setStoredAlarm]);

  useEffect(() => {
    if (storedAlarm && storedAlarm.isEnabled && !isRinging) {
      const now = currentTime;
      const alarmHour = storedAlarm.hour;
      const alarmMinute = storedAlarm.minute;

      if (now.getHours() === alarmHour && now.getMinutes() === alarmMinute && now.getSeconds() === 0) {
        setIsRinging(true);
        sendNotification("⏰ Alarm Time! Wake up!", {
          body: "Your scheduled alarm is ringing.",
          tag: `focusflow-alarm-${alarmHour}-${alarmMinute}`
        });
        playAlarmSound(settings.isMuted);
      }
    }
  }, [currentTime, storedAlarm, isRinging, sendNotification, settings.isMuted]);
  
  // Cleanup sound on unmount
  useEffect(() => {
    return () => {
      stopAlarmSound();
    };
  }, []);

  const formattedAlarmTime = storedAlarm
    ? `${storedAlarm.hour.toString().padStart(2, '0')}:${storedAlarm.minute.toString().padStart(2, '0')}`
    : null;

  return {
    alarm: storedAlarm,
    isAlarmSet: !!storedAlarm && storedAlarm.isEnabled,
    isRinging,
    setAlarm,
    clearAlarm,
    dismissAlarm,
    formattedAlarmTime,
  };
};
