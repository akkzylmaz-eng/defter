import { sum } from "@/kit/money";
import { quarterOf, yearOf } from "@/kit/dates";
import { totalReceipts } from "@/engine/makbuz/receipt";
import { receiptOf, outstanding, receivables, daysToPayment, onTimeRate, ageing } from "@/engine/invoices/ledger";
import { accrued } from "@/engine/invoices/interest";
import { concentration, standings } from "@/engine/clients/book";
import { annualReturn } from "@/engine/tax/annual";
import { schedule, totalAdvancePaid } from "@/engine/tax/advance";
import {
  deductibleByMonth,
  deductibleTotal,
  reclaimableTotal,
  vatReturns,
  vatTotals,
  upcomingVat,
  type VatMonth,
} from "@/engine/kdv/vat";
import { clients } from "./clients";
import { invoices } from "./invoices";
import { expenses } from "./expenses";
import {
  TAX_YEAR,
  TODAY,
  advanceDeadlines,
  lateInterestRate,
} from "./workspace";

/**
 * The assembled book.
 *
 * `engine/` never imports a fixture and `records/` never imports React, so
 * this file is the single seam where the two meet. Every screen reads from
 * here, which is why a figure on the ledger page and the same figure on the
 * tax page cannot drift apart: there is only one of it.
 */

export const issued = invoices.filter(
  (invoice) => !invoice.draft && yearOf(invoice.issuedOn) === TAX_YEAR,
);

export const receipts = issued.map(receiptOf);
export const totals = totalReceipts(receipts);

export const settled = issued.filter((invoice) => invoice.paidOn);
export const collected = sum(settled.map((invoice) => receiptOf(invoice).tahsil));

export const open = outstanding(invoices);
export const owed = receivables(invoices);
export const ageRows = ageing(invoices, TODAY);
export const interestAccrued = accrued(invoices, TODAY, lateInterestRate);

export const book = standings(clients, invoices);
export const spread = concentration(book);

export const medianLag = daysToPayment(issued);
export const paidOnTime = onTimeRate(issued);

export const booked = expenses.filter((expense) => yearOf(expense.day) === TAX_YEAR);

/**
 * What comes off the income tax base. Net of reclaimable VAT, because that VAT
 * is recovered on the monthly return rather than borne as a cost.
 */
export const expensesToDate = deductibleTotal(booked);
export const kdvReclaimed = reclaimableTotal(booked);

/**
 * The monthly VAT returns for the year so far. The charged side comes from the
 * receipts, the reclaimable side from the expense book, and the credit threads
 * from one month to the next.
 */
export const vatMonths: VatMonth[] = (() => {
  const deductible = deductibleByMonth(booked);
  const collected = new Map<string, number>();
  for (const invoice of issued) {
    const month = invoice.issuedOn.slice(0, 7);
    collected.set(month, (collected.get(month) ?? 0) + receiptOf(invoice).kdv);
  }

  const months = [...new Set([...collected.keys(), ...deductible.keys()])].sort();
  return months.map((month) => ({
    month,
    collected: collected.get(month) ?? 0,
    deductible: deductible.get(month) ?? 0,
  }));
})();

export const vatFilings = vatReturns(vatMonths);
export const vat = vatTotals(vatFilings);
export const vatAhead = upcomingVat(vatFilings, TODAY);

/**
 * Advance tax periods, built from the receipts themselves rather than typed in.
 * Each period is cumulative from the start of the year, which is the rule the
 * quarters actually follow.
 */
export const periods = ([1, 2, 3] as const).map((quarter) => {
  const upTo = issued.filter((invoice) => quarterOf(invoice.issuedOn) <= quarter);
  const upToReceipts = upTo.map(receiptOf);
  // Expenses are filtered by the quarter they were booked in, the same way the
  // receipts are. Spreading a yearly total evenly instead would move a January
  // equipment purchase into quarters that never saw it and understate the first
  // instalment, which is the quarter with the least income to absorb it.
  const upToExpenses = booked.filter((expense) => quarterOf(expense.day) <= quarter);

  return {
    quarter,
    cumulativeGross: sum(upToReceipts.map((receipt) => receipt.brut)),
    cumulativeExpenses: deductibleTotal(upToExpenses),
    cumulativeWithheld: sum(upToReceipts.map((receipt) => receipt.stopaj)),
    dueOn: advanceDeadlines[quarter],
  };
});

export const instalments = schedule(periods);
export const advancePaid = totalAdvancePaid(instalments, TODAY);

/** What the return would say if the year closed today. */
export const yearToDate = annualReturn({
  gross: totals.brut,
  expenses: expensesToDate,
  withheld: totals.stopaj,
  advancePaid,
});
