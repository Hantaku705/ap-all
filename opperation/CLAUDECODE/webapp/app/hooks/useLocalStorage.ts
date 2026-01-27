'use client';

import { useState, useEffect } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  useEffect(() => {
    try {
      const item = localStorage.getItem(key);
      if (item) setStoredValue(JSON.parse(item));
    } catch {}
  }, [key]);

  const setValue = (value: T | ((prev: T) => T)) => {
    const newValue = value instanceof Function ? value(storedValue) : value;
    setStoredValue(newValue);
    try {
      localStorage.setItem(key, JSON.stringify(newValue));
    } catch {}
  };

  return [storedValue, setValue];
}
