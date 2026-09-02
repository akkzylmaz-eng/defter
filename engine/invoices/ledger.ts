import { sum, type Kurus } from "@/kit/money";
import { daysBetween, median, type Day } from "@/kit/dates";
import { fromGross, type Receipt } from "@/engine/makbuz/receipt";
import type { Invoice, InvoiceState } from "./types";

/**
 * Invoice state and ageing.
 *
 * State is derived, never stored. A stored status is a second source of truth
 * that goes stale the moment a due date passes with nobody logged in, and
 * "overdue" is precisely the status that has to be right without anyone
 * touching it.
 */

export function stateOf(invoice: Invoice, today: Day): InvoiceState {
  if (invoice.draft) return "draft";
  if (invoice.paidOn) return invoice.paidOn > invoice.dueOn ? "paid-late" : "paid";
  return today > invoice.dueOn ? "overdue" : "outstanding";
}

/** Days past the due date. Zero while the invoice is still within terms. */
export function daysOverdue(invoice: Invoice, today: Day): number {
  if (invoice.draft) return 0;
  const settled = invoice.paidOn ?? today;
  return Math.max(0, daysBetween(invoice.dueOn, settled));
}

/** The receipt this invoice implies, so tax figures and the ledger cannot drift. */
export function receiptOf(invoice: Invoice): Receipt {
  return fromGross(invoice.brut, invoice.rates);
}

export type AgeBucket = "current" | "d1_30" | "d31_60" | "d61_90" | "d90_plus";

export const BUCKET_ORDER: AgeBucket[] = ["current", "d1_30", "d31_60", "d61_90", "d90_plus"];

/**
 * Ageing buckets.
 *
 * The boundaries are inclusive at the top: exactly 30 days late belongs to
 * 1-30, not to 31-60. Off-by-one here is invisible in a demo and shows up as a
 * receivable that changes bucket a day early in production.
 */
export function bucketOf(days: number): AgeBucket {
  if (days <= 0) return "current";
  if (days <= 30) return "d1_30";
  if (days <= 60) return "d31_60";
  if (days <= 90) return "d61_90";
  return "d90_plus";
}

export interface AgeRow {
  bucket: AgeBucket;
  count: number;
  /** Outstanding collectable amount, meaning the receipt total. */
  amount: Kurus;
}

/** Ageing over unpaid, issued invoices only. Drafts and paid ones are not receivables. */
export function ageing(invoices: readonly Invoice[], today: Day): AgeRow[] {
  const rows = new Map<AgeBucket, AgeRow>(
    BUCKET_ORDER.map((bucket) => [bucket, { bucket, count: 0, amount: 0 }]),
  );

  for (const invoice of invoices) {
    if (invoice.draft || invoice.paidOn) continue;
    const row = rows.get(bucketOf(daysOverdue(invoice, today)))!;
    row.count += 1;
    row.amount += receiptOf(invoice).tahsil;
  }

  return BUCKET_ORDER.map((bucket) => rows.get(bucket)!);
}

export function outstanding(invoices: readonly Invoice[]): Invoice[] {
  return invoices.filter((invoice) => !invoice.draft && !invoice.paidOn);
}

export function receivables(invoices: readonly Invoice[]): Kurus {
  return sum(outstanding(invoices).map((invoice) => receiptOf(invoice).tahsil));
}

/**
 * Days sales outstanding, measured as the median days from issue to payment.
 *
 * Median rather than mean, and per invoice rather than the textbook
 * receivables-over-revenue ratio, because a freelancer has a handful of
 * invoices rather than thousands. With ten invoices, one client who paid after
 * 140 days drags a mean into uselessness while the median still describes what
 * normally happens.
 */
export function daysToPayment(invoices: readonly Invoice[]): number {
  const settled = invoices.filter((invoice) => !invoice.draft && invoice.paidOn);
  return median(settled.map((invoice) => daysBetween(invoice.issuedOn, invoice.paidOn!)));
}

/** Share of settled invoices that were paid by their due date, 0 to 100. */
export function onTimeRate(invoices: readonly Invoice[]): number {
  const settled = invoices.filter((invoice) => !invoice.draft && invoice.paidOn);
  if (settled.length === 0) return 0;
  const onTime = settled.filter((invoice) => invoice.paidOn! <= invoice.dueOn).length;
  return Math.round((onTime / settled.length) * 1000) / 10;
}
