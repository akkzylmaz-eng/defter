import { lira } from "@/kit/money";
import type { Day } from "@/kit/dates";

/**
 * The demo workspace: one freelancer, one tax year.
 *
 * Everything Defter shows is derived from these records and the functions in
 * `engine/`. Nothing is precomputed, so a figure on screen and a figure in a
 * test cannot disagree.
 */

/** The day the workspace is frozen at, so every figure is stable. */
export const TODAY: Day = "2026-07-19";
export const TAX_YEAR = 2026;

export const owner = {
  trade: "Bağımsız ürün tasarımı ve arayüz geliştirme",
  tradeEn: "Independent product design and interface engineering",
  city: "İstanbul",
  taxOffice: "Beşiktaş",
};

/** Cash in the business account on the morning of TODAY. */
export const openingBalance = lira(186_400);

/** Rent, software, accountant, insurance: what leaves every month regardless. */
export const monthlyExpenses = lira(24_800);

/**
 * Deductible expenses booked so far this year. Kept as a running figure rather
 * than a list of receipts, because the tax engine only needs the total and a
 * fake expense ledger would be the least interesting part of this project.
 */
export const expensesToDate = lira(148_900);

/**
 * Annual default interest rate for overdue commercial invoices. It tracks a
 * published central bank figure, so it lives in the workspace and not in the
 * interest module.
 */
export const lateInterestRate = 0.48;

/** Advance tax deadlines for 2026. Q4 is settled in the annual return. */
export const advanceDeadlines: Record<1 | 2 | 3, Day> = {
  1: "2026-05-17",
  2: "2026-08-17",
  3: "2026-11-17",
};
