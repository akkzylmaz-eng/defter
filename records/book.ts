import { sum } from "@/kit/money";
import { quarterOf, yearOf } from "@/kit/dates";
import { totalReceipts } from "@/engine/makbuz/receipt";
import { receiptOf, outstanding, receivables, daysToPayment, onTimeRate, ageing } from "@/engine/invoices/ledger";
import { accrued } from "@/engine/invoices/interest";
import { concentration, standings } from "@/engine/clients/book";
import { annualReturn } from "@/engine/tax/annual";
import { schedule, totalAdvancePaid } from "@/engine/tax/advance";
import { clients } from "./clients";
import { invoices } from "./invoices";
import {
  TAX_YEAR,
  TODAY,
  advanceDeadlines,
  expensesToDate,
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

/**
 * Advance tax periods, built from the receipts themselves rather than typed in.
 * Each period is cumulative from the start of the year, which is the rule the
 * quarters actually follow.
 */
export const periods = ([1, 2, 3] as const).map((quarter) => {
  const upTo = issued.filter((invoice) => quarterOf(invoice.issuedOn) <= quarter);
  const upToReceipts = upTo.map(receiptOf);
  // Expenses are spread evenly across the year for the demo; a real book would
  // carry dated expense records and this would filter them the same way.
  const share = quarter / 4;

  return {
    quarter,
    cumulativeGross: sum(upToReceipts.map((receipt) => receipt.brut)),
    cumulativeExpenses: Math.round(expensesToDate * share),
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
