import { applyRate, type Kurus } from "@/kit/money";
import { monthOf, type Day } from "@/kit/dates";

/**
 * KDV: the monthly VAT return.
 *
 * Two mistakes this module exists to prevent, and a freelancer doing their own
 * books makes both.
 *
 * The first is deducting an expense from income tax at its gross amount. VAT
 * paid to a supplier is not a cost when it can be reclaimed: it comes back on
 * the VAT return. Deducting the gross from income tax and reclaiming the VAT
 * as well deducts the same money twice, which the tax office does notice. So
 * the income tax deduction is the net, and `deductible` is where that lives.
 *
 * The second is expecting a refund. When a month's reclaimable VAT is larger
 * than the VAT charged to clients, the difference is not paid back. It becomes
 * devreden KDV and offsets the next month, and the month after that, for as
 * long as it takes. Treating it as a receivable overstates cash by the whole
 * amount. This is the same shape as the advance tax instalment in
 * `engine/tax/advance`, and for the same reason: the state collects promptly
 * and refunds slowly.
 */

export type ExpenseCategory =
  | "workspace"
  | "professional"
  | "software"
  | "communications"
  | "equipment"
  | "travel";

export interface Expense {
  id: string;
  day: Day;
  category: ExpenseCategory;
  description: { tr: string; en: string };
  /** The amount on the supplier's invoice before VAT. */
  net: Kurus;
  /** VAT rate on that invoice. Zero for a supplier abroad, which charges none. */
  kdvRate: number;
  /**
   * Whether that VAT can be reclaimed on the return.
   *
   * Almost always yes. The exception a freelancer actually meets is the
   * passenger car: VAT paid on buying one is not deductible, so it stops being
   * VAT and becomes part of what the car cost. `deductible` handles that by
   * giving income tax the gross for those lines and the net for every other.
   */
  reclaimable: boolean;
}

/** VAT on the supplier's invoice, reclaimable or not. */
export function kdvOf(expense: Expense): Kurus {
  return applyRate(expense.net, expense.kdvRate);
}

/** The part of the VAT that comes back on the return. */
export function reclaimableKdv(expense: Expense): Kurus {
  return expense.reclaimable ? kdvOf(expense) : 0;
}

/**
 * What this expense takes off the income tax base.
 *
 * Net when the VAT is reclaimable, gross when it is not, because unreclaimable
 * VAT is a real cost with nowhere else to go.
 */
export function deductible(expense: Expense): Kurus {
  return expense.reclaimable ? expense.net : expense.net + kdvOf(expense);
}

export function deductibleTotal(expenses: readonly Expense[]): Kurus {
  return expenses.reduce((total, expense) => total + deductible(expense), 0);
}

export function reclaimableTotal(expenses: readonly Expense[]): Kurus {
  return expenses.reduce((total, expense) => total + reclaimableKdv(expense), 0);
}

/** A month's two sides, before any carried credit is applied. */
export interface VatMonth {
  /** "2026-03". */
  month: string;
  /** Hesaplanan KDV: charged to clients on the receipts issued this month. */
  collected: Kurus;
  /** Indirilecek KDV: reclaimable VAT on the expenses booked this month. */
  deductible: Kurus;
}

export interface VatReturn extends VatMonth {
  /** Devreden KDV arriving from the previous month. */
  carriedIn: Kurus;
  /** What is actually paid. Never negative, because a month never refunds. */
  payable: Kurus;
  /** Devreden KDV leaving for the next month. */
  carriedOut: Kurus;
  /** The filing deadline: the 28th of the following month. */
  dueOn: Day;
}

/**
 * The return is filed and paid by the 28th of the month after the period, so
 * a month's VAT leaves the account almost two months after the work was
 * invoiced. That lag is the point of showing it next to the cash flow.
 */
export function filingDay(month: string): Day {
  const [year, index] = month.split("-").map(Number);
  const nextYear = index === 12 ? year + 1 : year;
  const nextIndex = index === 12 ? 1 : index + 1;
  return `${nextYear}-${String(nextIndex).padStart(2, "0")}-28`;
}

/** Group reclaimable VAT by the month the expense was booked in. */
export function deductibleByMonth(expenses: readonly Expense[]): Map<string, Kurus> {
  const months = new Map<string, Kurus>();
  for (const expense of expenses) {
    const month = monthOf(expense.day);
    months.set(month, (months.get(month) ?? 0) + reclaimableKdv(expense));
  }
  return months;
}

/**
 * Run the months in order, threading the carried credit through.
 *
 * Months are sorted rather than trusted in the order given: a period arriving
 * out of sequence would apply a credit before it was earned and understate the
 * bill for the month that should have paid it.
 */
export function vatReturns(
  months: readonly VatMonth[],
  opening: Kurus = 0,
): VatReturn[] {
  const returns: VatReturn[] = [];
  let carried = opening;

  for (const month of [...months].sort((a, b) => a.month.localeCompare(b.month))) {
    const available = month.deductible + carried;
    const balance = month.collected - available;

    returns.push({
      ...month,
      carriedIn: carried,
      payable: Math.max(0, balance),
      carriedOut: balance < 0 ? -balance : 0,
      dueOn: filingDay(month.month),
    });

    carried = balance < 0 ? -balance : 0;
  }

  return returns;
}

export interface VatTotals {
  collected: Kurus;
  deductible: Kurus;
  paid: Kurus;
  /** Still sitting on the account after the last month in the range. */
  carried: Kurus;
}

export function vatTotals(returns: readonly VatReturn[]): VatTotals {
  const last = returns[returns.length - 1];
  return {
    collected: returns.reduce((total, period) => total + period.collected, 0),
    deductible: returns.reduce((total, period) => total + period.deductible, 0),
    paid: returns.reduce((total, period) => total + period.payable, 0),
    carried: last ? last.carriedOut : 0,
  };
}

/** Returns still ahead of `today`, in due order: the cash-flow view. */
export function upcomingVat(returns: readonly VatReturn[], today: Day): VatReturn[] {
  return returns
    .filter((period) => period.dueOn >= today && period.payable > 0)
    .sort((a, b) => a.dueOn.localeCompare(b.dueOn));
}
