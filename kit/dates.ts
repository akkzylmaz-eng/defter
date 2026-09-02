/**
 * Dates.
 *
 * Everything is handled as a plain "YYYY-MM-DD" day string in UTC. Invoices,
 * due dates and tax deadlines are calendar days, not instants: an invoice due
 * on the 30th is due on the 30th in every time zone, and parsing it as a local
 * timestamp is how a due date silently moves a day when the office is in
 * İstanbul and the server is in Virginia.
 */

export type Day = string;

const DAY_MS = 86_400_000;

export function toUtc(day: Day): Date {
  const [year, month, date] = day.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, date));
}

export function toDay(date: Date): Day {
  return date.toISOString().slice(0, 10);
}

/** Whole days from `from` to `to`. Negative when `to` is earlier. */
export function daysBetween(from: Day, to: Day): number {
  return Math.round((toUtc(to).getTime() - toUtc(from).getTime()) / DAY_MS);
}

export function addDays(day: Day, count: number): Day {
  return toDay(new Date(toUtc(day).getTime() + count * DAY_MS));
}

/** Calendar month arithmetic, clamped: 31 January plus one month is 28/29 February. */
export function addMonths(day: Day, count: number): Day {
  const date = toUtc(day);
  const target = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + count, 1),
  );
  const lastDay = new Date(
    Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0),
  ).getUTCDate();
  target.setUTCDate(Math.min(date.getUTCDate(), lastDay));
  return toDay(target);
}

/** "2026-03" for grouping and for the cash-flow projection. */
export function monthOf(day: Day): string {
  return day.slice(0, 7);
}

export function startOfMonth(month: string): Day {
  return `${month}-01`;
}

export function endOfMonth(month: string): Day {
  const [year, m] = month.split("-").map(Number);
  return toDay(new Date(Date.UTC(year, m, 0)));
}

export function yearOf(day: Day): number {
  return Number(day.slice(0, 4));
}

/** 1 to 4. */
export function quarterOf(day: Day): number {
  return Math.floor((Number(day.slice(5, 7)) - 1) / 3) + 1;
}

/** Median of a numeric sample. Returns 0 for an empty sample. */
export function median(values: readonly number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[middle - 1] + sorted[middle]) / 2
    : sorted[middle];
}
