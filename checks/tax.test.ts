import { describe, expect, it } from "vitest";
import { lira } from "@/kit/money";
import {
  effectiveRate,
  incomeTax,
  marginalRate,
  sliceByBand,
} from "@/engine/tax/brackets";
import { annualReturn, setAsideRate } from "@/engine/tax/annual";
import { schedule, totalAdvancePaid, upcoming } from "@/engine/tax/advance";

describe("incomeTax", () => {
  it("taxes only the slice inside each band", () => {
    // 200.000: 158.000 at 15% = 23.700, then 42.000 at 20% = 8.400.
    expect(incomeTax(lira(200_000))).toBe(lira(32_100));
  });

  it("is not the flat-lookup answer", () => {
    // The bug this module exists to prevent: 200.000 x 20% = 40.000.
    expect(incomeTax(lira(200_000))).toBeLessThan(lira(40_000));
  });

  it("is exact at a band boundary", () => {
    expect(incomeTax(lira(158_000))).toBe(lira(23_700));
    expect(incomeTax(lira(330_000))).toBe(lira(23_700 + 34_400));
  });

  it("never creates a cliff: one more lira never costs more than one lira", () => {
    for (const boundary of [158_000, 330_000, 800_000, 4_300_000]) {
      const before = incomeTax(lira(boundary));
      const after = incomeTax(lira(boundary) + 100);
      expect(after - before).toBeLessThanOrEqual(100);
      expect(after).toBeGreaterThanOrEqual(before);
    }
  });

  it("is monotonic across the whole range", () => {
    let previous = 0;
    for (let amount = 0; amount <= 5_000_000; amount += 25_000) {
      const tax = incomeTax(lira(amount));
      expect(tax).toBeGreaterThanOrEqual(previous);
      previous = tax;
    }
  });

  it("is zero at or below zero income", () => {
    expect(incomeTax(0)).toBe(0);
    expect(incomeTax(lira(-5_000))).toBe(0);
  });

  it("reaches the top band", () => {
    expect(sliceByBand(lira(5_000_000)).at(-1)!.band.rate).toBe(0.4);
  });
});

describe("rates", () => {
  it("reports the marginal rate of the next lira", () => {
    expect(marginalRate(lira(100_000))).toBe(0.15);
    expect(marginalRate(lira(158_000))).toBe(0.2);
    expect(marginalRate(lira(5_000_000))).toBe(0.4);
  });

  it("keeps the effective rate below the marginal rate", () => {
    for (const amount of [200_000, 500_000, 1_000_000, 6_000_000]) {
      expect(effectiveRate(lira(amount)) / 100).toBeLessThan(marginalRate(lira(amount)));
    }
  });

  it("has an effective rate of zero on no income", () => {
    expect(effectiveRate(0)).toBe(0);
  });
});

describe("annualReturn", () => {
  it("credits withholding against the bill", () => {
    const result = annualReturn({
      gross: lira(400_000),
      expenses: lira(70_000),
      withheld: lira(80_000),
      advancePaid: 0,
    });
    expect(result.base).toBe(lira(330_000));
    expect(result.tax).toBe(lira(58_100));
    expect(result.balance).toBe(lira(58_100 - 80_000));
    expect(result.refundable).toBe(true);
  });

  it("returns a refund rather than clamping at zero", () => {
    // A full year of 20%-withholding clients on income taxed at 15% overpays.
    const result = annualReturn({
      gross: lira(150_000),
      expenses: 0,
      withheld: lira(30_000),
      advancePaid: 0,
    });
    expect(result.tax).toBe(lira(22_500));
    expect(result.balance).toBe(lira(-7_500));
    expect(result.refundable).toBe(true);
  });

  it("floors the base at zero in a loss-making year", () => {
    const result = annualReturn({
      gross: lira(50_000),
      expenses: lira(90_000),
      withheld: lira(10_000),
      advancePaid: 0,
    });
    expect(result.base).toBe(0);
    expect(result.tax).toBe(0);
    expect(result.balance).toBe(lira(-10_000));
  });

  it("counts advance instalments as credits too", () => {
    const withAdvance = annualReturn({
      gross: lira(600_000), expenses: 0, withheld: 0, advancePaid: lira(50_000),
    });
    const without = annualReturn({
      gross: lira(600_000), expenses: 0, withheld: 0, advancePaid: 0,
    });
    expect(without.balance - withAdvance.balance).toBe(lira(50_000));
  });
});

