
export enum SessionType {
  FOCUS = 'Focus',
  SHORT_BREAK = 'Short Break',
  LONG_BREAK = 'Long Break',
}

export const DEFAULT_DURATIONS = {
  [SessionType.FOCUS]: 25 * 60, // 25 minutes in seconds
  [SessionType.SHORT_BREAK]: 5 * 60, // 5 minutes in seconds
  [SessionType.LONG_BREAK]: 15 * 60, // 15 minutes in seconds
};

export const SESSIONS_BEFORE_LONG_BREAK = 4;

export const LOCAL_STORAGE_KEYS = {
  SETTINGS: 'focusflow_settings',
  STATS: 'focusflow_stats',
  TIMETABLE: 'focusflow_timetable', // New key for timetable
};

export type Settings = {
  focusDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  isMuted: boolean;
  theme: 'light' | 'dark' | 'system';
  autoStartBreaks: boolean;
  autoStartFocus: boolean;
  longBreakInterval: number;
};

export type DailyStats = {
  completedSessions: number;
};

export type Stats = {
  daily: { [date: string]: DailyStats };
  streak: number;
  lastCompletedDate: string | null;
};

// New Timetable Entry Type
export interface TimetableEntry {
  id: string;
  subject: string;
  day: string; // e.g., "Monday", "Tuesday"
  startTime: string; // e.g., "09:00"
  endTime: string; // e.g., "10:30"
  notes?: string;
}

export const DAYS_OF_WEEK = [
  "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
];
