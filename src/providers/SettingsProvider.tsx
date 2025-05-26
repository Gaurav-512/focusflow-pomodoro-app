
"use client";

import React, { createContext, useContext, ReactNode, useEffect } from 'react';
import useLocalStorage from '@/hooks/useLocalStorage';
import { DEFAULT_DURATIONS, LOCAL_STORAGE_KEYS, SessionType, Settings } from '@/lib/constants';
import { useTheme } from 'next-themes';

const initialSettings: Settings = {
  focusDuration: DEFAULT_DURATIONS[SessionType.FOCUS],
  shortBreakDuration: DEFAULT_DURATIONS[SessionType.SHORT_BREAK],
  longBreakDuration: DEFAULT_DURATIONS[SessionType.LONG_BREAK],
  isMuted: false,
  theme: 'system',
  autoStartBreaks: true,
  autoStartFocus: false,
  longBreakInterval: 4,
};

interface SettingsContextType {
  settings: Settings;
  updateSettings: (newSettings: Partial<Settings>) => void;
  resetSettings: () => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useLocalStorage<Settings>(
    LOCAL_STORAGE_KEYS.SETTINGS,
    initialSettings
  );
  const { setTheme } = useTheme();

  useEffect(() => {
    if (settings.theme) {
      setTheme(settings.theme);
    }
  }, [settings.theme, setTheme]);

  const updateSettings = (newSettings: Partial<Settings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };
  
  const resetSettings = () => {
    setSettings(initialSettings);
     if (initialSettings.theme) { // also reset next-themes
      setTheme(initialSettings.theme);
    }
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, resetSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
