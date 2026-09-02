import { KURUS_PER_LIRA, type Kurus } from "./money";
import type { Day } from "./dates";
import type { Language } from "./i18n";

/**
 * Display formatting.
 *
 * Every date is rendered in UTC, deliberately. The ledger stores calendar days
 * and the engine compares them as strings; formatting in the viewer's zone
 * would print a due date one day off for anyone west of Greenwich, and would
 * produce different markup on the server than in the browser.
 */

const LOCALE: Record<Language, string> = { tr: "tr-TR", en: "en-GB" };

/** "72.000,00 ₺" in Turkish, "₺72,000.00" in English. */
export function money(amount: Kurus, language: Language): string {
  return new Intl.NumberFormat(LOCALE[language], {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 2,
  }).format(amount / KURUS_PER_LIRA);
}

/** Kuruş dropped, for headline figures where the cents are noise. */
export function moneyRound(amount: Kurus, language: Language): string {
  return new Intl.NumberFormat(LOCALE[language], {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(amount / KURUS_PER_LIRA);
}

/** "72,0 B ₺" / "₺72.0K": for chart axes, where width is the constraint. */
export function moneyShort(amount: Kurus, language: Language): string {
  const value = amount / KURUS_PER_LIRA;
  const abs = Math.abs(value);
  const [scaled, suffix] =
    abs >= 1_000_000
      ? [value / 1_000_000, language === "tr" ? " M" : "M"]
      : abs >= 1_000
        ? [value / 1_000, language === "tr" ? " B" : "K"]
        : [value, ""];
  const digits = Math.abs(scaled) >= 100 || suffix === "" ? 0 : 1;
  return `${new Intl.NumberFormat(LOCALE[language], {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(scaled)}${suffix} ₺`;
}

export function percent(value: number, language: Language): string {
  const rounded = Math.round(value * 10) / 10;
  const text = Number.isInteger(rounded)
    ? String(rounded)
    : rounded.toFixed(1).replace(".", language === "tr" ? "," : ".");
  return `${text}%`;
}

/** A rate stored as 0.27 shown as "%27" / "27%". */
export function rate(value: number, language: Language): string {
  const text = String(Math.round(value * 1000) / 10).replace(
    ".",
    language === "tr" ? "," : ".",
  );
  return language === "tr" ? `%${text}` : `${text}%`;
}

/** "14 Şub 2026" / "14 Feb 2026". */
export function day(value: Day, language: Language): string {
  return new Intl.DateTimeFormat(LOCALE[language], {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`));
}

/** "Mart 2026" / "March 2026", from a "2026-03" key. */
export function month(value: string, language: Language): string {
  return new Intl.DateTimeFormat(LOCALE[language], {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}-01T00:00:00Z`));
}

/** "Mar" / "Mar", for a chart axis. */
export function monthShort(value: string, language: Language): string {
  return new Intl.DateTimeFormat(LOCALE[language], {
    month: "short",
    timeZone: "UTC",
  }).format(new Date(`${value}-01T00:00:00Z`));
}

export function days(count: number, language: Language): string {
  return `${count} ${language === "tr" ? "gün" : count === 1 ? "day" : "days"}`;
}
