import { share, sum, type Kurus } from "@/kit/money";
import { daysBetween, median, type Day } from "@/kit/dates";
import type { Bilingual, Invoice } from "@/engine/invoices/types";
import { receiptOf } from "@/engine/invoices/ledger";

/**
 * The client book.
 *
 * Two things a freelancer needs to know about a client and usually only learns
 * the hard way: how late they really pay, and how much of the year depends on
 * them.
 */

export interface Client {
  id: string;
  name: string;
  /** Individual clients do not withhold; the receipt rates carry that. */
  kind: "company" | "individual" | "abroad";
  since: Day;
  note: Bilingual;
}

export interface ClientStanding {
  client: Client;
  invoiced: Kurus;
  collected: Kurus;
  outstanding: Kurus;
  /**
   * Median days from due date to payment, over settled invoices. Negative
   * means they habitually pay early. This is the number the cash-flow
   * projection uses, rather than the payment terms nobody honours.
   */
  lagDays: number;
  onTimeRate: number;
  invoices: number;
}

const NO_HISTORY = 0;

export function standings(
  clients: readonly Client[],
  invoices: readonly Invoice[],
): ClientStanding[] {
  return clients
    .map((client) => {
      const own = invoices.filter(
        (invoice) => invoice.clientId === client.id && !invoice.draft,
      );
      const settled = own.filter((invoice) => invoice.paidOn);
      const lags = settled.map((invoice) => daysBetween(invoice.dueOn, invoice.paidOn!));

      return {
        client,
        invoiced: sum(own.map((invoice) => receiptOf(invoice).tahsil)),
        collected: sum(settled.map((invoice) => receiptOf(invoice).tahsil)),
        outstanding: sum(
          own.filter((i) => !i.paidOn).map((invoice) => receiptOf(invoice).tahsil),
        ),
        lagDays: lags.length === 0 ? NO_HISTORY : Math.round(median(lags)),
        onTimeRate:
          settled.length === 0
            ? 0
            : Math.round(
                (settled.filter((i) => i.paidOn! <= i.dueOn).length / settled.length) * 1000,
              ) / 10,
        invoices: own.length,
      };
    })
    .sort((a, b) => b.invoiced - a.invoiced);
}

export interface Concentration {
  /** Share of income from the single largest client, 0 to 100. */
  topShare: number;
  topClient: Client | null;
  /**
   * Herfindahl index over client shares, 0 to 1. One client is 1; ten equal
   * clients is 0.1. It reads the whole distribution rather than only the
   * largest name, so three clients at 30% each is correctly flagged as
   * concentrated even though no single share looks alarming.
   */
  hhi: number;
  risk: "low" | "watch" | "high";
}

/** Above this share of income from one client, losing them ends the year. */
const HIGH_HHI = 0.35;
const WATCH_HHI = 0.2;

export function concentration(standings: readonly ClientStanding[]): Concentration {
  const total = sum(standings.map((standing) => standing.invoiced));
  if (total === 0) {
    return { topShare: 0, topClient: null, hhi: 0, risk: "low" };
  }

  const shares = standings.map((standing) => standing.invoiced / total);
  const hhi = Math.round(shares.reduce((total, s) => total + s * s, 0) * 1000) / 1000;
  const top = standings.reduce((best, standing) =>
    standing.invoiced > best.invoiced ? standing : best,
  );

  return {
    topShare: share(top.invoiced, total),
    topClient: top.client,
    hhi,
    risk: hhi >= HIGH_HHI ? "high" : hhi >= WATCH_HHI ? "watch" : "low",
  };
}
