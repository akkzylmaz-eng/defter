import { describe, expect, it } from "vitest";
import { lira } from "@/kit/money";
import { DEFAULT_RATES } from "@/engine/makbuz/receipt";
import type { Invoice } from "@/engine/invoices/types";
import { standings, type Client } from "@/engine/clients/book";
import { schedule } from "@/engine/tax/advance";
import { expectedPayment, project, runwayMonths, shortfall } from "@/engine/cashflow/projection";
import { clients } from "@/records/clients";
import { invoices } from "@/records/invoices";
import { TODAY, monthlyExpenses, openingBalance } from "@/records/workspace";

const client = (id: string): Client => ({
  id, name: id, kind: "company", since: "2026-01-01", note: { tr: "", en: "" },
});

function invoice(clientId: string, over: Partial<Invoice> = {}): Invoice {
  return {
    id: Math.random().toString(36), serial: "x", clientId,
    description: { tr: "", en: "" },
    brut: lira(10_000), rates: DEFAULT_RATES,
    issuedOn: "2026-01-01", dueOn: "2026-01-31", paidOn: null,
    ...over,
  };
}

describe("expectedPayment", () => {
  it("shifts an invoice by the client's own median lag", () => {
    const book = standings(
      [client("late")],
      [
        invoice("late", { dueOn: "2026-01-31", paidOn: "2026-03-02" }),
        invoice("late", { dueOn: "2026-02-28", paidOn: "2026-03-30" }),
      ],
    );
    const open = invoice("late", { dueOn: "2026-08-31" });
    // 30 days of history, so August's invoice is expected at the end of September.
    expect(expectedPayment(open, book, "2026-07-01")).toBe("2026-09-30");
  });

  it("falls back to the due date for a client with no history", () => {
    const book = standings([client("new")], []);
    expect(expectedPayment(invoice("new", { dueOn: "2026-09-15" }), book, "2026-07-01"))
      .toBe("2026-09-15");
  });

  it("brings a past-due expectation into the present rather than the past", () => {
    const book = standings([client("a")], []);
    expect(expectedPayment(invoice("a", { dueOn: "2026-01-31" }), book, "2026-07-01"))
      .toBe("2026-07-01");
  });

  it("keeps a settled invoice on the day it was actually paid", () => {
    const open = invoice("a", { dueOn: "2026-08-31", paidOn: "2026-06-01" });
    expect(expectedPayment(open, standings([client("a")], []), "2026-07-01")).toBe("2026-06-01");
  });
});

describe("project", () => {
  const base = {
    from: "2026-07-01",
    months: 4,
    openingBalance: lira(100_000),
    standings: standings([client("a")], []),
    instalments: [],
    monthlyExpenses: lira(20_000),
  };

  it("runs the balance forward month by month", () => {
    const cells = project({ ...base, invoices: [] });
    expect(cells.map((cell) => cell.month)).toEqual(["2026-07", "2026-08", "2026-09", "2026-10"]);
    expect(cells.map((cell) => cell.balance)).toEqual([
      lira(80_000), lira(60_000), lira(40_000), lira(20_000),
    ]);
  });

  it("lands a collection in the month it is expected, not the month it is due", () => {
    const book = standings(
      [client("slow")],
      [invoice("slow", { dueOn: "2026-01-31", paidOn: "2026-03-17" })],
    );
    const cells = project({
      ...base,
      standings: book,
      invoices: [invoice("slow", { brut: lira(50_000), dueOn: "2026-08-20" })],
    });
    // 45 days of lag pushes an invoice due 20 August into October.
    expect(cells.find((cell) => cell.month === "2026-08")!.collections).toBe(0);
    expect(cells.find((cell) => cell.month === "2026-10")!.collections).toBeGreaterThan(0);
  });

  it("puts tax instalments on the same timeline as the invoices", () => {
    const instalments = schedule([
      { quarter: 1, cumulativeGross: lira(600_000), cumulativeExpenses: 0, cumulativeWithheld: 0, dueOn: "2026-08-17" },
    ]);
    const cells = project({ ...base, invoices: [], instalments });
    const august = cells.find((cell) => cell.month === "2026-08")!;
    expect(august.tax).toBe(lira(90_000));
    expect(august.net).toBe(-lira(110_000));
  });

  it("ignores drafts and instalments that already fell due", () => {
    const past = schedule([
      { quarter: 1, cumulativeGross: lira(600_000), cumulativeExpenses: 0, cumulativeWithheld: 0, dueOn: "2026-05-17" },
    ]);
    const cells = project({
      ...base,
      invoices: [invoice("a", { draft: true, brut: lira(500_000), dueOn: "2026-07-10" })],
      instalments: past,
    });
    expect(cells.every((cell) => cell.tax === 0)).toBe(true);
    expect(cells.every((cell) => cell.collections === 0)).toBe(true);
  });

  it("keeps net and balance consistent with their parts", () => {
    const cells = project({ ...base, invoices, standings: standings(clients, invoices) });
    let running = base.openingBalance;
    for (const cell of cells) {
      expect(cell.net).toBe(cell.collections - cell.expenses - cell.tax);
      running += cell.net;
      expect(cell.balance).toBe(running);
    }
  });
});

describe("shortfall and runway", () => {
  it("names the first month the balance turns negative", () => {
    const cells = project({
      from: "2026-07-01", months: 6, openingBalance: lira(50_000),
      invoices: [], standings: [], instalments: [], monthlyExpenses: lira(20_000),
    });
    // 50.000 opening, 20.000 out a month: July 30.000, August 10.000, September under.
    expect(shortfall(cells)!.month).toBe("2026-09");
  });

  it("is null when the balance never goes under", () => {
    const cells = project({
      from: "2026-07-01", months: 6, openingBalance: lira(500_000),
      invoices: [], standings: [], instalments: [], monthlyExpenses: lira(20_000),
    });
    expect(shortfall(cells)).toBeNull();
  });

  it("reports runway in months at the current burn", () => {
    expect(runwayMonths(lira(100_000), lira(25_000))).toBe(4);
    expect(runwayMonths(lira(100_000), 0)).toBe(Infinity);
  });

  it("keeps the demo workspace solvent across the rest of the year", () => {
    const cells = project({
      from: TODAY, months: 6, openingBalance,
      invoices, standings: standings(clients, invoices),
      instalments: [], monthlyExpenses,
    });
    expect(shortfall(cells)).toBeNull();
  });
});
