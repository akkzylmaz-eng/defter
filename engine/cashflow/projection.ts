import type { Kurus } from "@/kit/money";
import { addDays, addMonths, monthOf, type Day } from "@/kit/dates";
import type { Invoice } from "@/engine/invoices/types";
import { receiptOf } from "@/engine/invoices/ledger";
import type { ClientStanding } from "@/engine/clients/book";
import type { Instalment } from "@/engine/tax/advance";

/**
 * Cash-flow projection.
 *
 * The version every invoicing tool ships assumes invoices are paid on their
 * due date. That projection is always wrong in the same direction, and it is
 * wrong in the month it matters: the freelancer sees money arriving in March
 * and commits to something, and the client who has taken 45 days on every
 * single invoice for two years takes 45 days again.
 *
 * So each invoice is scheduled by the paying client's own median lag, learned
 * from their settled invoices. A client with no history falls back to the
 * terms on the invoice, which is the only honest guess available.
 *
 * Tax is treated as an outflow on the same timeline, because the reason a
 * freelance year goes wrong is almost never the invoices. It is the advance
 * tax instalment landing in a month that already looked thin.
 */

export interface MonthCell {
  /** "2026-03". */
  month: string;
  collections: Kurus;
  expenses: Kurus;
  tax: Kurus;
  /** collections - expenses - tax. */
  net: Kurus;
  /** Running balance at the end of this month. */
  balance: Kurus;
}

export interface ProjectionInput {
  from: Day;
  months: number;
  openingBalance: Kurus;
  invoices: readonly Invoice[];
  standings: readonly ClientStanding[];
  instalments: readonly Instalment[];
  /** Recurring monthly outgoings: rent, software, accountant. */
  monthlyExpenses: Kurus;
}

/** When this invoice is realistically collected, given who owes it. */
export function expectedPayment(
  invoice: Invoice,
  standings: readonly ClientStanding[],
  today: Day,
): Day {
  if (invoice.paidOn) return invoice.paidOn;
  const standing = standings.find((entry) => entry.client.id === invoice.clientId);
  const lag = standing && standing.invoices > 0 ? standing.lagDays : 0;
  const expected = addDays(invoice.dueOn, lag);
  // An invoice already past its expected date has not stopped being collectable;
  // it lands in the current month rather than in the past.
  return expected < today ? today : expected;
}

export function project(input: ProjectionInput): MonthCell[] {
  const months: string[] = [];
  for (let i = 0; i < input.months; i += 1) {
    months.push(monthOf(addMonths(input.from, i)));
  }

  const cells = new Map<string, MonthCell>(
    months.map((month) => [
      month,
      { month, collections: 0, expenses: input.monthlyExpenses, tax: 0, net: 0, balance: 0 },
    ]),
  );

  for (const invoice of input.invoices) {
    if (invoice.draft || invoice.paidOn) continue;
    const cell = cells.get(monthOf(expectedPayment(invoice, input.standings, input.from)));
    if (cell) cell.collections += receiptOf(invoice).tahsil;
  }

  for (const instalment of input.instalments) {
    if (instalment.payable === 0 || instalment.dueOn < input.from) continue;
    const cell = cells.get(monthOf(instalment.dueOn));
    if (cell) cell.tax += instalment.payable;
  }

  let balance = input.openingBalance;
  return months.map((month) => {
    const cell = cells.get(month)!;
    cell.net = cell.collections - cell.expenses - cell.tax;
    balance += cell.net;
    cell.balance = balance;
    return cell;
  });
}

/**
 * The first month the balance goes negative, or null if it never does.
 *
 * A single number is what gets acted on. "You run out in June" changes a
 * decision; a twelve-row table of net figures does not.
 */
export function shortfall(cells: readonly MonthCell[]): MonthCell | null {
  return cells.find((cell) => cell.balance < 0) ?? null;
}

/** Months of cover at the current burn rate, given no new work at all. */
export function runwayMonths(openingBalance: Kurus, monthlyExpenses: Kurus): number {
  if (monthlyExpenses <= 0) return Infinity;
  return Math.round((openingBalance / monthlyExpenses) * 10) / 10;
}