describe("setAsideRate", () => {
  it("is the gap between the marginal rate and what is already withheld", () => {
    expect(setAsideRate(lira(400_000), 0.2)).toBeCloseTo(0.07, 5);
    expect(setAsideRate(lira(1_000_000), 0.2)).toBeCloseTo(0.15, 5);
  });

  it("is zero when withholding already covers the marginal rate", () => {
    // Income inside the 15% band, with 20% withheld at source.
    expect(setAsideRate(lira(100_000), 0.2)).toBe(0);
  });
});

const PERIODS = [
  { quarter: 1 as const, cumulativeGross: lira(150_000), cumulativeExpenses: lira(30_000), cumulativeWithheld: lira(30_000), dueOn: "2026-05-17" },
  { quarter: 2 as const, cumulativeGross: lira(500_000), cumulativeExpenses: lira(60_000), cumulativeWithheld: lira(100_000), dueOn: "2026-08-17" },
  { quarter: 3 as const, cumulativeGross: lira(700_000), cumulativeExpenses: lira(90_000), cumulativeWithheld: lira(140_000), dueOn: "2026-11-17" },
];

describe("advance tax", () => {
  it("is cumulative, not per quarter", () => {
    const [q1, q2] = schedule(PERIODS);
    // Q2's base is the half-year, not April to June.
    expect(q1.base).toBe(lira(120_000));
    expect(q2.base).toBe(lira(440_000));
  });

  it("credits withholding and everything already paid", () => {
    const [q1, q2, q3] = schedule(PERIODS);
    expect(q1.payable).toBe(0); // 18.000 tax against 30.000 withheld.
    expect(q2.cumulativeTax).toBe(lira(66_000));
    expect(q2.credits).toBe(lira(100_000) + q1.payable);
    expect(q3.credits).toBe(lira(140_000) + q1.payable + q2.payable);
  });

  it("never refunds within a quarter, and reports the credit carried instead", () => {
    const [q1] = schedule(PERIODS);
    expect(q1.payable).toBe(0);
    expect(q1.carried).toBe(lira(30_000 - 18_000));
  });

  it("charges the quarter when income outruns withholding", () => {
    const [q1] = schedule([
      { quarter: 1, cumulativeGross: lira(400_000), cumulativeExpenses: 0, cumulativeWithheld: 0, dueOn: "2026-05-17" },
    ]);
    expect(q1.payable).toBe(lira(60_000));
  });

  it("processes quarters in order even when handed them shuffled", () => {
    const shuffled = schedule([PERIODS[2], PERIODS[0], PERIODS[1]]);
    expect(shuffled.map((i) => i.quarter)).toEqual([1, 2, 3]);
    expect(shuffled).toEqual(schedule(PERIODS));
  });

  it("splits instalments into paid and upcoming by date", () => {
    const instalments = schedule([
      { quarter: 1, cumulativeGross: lira(400_000), cumulativeExpenses: 0, cumulativeWithheld: 0, dueOn: "2026-05-17" },
      { quarter: 2, cumulativeGross: lira(800_000), cumulativeExpenses: 0, cumulativeWithheld: 0, dueOn: "2026-08-17" },
    ]);
    expect(totalAdvancePaid(instalments, "2026-07-01")).toBe(lira(60_000));
    expect(upcoming(instalments, "2026-07-01").map((i) => i.quarter)).toEqual([2]);
  });
});
