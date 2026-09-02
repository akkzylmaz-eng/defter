"use client";

import { useSyncExternalStore } from "react";
import { read, type Language, type Text } from "@/kit/i18n";
import { choose, serverSnapshot, snapshot, subscribe } from "@/kit/language-store";

/** The active language, plus `say` bound to it so screens read plainly. */
export function useLanguage(): {
  language: Language;
  setLanguage: (next: Language) => void;
  say: (value: Text) => string;
} {
  const language = useSyncExternalStore(subscribe, snapshot, serverSnapshot);
  return { language, setLanguage: choose, say: (value: Text) => read(value, language) };
}
