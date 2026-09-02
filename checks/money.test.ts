import { describe, expect, it } from "vitest";
import { applyRate, lira, roundHalfUp, share, split, sum } from "@/kit/money";

describe("lira to kurus", () => {
  it("converts whole and fractional lira", () => {
    expect(lira(1)).toBe(100);
    expect(lira(1234.56)).toBe(123456);
  });

  it("survives the amounts that break float arithmetic", () => {
    // 0.1 + 0.2 is the canonical example; in kurus it is just 10 + 20.
    expect(lira(0.1) + lira(0.2)).toBe(lira(0.3));
    expect(lira(19.99) * 3).toBe(lira(59.97));
  });
});

describe("applyRate", () => {
  it("computes VAT exactly", () => {
    expect(applyRate(lira(1234.56), 0.2)).toBe(lira(246.912 - 0.002));
    expect(applyRate(lira(1234.56), 0.2)).toBe(24691);
  });

  it("rounds half away from zero, in both directions", () => {
    expect(roundHalfUp(0.5)).toBe(1);
    expect(roundHalfUp(1.5)).toBe(2);
    expect(roundHalfUp(-0.5)).toBe(-1);
    // Math.round(-0.5) is -0, which would make a credit note a kurus light.
    expect(roundHalfUp(-1.5)).toBe(-2);
  });

  it("does not lose a kurus to a binary representation just under .5", () => {
    // 1050 * 0.15 is 157.49999999999997 in IEEE 754, not 157.5.
    expect(applyRate(1050, 0.15)).toBe(158);
  });
});

describe("split", () => {
  it("always adds back up to the original amount", () => {
    for (const [amount, parts] of [[100, 3], [10_000, 7], [1, 4], [99_999, 12]] as const) {
      const shares = split(amount, parts);
      expect(shares).toHaveLength(parts);
      expect(sum(shares)).toBe(amount);
    }
  });

  it("hands the remainder to the earliest shares", () => {
    expect(split(100, 3)).toEqual([34, 33, 33]);
  });

  it("splits a negative amount without inventing a kurus", () => {
    expect(sum(split(-100, 3))).toBe(-100);
    expect(split(-100, 3)).toEqual([-34, -33, -33]);
  });

  it("returns nothing for a non-positive number of parts", () => {
    expect(split(100, 0)).toEqual([]);
  });
});

describe("share", () => {
  it("is zero rather than NaN when the whole is zero", () => {
    expect(share(0, 0)).toBe(0);
  });

  it("reports one decimal place", () => {
    expect(share(1, 3)).toBe(33.3);
    expect(share(50, 200)).toBe(25);
  });
});
