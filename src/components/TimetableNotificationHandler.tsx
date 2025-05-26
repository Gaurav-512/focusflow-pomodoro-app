
"use client";

import { useTimetableScheduler } from '@/hooks/useTimetableScheduler';

// This component's sole purpose is to activate the timetable scheduler hook.
export function TimetableNotificationHandler() {
  useTimetableScheduler();
  return null; // This component does not render anything itself
}
