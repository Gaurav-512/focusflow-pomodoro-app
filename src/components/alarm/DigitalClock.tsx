
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
        hour12: true, 
      };
      setFormattedISTTime(now.toLocaleTimeString('en-US', options));
    };

    updateISTTime(); 
    const timerId = setInterval(updateISTTime, 1000);

    return () => clearInterval(timerId);
  }, []);

  // Adjust font size based on the clock size for better scaling
  const fontSizeClass = () => {
    if (size <= 120) return 'text-xl sm:text-2xl'; // For very small clocks
    if (size <= 160) return 'text-2xl sm:text-3xl'; // For small clocks
    return 'text-3xl sm:text-4xl'; // For default/larger clocks
  };

  return (
    <div
      className="flex items-center justify-center rounded-full bg-card border-2 border-border shadow-xl"
      style={{ width: `${size}px`, height: `${size}px` }}
      aria-label="Current time in IST"
    >
      <span className={`font-mono font-bold text-foreground tabular-nums ${fontSizeClass()}`}>
        {formattedISTTime}
      </span>
    </div>
  );
}
