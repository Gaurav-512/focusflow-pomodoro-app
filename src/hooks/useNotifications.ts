
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useSettings } from '@/providers/SettingsProvider';

interface UseNotificationsReturn {
  requestNotificationPermission: () => void;
  sendNotification: (title: string, options?: NotificationOptions) => Promise<void>;
  permissionStatus: NotificationPermission | 'loading' | 'unsupported';
}

export const useNotifications = (): UseNotificationsReturn => {
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission | 'loading' | 'unsupported'>('loading');
  const { settings } = useSettings();

  useEffect(() => {
    if (!('Notification' in window)) {
      setPermissionStatus('unsupported');
      return;
    }
    setPermissionStatus(Notification.permission);
  }, []);

  const requestNotificationPermission = useCallback(async () => {
    if (!('Notification' in window) || Notification.permission === 'granted') {
      if (Notification.permission === 'granted') {
        setPermissionStatus('granted'); // Ensure state is updated if already granted
      }
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setPermissionStatus(permission);
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      if (Notification.permission !== 'denied') {
          setPermissionStatus(Notification.permission);
      }
    }
  }, []);

  const sendNotification = useCallback(async (title: string, options?: NotificationOptions) => {
    if (settings.isMuted || permissionStatus !== 'granted' || !('Notification' in window)) {
      return;
    }
    
    const notificationOptions: NotificationOptions = {
      body: options?.body || '',
      icon: options?.icon || '/icons/icon-192x192.png', // Default PWA icon
      badge: options?.badge || '/icons/icon-72x72.png', // Smaller icon for notification tray
      tag: options?.tag,
      renotify: options?.renotify || false,
      silent: options?.silent || settings.isMuted, // if true, no sound/vibration from notification itself
      ...options,
    };

    if (navigator.serviceWorker) {
      try {
        const registration = await navigator.serviceWorker.ready;
        if (registration && typeof registration.showNotification === 'function') {
          await registration.showNotification(title, notificationOptions);
          return; // Notification sent via Service Worker
        } else {
          console.warn('Service worker registration found, but showNotification is not available or not a function.');
        }
      } catch (swError) {
        console.error('Error using service worker for notification:', swError);
        // Fall through to use `new Notification()` if SW method fails
      }
    } else {
      console.warn('navigator.serviceWorker is not available.');
    }

    // Fallback to direct Notification constructor if SW is not available/ready or SW method failed
    try {
      console.log('Attempting direct `new Notification()` constructor.');
      new Notification(title, notificationOptions);
    } catch (error) {
      console.error('Error sending notification directly (fallback):', error);
      // If this also fails with "Illegal constructor", the browser is strictly enforcing SW notifications.
    }
  }, [settings.isMuted, permissionStatus]);

  return { requestNotificationPermission, sendNotification, permissionStatus };
};
