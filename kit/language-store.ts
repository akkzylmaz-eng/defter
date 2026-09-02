import { DEFAULT_LANGUAGE, type Language } from "./i18n";

/**
 * The chosen language is external state: it lives in localStorage, the server
 * cannot see it, and another tab can change it. That is the exact shape
 * `useSyncExternalStore` exists for, so it is published here rather than kept
 * in a `useState` that has to be corrected by an effect after hydration.
 */
const KEY = "defter.language";

const listeners = new Set<() => void>();
let current: Language = DEFAULT_LANGUAGE;
let hydrated = false;

function stored(): Language {
  try {
    const value = window.localStorage.getItem(KEY);
    return value === "tr" || value === "en" ? value : DEFAULT_LANGUAGE;
  } catch {
    return DEFAULT_LANGUAGE;
  }
}

function onStorage(event: StorageEvent) {
  if (event.key !== KEY) return;
  if (event.newValue === "tr" || event.newValue === "en") publish(event.newValue);
}

export function subscribe(listener: () => void): () => void {
  if (!hydrated) {
    hydrated = true;
    const value = stored();
    if (value !== current) {
      current = value;
      document.documentElement.lang = value;
    }
  }
  listeners.add(listener);
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) window.removeEventListener("storage", onStorage);
  };
}

export const snapshot = (): Language => current;
export const serverSnapshot = (): Language => DEFAULT_LANGUAGE;

export function choose(next: Language): void {
  try {
    window.localStorage.setItem(KEY, next);
  } catch {
    // Best effort; the in-memory switch still takes.
  }
  publish(next);
}

function publish(next: Language): void {
  if (next === current) return;
  current = next;
  document.documentElement.lang = next;
  for (const listener of listeners) listener();
}
