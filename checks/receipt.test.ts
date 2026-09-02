import { describe, expect, it } from "vitest";
import { lira } from "@/kit/money";
import {
  DEFAULT_RATES,
  EXPORT_RATES,
  NO_WITHHOLDING,
  fromGross,
  fromNet,
  totalReceipts,
} from "@/engine/makbuz/receipt";

describe("fromGross", () => {
  it("computes the four lines of a standard receipt", () => {
    const receipt = fromGross(lira(10_000));
    expect(receipt.brut).toBe(lira(10_000));
    expect(receipt.stopaj).toBe(lira(2_000));
    expect(receipt.kdv).toBe(lira(2_000));
    expect(receipt.net).toBe(lira(8_000));
    expect(receipt.tahsil).toBe(lira(10_000));
  });

  it("collects exactly the gross fee when both rates are 20%", () => {
    // The coincidence that convinces freelancers stopaj is not real money.
    for (const amount of [1, 999.99, 12_345.67, 1_000_000]) {
      const receipt = fromGross(lira(amount));
      expect(receipt.tahsil).toBe(lira(amount));
    }
  });

  it("keeps the lines internally consistent under rounding", () => {
    // An amount whose 20% does not land on a whole kurus.
    const receipt = fromGross(lira(1_234.57));
    expect(receipt.net).toBe(receipt.brut - receipt.stopaj);
    expect(receipt.tahsil).toBe(receipt.net + receipt.kdv);
  });

  it("handles a client that does not withhold", () => {
    const receipt = fromGross(lira(10_000), NO_WITHHOLDING);
    expect(receipt.stopaj).toBe(0);
    expect(receipt.net).toBe(lira(10_000));
    expect(receipt.tahsil).toBe(lira(12_000));
  });

  it("handles an exported service, which carries neither rate", () => {
    const receipt = fromGross(lira(10_000), EXPORT_RATES);
    expect(receipt.stopaj).toBe(0);
    expect(receipt.kdv).toBe(0);
    expect(receipt.tahsil).toBe(lira(10_000));
  });
});

describe("fromNet", () => {
  it("grosses up so the net comes out right", () => {
    const receipt = fromNet(lira(40_000));
    expect(receipt.brut).toBe(lira(50_000));
    expect(receipt.net).toBe(lira(40_000));
  });

  it("is not the same as adding the withholding rate to the net", () => {
    // The common shortcut: 40.000 x 1.20 = 48.000, which nets only 38.400.
    const shortcut = fromGross(lira(48_000));
    expect(shortcut.net).toBe(lira(38_400));
    expect(shortcut.net).toBeLessThan(lira(40_000));
  });

  it("round-trips through fromGross within a kurus", () => {
    for (const target of [1_000, 33_333.33, 87_654.21]) {
      const receipt = fromNet(lira(target));
      expect(Math.abs(receipt.net - lira(target))).toBeLessThanOrEqual(1);
    }
  });

  it("is the identity when nothing is withheld", () => {
    expect(fromNet(lira(10_000), NO_WITHHOLDING).brut).toBe(lira(10_000));
  });

  it("refuses a withholding rate of 100% instead of dividing by zero", () => {
    expect(() => fromNet(lira(1), { stopaj: 1, kdv: 0.2 })).toThrow(RangeError);
  });

  it("rounds a credit note away from zero, like every other amount", () => {
    // -50 kurus grossed up is exactly -62,5. Math.round would give -62 and
    // leave the correction a kurus short of the receipt it reverses.
    expect(fromNet(-50).brut).toBe(-63);
    expect(fromNet(-50).net).toBe(-50);
  });

  it("reverses a receipt exactly", () => {
    for (const fee of [1_000, 33_333.33, 87_654.21]) {
      const original = fromGross(lira(fee));
      const credit = fromGross(-lira(fee));
      expect(credit.brut + original.brut).toBe(0);
      expect(credit.stopaj + original.stopaj).toBe(0);
      expect(credit.kdv + original.kdv).toBe(0);
      expect(credit.tahsil + original.tahsil).toBe(0);
    }
  });
});

describe("totalReceipts", () => {
  it("adds every line across a set", () => {
    const totals = totalReceipts([
      fromGross(lira(10_000), DEFAULT_RATES),
      fromGross(lira(5_000), NO_WITHHOLDING),
    ]);
    expect(totals.brut).toBe(lira(15_000));
    expect(totals.stopaj).toBe(lira(2_000));
    expect(totals.kdv).toBe(lira(3_000));
    expect(totals.count).toBe(2);
  });

  it("is all zeroes for an empty set", () => {
    expect(totalReceipts([])).toEqual({
      brut: 0, stopaj: 0, kdv: 0, net: 0, tahsil: 0, count: 0,
    });
  });
});
