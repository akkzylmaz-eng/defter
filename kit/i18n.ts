export const LANGUAGES = ["tr", "en"] as const;
export type Language = (typeof LANGUAGES)[number];

export const DEFAULT_LANGUAGE: Language = "tr";
export const LANGUAGE_LABEL: Record<Language, string> = { tr: "TR", en: "EN" };

/** A string in both languages. Nothing user-facing exists in only one. */
export interface Text {
  tr: string;
  en: string;
}

export function read(value: Text, language: Language): string {
  return value[language] || value[language === "tr" ? "en" : "tr"];
}
