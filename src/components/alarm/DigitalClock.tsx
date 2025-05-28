
"use client";

import { useState, useEffect } from 'react';

interface DigitalClockProps {
  size?: number; // Diameter of the clock in pixels
}

export function DigitalClock({ size = 200 }: DigitalClockProps) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timerId = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timerId);
  }, []);

  const formatTime = (date: Date) => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  };

  return (
    <div
      className="flex items-center justify-center rounded-full bg-slate-800/30 border-2 border-slate-700 shadow-2xl"
      style={{ width: `${size}px`, height: `${size}px` }}
      aria-label="Current time"
    >
      <span className="font-mono text-4xl font-bold text-slate-100 tabular-nums">
        {formatTime(currentTime)}
      </span>
    </div>
  );
}
