
"use client";

import { useState, useEffect, useCallback } from 'react';

type SetValue<T> = (value: T | ((prevValue: T) => T)) => void;

const LOCAL_STORAGE_CHANGE_EVENT_PREFIX = 'localStorageChange_';

function useLocalStorage<T>(key: string, initialValue: T): [T, SetValue<T>] {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [isInitialized, setIsInitialized] = useState(false);

  // Effect to read from localStorage on initial mount or when key/initialValue changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const item = window.localStorage.getItem(key);
        if (item !== null) { // Check for null explicitly
          setStoredValue(JSON.parse(item));
        } else {
          // If initialValue is a function, call it to get the value
          const valueToStore = initialValue instanceof Function ? initialValue() : initialValue;
          setStoredValue(valueToStore); 
          window.localStorage.setItem(key, JSON.stringify(valueToStore)); // Persist initialValue if not found
        }
      } catch (error) {
        console.error(`Error reading localStorage key "${key}":`, error);
        const valueToStore = initialValue instanceof Function ? initialValue() : initialValue;
        setStoredValue(valueToStore); // Fallback to initialValue on error
      }
      setIsInitialized(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]); // Only re-run if key changes. initialValue is for the very first load.

  // Effect to listen for custom event to sync across hook instances on the same page
  useEffect(() => {
    if (typeof window === 'undefined' || !isInitialized) return;

    const eventName = `${LOCAL_STORAGE_CHANGE_EVENT_PREFIX}${key}`;
    
    const handleCustomStorageChange = (event: Event) => {
      if (event instanceof CustomEvent && 'detail' in event) {
        const newValueFromEvent = event.detail as T;
        // Crucial: Only update if the stringified value is different to avoid unnecessary re-renders from object reference changes.
        setStoredValue(currentVal => {
          if (JSON.stringify(currentVal) !== JSON.stringify(newValueFromEvent)) {
            return newValueFromEvent;
          }
          return currentVal; // No change
        });
      }
    };
    
    // Also handle standard 'storage' event for changes from other tabs/windows
    const handleStandardStorageEvent = (event: StorageEvent) => {
        if (event.key === key) {
            try {
                const valueToStore = initialValue instanceof Function ? initialValue() : initialValue;
                if (event.newValue === null) {
                    setStoredValue(valueToStore);
                } else {
                    setStoredValue(JSON.parse(event.newValue));
                }
            } catch (error) {
                console.error(`Error parsing storage event for key "${key}":`, error);
                const valueToStore = initialValue instanceof Function ? initialValue() : initialValue;
                setStoredValue(valueToStore);
            }
        }
    };

    window.addEventListener(eventName, handleCustomStorageChange);
    window.addEventListener('storage', handleStandardStorageEvent);

    return () => {
      window.removeEventListener(eventName, handleCustomStorageChange);
      window.removeEventListener('storage', handleStandardStorageEvent);
    };
  }, [key, initialValue, isInitialized]); // initialValue included here as it might affect the initial value if key changes.

  const setValue: SetValue<T> = useCallback(
    (valueOrUpdater) => {
      if (typeof window === 'undefined') return;

      let valueToStore: T;
      setStoredValue(currentStoredValue => { // Functional update for the current hook instance
        valueToStore = valueOrUpdater instanceof Function ? valueOrUpdater(currentStoredValue) : valueOrUpdater;
        
        if (isInitialized) { 
          try {
            const oldValueString = window.localStorage.getItem(key);
            const newValueString = JSON.stringify(valueToStore);

            // Only update localStorage and dispatch event if the stringified value actually changes.
            if (oldValueString !== newValueString) {
                window.localStorage.setItem(key, newValueString);
                // Dispatch event with the actual valueToStore (object), not the string
                window.dispatchEvent(new CustomEvent(`${LOCAL_STORAGE_CHANGE_EVENT_PREFIX}${key}`, { detail: valueToStore }));
            }
          } catch (error) {
            console.error(`Error setting localStorage key "${key}":`, error);
          }
        }
        return valueToStore;
      });
    },
    [key, isInitialized] 
  );
  
  return [isInitialized ? storedValue : (initialValue instanceof Function ? initialValue() : initialValue), setValue];
}

export default useLocalStorage;
