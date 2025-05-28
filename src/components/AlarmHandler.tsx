
"use client";

import { useAlarm } from '@/hooks/useAlarm';

// This component's sole purpose is to activate the alarm hook globally.
export function AlarmHandler() {
  useAlarm(); // Initialize and run the alarm logic
  return null; // This component does not render anything itself
}
