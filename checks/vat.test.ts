import { describe, it, expect } from "vitest";
import { lira } from "@/kit/money";
import {
  deductible,
  deductibleByMonth,
  deductibleTotal,
  filingDay,
  kdvOf,
  reclaimableKdv,
  reclaimableTotal,
  upcomingVat,
  vatReturns,
  vatTotals,
  type Expense,
  type VatMonth,
} from "@/engine/kdv/vat";
import { expenses } from "@/records/expenses";
import { vatFilings, vat, expensesToDate, periods } from "@/records/book";

function expense(overrides: Partial<Expense> = {}): Expense {
  return {
    id: "exp-test",
    day: "2026-03-10",
    category: "software",
    description: { tr: "Test", en: "Test" },
    net: lira(1_000),
    kdvRate: 0.2,
    reclaimable: true,
    ...overrides,
  };
}

describe("an expense line", () => {
  it("takes its net off the income tax base when the VAT comes back", () => {
    const line = expense({ net: lira(10_000), kdvRate: 0.2 });
    expect(kdvOf(line)).toBe(lira(2_000));
    expect(deductible(line)).toBe(lira(10_000));
    expect(reclaimableKdv(line)).toBe(lira(2_000));
  });

  it("takes the gross when the VAT cannot be reclaimed", () => {
    // A passenger car: the VAT is not deductible on the return, so it stops
    // being VAT and becomes part of what the car cost.
    const car = expense({ net: lira(600_000), kdvRate: 0.2, reclaimable: false });
    expect(reclaimableKdv(car)).toBe(0);
    expect(deductible(car)).toBe(lira(720_000));
  });

  it("does not deduct the same money twice", () => {
    // The mistake: gross off the income tax base and the VAT reclaimed as well.
    const line = expense({ net: lira(10_000), kdvRate: 0.2 });
    const doubled = line.net + kdvOf(line) + reclaimableKdv(line);
    expect(deductible(line) + reclaimableKdv(line)).toBe(lira(12_000));
    expect(doubled).toBe(lira(14_000));
  });

  it("carries no Turkish VAT when the supplier is abroad", () => {
    const foreign = expense({ net: lira(5_000), kdvRate: 0 });
    expect(kdvOf(foreign)).toBe(0);
    expect(deductible(foreign)).toBe(lira(5_000));
  });
});

describe("the monthly return", () => {
  const march: VatMonth = { month: "2026-03", collected: lira(40_000), deductible: lira(6_000) };

  it("pays the difference between the two sides", () => {
    const [filing] = vatReturns([march]);
    expect(filing.payable).toBe(lira(34_000));
    expect(filing.carriedOut).toBe(0);
  });

  it("never refunds, and carries the excess instead", () => {
    const [filing] = vatReturns([
      { month: "2026-01", collected: lira(4_000), deductible: lira(15_000) },
    ]);
    expect(filing.payable).toBe(0);
    expect(filing.carriedOut).toBe(lira(11_000));
  });

  it("offsets the carried credit against the next month", () => {
    const filings = vatReturns([
      { month: "2026-01", collected: lira(4_000), deductible: lira(15_000) },
      { month: "2026-02", collected: lira(30_000), deductible: lira(5_000) },
    ]);
    expect(filings[1].carriedIn).toBe(lira(11_000));
    expect(filings[1].payable).toBe(lira(14_000));
    expect(filings[1].carriedOut).toBe(0);
  });

  it("keeps carrying while the credit is bigger than the month", () => {
    const filings = vatReturns([
      { month: "2026-01", collected: 0, deductible: lira(30_000) },
      { month: "2026-02", collected: lira(8_000), deductible: 0 },
      { month: "2026-03", collected: lira(8_000), deductible: 0 },
    ]);
    expect(filings.map((f) => f.payable)).toEqual([0, 0, 0]);
    expect(filings.map((f) => f.carriedOut)).toEqual([lira(30_000), lira(22_000), lira(14_000)]);
  });

  it("processes months in order even when handed them shuffled", () => {
    const shuffled = vatReturns([
      { month: "2026-02", collected: lira(30_000), deductible: lira(5_000) },
      { month: "2026-01", collected: lira(4_000), deductible: lira(15_000) },
    ]);
    expect(shuffled.map((f) => f.month)).toEqual(["2026-01", "2026-02"]);
    expect(shuffled[1].payable).toBe(lira(14_000));
  });

  it("accepts an opening credit from the previous year", () => {
    const [filing] = vatReturns([march], lira(50_000));
    expect(filing.payable).toBe(0);
    expect(filing.carriedOut).toBe(lira(16_000));
  });

  it("is due on the 28th of the following month, across a year end", () => {
    expect(filingDay("2026-03")).toBe("2026-04-28");
    expect(filingDay("2026-12")).toBe("2027-01-28");
  });

  it("reports what is still ahead of today", () => {
    const filings = vatReturns([march, { month: "2026-04", collected: lira(20_000), deductible: 0 }]);
    expect(upcomingVat(filings, "2026-04-20").map((f) => f.month)).toEqual(["2026-03", "2026-04"]);
    expect(upcomingVat(filings, "2026-05-01").map((f) => f.month)).toEqual(["2026-04"]);
  });

  it("totals the year and reports the credit still on the account", () => {
    const totals = vatTotals(
      vatReturns([
        { month: "2026-01", collected: lira(4_000), deductible: lira(15_000) },
        { month: "2026-02", collected: lira(1_000), deductible: 0 },
      ]),
    );
    expect(totals.collected).toBe(lira(5_000));
    expect(totals.deductible).toBe(lira(15_000));
    expect(totals.paid).toBe(0);
    expect(totals.carried).toBe(lira(10_000));
  });

  it("is all zeroes for a year with no months", () => {
    expect(vatTotals([])).toEqual({ collected: 0, deductible: 0, paid: 0, carried: 0 });
  });
});

