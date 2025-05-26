
"use client";

import { useState, useEffect, useCallback } from 'react';

type SetValue<T> = (value: T | ((prevValue: T) => T)) => void;

function useLocalStorage<T>(key: string, initialValue: T): [T, SetValue<T>] {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const item = window.localStorage.getItem(key);
        if (item) {
          setStoredValue(JSON.parse(item));
        }
      } catch (error) {
        console.error(`Error reading localStorage key "${key}":`, error);
      }
      setIsInitialized(true);
    }
  }, [key]);

  const setValue: SetValue<T> = useCallback(
    (value) => {
      if (typeof window !== 'undefined' && isInitialized) {
        try {
          const valueToStore = value instanceof Function ? value(storedValue) : value;
          setStoredValue(valueToStore);
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
        } catch (error) {
          console.error(`Error setting localStorage key "${key}":`, error);
        }
      } else if (typeof window === 'undefined') {
         // For SSR, just update state, don't try to use localStorage
        setStoredValue(value instanceof Function ? value(initialValue) : value);
      }
    },
    [key, storedValue, isInitialized, initialValue]
  );
  
  // Return initialValue on server or before hydration, storedValue on client after hydration
  const currentValue = typeof window === 'undefined' || !isInitialized ? initialValue : storedValue;

  return [currentValue, setValue];
}

export default useLocalStorage;
