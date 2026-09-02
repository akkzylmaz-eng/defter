import type { Kurus } from "@/kit/money";
import { incomeTax, marginalRate, effectiveRate, SCHEDULE_2026, type Schedule } from "./brackets";

/**
 * The annual return.
 *
 * The whole point of this calculation is the offset at the end. Withholding
 * already paid during the year is credited against the bill, and when the
 * credit is larger than the bill the difference is refundable rather than
 * zero. Clamping it at zero, which is the tempting simplification, quietly
 * deletes money the freelancer is owed. That happens often: a year of
 * corporate clients withholds 20% of every fee, while the first 158.000 TL of
 * income is only taxed at 15%.
 */

export interface AnnualInput {
  /** Gross fees invoiced in the year, before withholding. */
  gross: Kurus;
  /** Deductible business expenses. */
  expenses: Kurus;
  /** Withholding the clients already paid on the freelancer's behalf. */
  withheld: Kurus;
  /** Advance tax instalments already paid during the year. */
  advancePaid: Kurus;
  schedule?: Schedule;
}

export interface AnnualResult {
  /** Gross less expenses: the amount the bands are applied to. */
  base: Kurus;
  tax: Kurus;
  credits: Kurus;
  /** Positive means still owed, negative means refundable. */
  balance: Kurus;
  refundable: boolean;
  marginalRate: number;
  effectiveRate: number;
}

export function annualReturn(input: AnnualInput): AnnualResult {
  const schedule = input.schedule ?? SCHEDULE_2026;
  // Expenses can exceed income in a bad year; the base floors at zero rather
  // than producing a negative tax out of thin air.
  const base = Math.max(0, input.gross - input.expenses);
  const tax = incomeTax(base, schedule);
  const credits = input.withheld + input.advancePaid;
  const balance = tax - credits;

  return {
    base,
    tax,
    credits,
    balance,
    refundable: balance < 0,
    marginalRate: marginalRate(base, schedule),
    effectiveRate: effectiveRate(base, schedule),
  };
}

/**
 * How much of each incoming lira to put aside so the year does not end with a
 * surprise. Based on the marginal rate at the income reached so far, less the
 * share already withheld at source, and never negative: when withholding
 * already covers the marginal rate, nothing needs reserving.
 */
export function setAsideRate(
  baseSoFar: Kurus,
  stopajRate: number,
  schedule: Schedule = SCHEDULE_2026,
): number {
  const marginal = marginalRate(baseSoFar, schedule);
  return Math.max(0, Math.round((marginal - stopajRate) * 1000) / 1000);
}
