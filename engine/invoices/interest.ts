import { roundHalfUp, type Kurus } from "@/kit/money";
import { daysBetween, type Day } from "@/kit/dates";
import type { Invoice } from "./types";
import { receiptOf } from "./ledger";

/**
 * Late payment interest.
 *
 * Turkish commercial default interest runs from the day after the due date, on
 * the collectable amount, as simple interest on a 365-day year. Simple, not
 * compound: compounding a receivable produces a number that no court would
 * award and that would only ever embarrass the person who sent it.
 *
 * The rate belongs to the workspace rather than to this module. It tracks a
 * published central bank figure and changes; hard-coding it here would mean a
 * code change every time it moves.
 */

/** Annual rate, e.g. 0.48 for 48%. */
export type AnnualRate = number;

export interface Interest {
  days: number;
  principal: Kurus;
  amount: Kurus;
  /** Principal plus interest: what an invoice reminder would actually claim. */
  claim: Kurus;
}

export function lateInterest(
  invoice: Invoice,
  today: Day,
  annualRate: AnnualRate,
): Interest {
  const principal = receiptOf(invoice).tahsil;
  const settled = invoice.paidOn ?? today;
  // From the day *after* the due date: an invoice paid on its due date is on
  // time and owes nothing, and a one-day grace is the difference between a
  // reminder that is correct and one that is merely aggressive.
  const days = Math.max(0, daysBetween(invoice.dueOn, settled));

  if (invoice.draft || days === 0) {
    return { days: 0, principal, amount: 0, claim: principal };
  }

  const amount = roundHalfUp((principal * annualRate * days) / 365);
  return { days, principal, amount, claim: principal + amount };
}

/** Interest accrued across every overdue invoice: the cost of being patient. */
export function accrued(
  invoices: readonly Invoice[],
  today: Day,
  annualRate: AnnualRate,
): Kurus {
  return invoices
    .filter((invoice) => !invoice.draft && !invoice.paidOn)
    .reduce((total, invoice) => total + lateInterest(invoice, today, annualRate).amount, 0);
}
