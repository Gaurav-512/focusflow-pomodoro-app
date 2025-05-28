
"use client";

import { useState, useEffect } from 'react';

interface DigitalClockProps {
  size?: number; // Diameter of the clock in pixels
}

export function DigitalClock({ size = 200 }: DigitalClockProps) {
  const [formattedISTTime, setFormattedISTTime] = useState<string>('');

  useEffect(() => {
    const updateISTTime = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true, // Use 12-hour format
      };
      // Use 'en-US' locale for conventional AM/PM display
      setFormattedISTTime(now.toLocaleTimeString('en-US', options));
    };

    updateISTTime(); // Initial set
    const timerId = setInterval(updateISTTime, 1000);

    return () => clearInterval(timerId);
  }, []);

  return (
    <div
      className="flex items-center justify-center rounded-full bg-card border-2 border-border shadow-xl"
      style={{ width: `${size}px`, height: `${size}px` }}
      aria-label="Current time in IST"
    >
      <span className="font-mono text-3xl sm:text-4xl font-bold text-foreground tabular-nums">
        {formattedISTTime}
      </span>
    </div>
  );
}

