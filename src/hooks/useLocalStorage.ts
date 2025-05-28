
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
          setStoredValue(initialValue); // Set to initialValue if nothing is in localStorage
        }
      } catch (error) {
        console.error(`Error reading localStorage key "${key}":`, error);
        setStoredValue(initialValue); // Fallback to initialValue on error
      }
      setIsInitialized(true);
    }
  }, [key, initialValue]); // initialValue added as dependency

  // Effect to listen for custom event to sync across hook instances on the same page
  useEffect(() => {
    if (typeof window === 'undefined' || !isInitialized) return;

    const eventName = `${LOCAL_STORAGE_CHANGE_EVENT_PREFIX}${key}`;
    
    const handleCustomStorageChange = (event: Event) => {
      if (event instanceof CustomEvent && 'detail' in event) {
        setStoredValue(event.detail as T);
      }
    };
    
    // Also handle standard 'storage' event for changes from other tabs/windows
    const handleStandardStorageEvent = (event: StorageEvent) => {
        if (event.key === key) {
            try {
                if (event.newValue === null) {
                    setStoredValue(initialValue);
                } else {
                    setStoredValue(JSON.parse(event.newValue));
                }
            } catch (error) {
                console.error(`Error parsing storage event for key "${key}":`, error);
                setStoredValue(initialValue);
            }
        }
    };

    window.addEventListener(eventName, handleCustomStorageChange);
    window.addEventListener('storage', handleStandardStorageEvent);

    return () => {
      window.removeEventListener(eventName, handleCustomStorageChange);
      window.removeEventListener('storage', handleStandardStorageEvent);
    };
  }, [key, initialValue, isInitialized]);

  const setValue: SetValue<T> = useCallback(
    (valueOrUpdater) => {
      if (typeof window === 'undefined') return;

      // To get the latest state if valueOrUpdater is a function, we use setStoredValue's callback form
      // This also helps if storedValue in useCallback's closure is stale.
      let valueToStore: T;
      setStoredValue(currentStoredValue => {
        valueToStore = valueOrUpdater instanceof Function ? valueOrUpdater(currentStoredValue) : valueOrUpdater;
        
        // Only write to localStorage and dispatch event if initialized
        // This check might be redundant if setValue is only called after initialization elsewhere,
        // but it's safer here.
        if (isInitialized) { 
          try {
            window.localStorage.setItem(key, JSON.stringify(valueToStore));
            window.dispatchEvent(new CustomEvent(`${LOCAL_STORAGE_CHANGE_EVENT_PREFIX}${key}`, { detail: valueToStore }));
          } catch (error) {
            console.error(`Error setting localStorage key "${key}":`, error);
          }
        }
        return valueToStore;
      });
    },
    [key, isInitialized] // Removed storedValue from deps, relying on setStoredValue's functional update
  );
  
  return [isInitialized ? storedValue : initialValue, setValue];
}

export default useLocalStorage;