describe("grouping", () => {
  it("books reclaimable VAT into the month the expense fell in", () => {
    const months = deductibleByMonth([
      expense({ id: "a", day: "2026-01-31", net: lira(1_000) }),
      expense({ id: "b", day: "2026-02-01", net: lira(2_000) }),
      expense({ id: "c", day: "2026-02-28", net: lira(3_000) }),
    ]);
    expect(months.get("2026-01")).toBe(lira(200));
    expect(months.get("2026-02")).toBe(lira(1_000));
  });

  it("leaves an unreclaimable line out of the return entirely", () => {
    const months = deductibleByMonth([
      expense({ day: "2026-05-04", net: lira(600_000), reclaimable: false }),
    ]);
    expect(months.get("2026-05")).toBe(0);
  });
});

describe("the 2026 book", () => {
  it("deducts the expense ledger, not a rounded yearly guess", () => {
    expect(expensesToDate).toBe(deductibleTotal(expenses));
    expect(reclaimableTotal(expenses)).toBe(lira(27_540));
  });

  it("carries a credit out of January, when the equipment was bought", () => {
    const january = vatFilings.find((filing) => filing.month === "2026-01")!;
    expect(january.deductible).toBeGreaterThan(january.collected);
    expect(january.payable).toBe(0);
    expect(january.carriedOut).toBeGreaterThan(0);
  });

  it("spends that credit in February rather than holding it", () => {
    const february = vatFilings.find((filing) => filing.month === "2026-02")!;
    const january = vatFilings.find((filing) => filing.month === "2026-01")!;
    expect(february.carriedIn).toBe(january.carriedOut);
    expect(february.payable).toBeGreaterThan(0);
    expect(february.carriedOut).toBe(0);
  });

  it("pays no more VAT than it charged", () => {
    expect(vat.paid).toBeLessThanOrEqual(vat.collected);
    expect(vat.paid).toBe(vat.collected - vat.deductible + vat.carried);
  });

  it("loads the quarter that actually carried the equipment purchase", () => {
    // Q1 holds both one-off purchases, so the cumulative expense is far more
    // than a quarter of the year. An evenly spread total would have hidden that.
    const [q1] = periods;
    expect(q1.cumulativeExpenses).toBeGreaterThan(expensesToDate / 2);
  });

  it("keeps the quarterly expense figures cumulative", () => {
    const cumulative = periods.map((period) => period.cumulativeExpenses);
    expect(cumulative[0]).toBeLessThan(cumulative[1]);
    expect(cumulative[1]).toBeLessThan(cumulative[2]);
    expect(cumulative[2]).toBeLessThanOrEqual(expensesToDate);
  });
});
