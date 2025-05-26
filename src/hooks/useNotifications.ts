
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useSettings } from '@/providers/SettingsProvider';

interface UseNotificationsReturn {
  requestNotificationPermission: () => void;
  sendNotification: (title: string, options?: NotificationOptions) => void;
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
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setPermissionStatus(permission);
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      if (Notification.permission !== 'denied') { // If it's not denied, it might be default or something else
          setPermissionStatus(Notification.permission);
      }
    }
  }, []);

  const sendNotification = useCallback((title: string, options?: NotificationOptions) => {
    if (settings.isMuted || permissionStatus !== 'granted' || !('Notification' in window)) {
      return;
    }
    
    // Ensure document is focused to prevent notification spam when user is active
    // Or allow if explicitly set to show when tab is active
    // For this app, we'll always show if permission is granted and not muted.
    
    new Notification(title, {
      body: options?.body || '',
      icon: options?.icon || '/icon-192x192.png', // Placeholder icon
      ...options,
    });
  }, [settings.isMuted, permissionStatus]);

  return { requestNotificationPermission, sendNotification, permissionStatus };
};
