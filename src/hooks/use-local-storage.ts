
import { useState, useEffect } from "react";

/**
 * @hook useLocalStorage
 * @description A custom React hook that syncs a state value with the browser's localStorage.
 * It provides a stateful value and a function to update it, similar to `useState`,
 * but with the added persistence to localStorage.
 * @template T - The type of the value to be stored.
 * @param {string} key - The key under which the value is stored in localStorage.
 * @param {T} initialValue - The initial value to use if no value is found in localStorage.
 * @returns {[T, (value: T | ((val: T) => T)) => void]} A tuple containing the stored value and a function to update it.
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  // State to store our value
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      // Get from local storage by key
      const item = window.localStorage.getItem(key);
      // Parse stored json or return initialValue
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      // If error, return initialValue
      console.error("Error reading localStorage key:", key, error);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that
  // persists the new value to localStorage
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      // Save state
      setStoredValue(valueToStore);
      // Save to local storage
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      // A more advanced implementation would handle the error case
      console.error("Error setting localStorage key:", key, error);
    }
  };

  return [storedValue, setValue] as const;
}
