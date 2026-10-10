import { useEffect, useRef, useState } from "react";

const PREFIX = "bpo-nexus:";

/**
 * SSR-safe persisted state. Synchronously hydrates from localStorage on the initial
 * client render so that route changes and tab switching NEVER re-inject seed data.
 */
export function usePersistentState<T>(key: string, initial: T) {
  const fullKey = PREFIX + key;

  // Lazy initializer reads localStorage synchronously on first render
  const [value, setValue] = useState<T>(() => {
    if (typeof window === "undefined") return initial;
    try {
      const raw = window.localStorage.getItem(fullKey);
      if (raw !== null) {
        return JSON.parse(raw) as T;
      }
    } catch {
      /* ignore corrupt storage */
    }
    return initial;
  });

  const isFirstRender = useRef(true);

  // Sync to localStorage whenever value or key changes
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
    }
    try {
      window.localStorage.setItem(fullKey, JSON.stringify(value));
    } catch {
      /* quota or serialization failure — keep in-memory state */
    }
  }, [fullKey, value]);

  return [value, setValue] as const;
}

export function uid(prefix: string) {
  return `${prefix}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

export function today() {
  return new Date().toISOString().slice(0, 10);
}

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`;
}