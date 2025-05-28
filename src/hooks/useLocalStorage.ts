
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
    (valueOrUpdater) => {
      setStoredValue(prevState => {
        const newValue = valueOrUpdater instanceof Function ? valueOrUpdater(prevState) : valueOrUpdater;
        
        // Perform side-effect (localStorage update) only on client and after initialization
        if (typeof window !== 'undefined' && isInitialized) {
          try {
            window.localStorage.setItem(key, JSON.stringify(newValue));
          } catch (error) {
            console.error(`Error setting localStorage key "${key}":`, error);
          }
        }
        return newValue; // Return the new state for setStoredValue
      });
    },
    [key, isInitialized] // Dependencies for useCallback. 
                         // setStoredValue from useState is stable and doesn't need to be listed.
                         // isInitialized changes once, making setValue change identity once, which is acceptable.
                         // key is stable.
  );
  
  // Return initialValue on server or before hydration, storedValue on client after hydration
  const currentValue = typeof window === 'undefined' || !isInitialized ? initialValue : storedValue;

  return [currentValue, setValue];
}

export default useLocalStorage;
