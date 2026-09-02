import { describe, expect, it } from "vitest";
import { lira } from "@/kit/money";
import { day, money, moneyShort, month, percent, rate } from "@/kit/display";

describe("money", () => {
  it("always shows kurus, because a ledger line without them is not a ledger line", () => {
    expect(money(lira(72_000), "tr")).toContain("72.000,00");
    expect(money(lira(0.05), "tr")).toContain("0,05");
  });

  it("uses the lira sign in both languages, never the three-letter code", () => {
    // en-GB renders TRY as "TRY" unless narrowSymbol is asked for, which puts
    // "TRY 150.00" and "₺" on the same screen meaning the same thing.
    expect(money(lira(150), "en")).toContain("₺");
    expect(money(lira(150), "en")).not.toContain("TRY");
    expect(money(lira(150), "tr")).toContain("₺");
  });

  it("formats negatives, which is what a refund looks like", () => {
    expect(money(-lira(7_500), "tr")).toContain("7.500,00");
    expect(money(-lira(7_500), "tr")).toMatch(/-|−/);
  });
});

describe("moneyShort", () => {
  it("scales to thousands and millions", () => {
    expect(moneyShort(lira(72_000), "en")).toBe("72.0K ₺");
    expect(moneyShort(lira(1_250_000), "en")).toBe("1.3M ₺");
    expect(moneyShort(lira(940), "en")).toBe("940 ₺");
  });

  it("drops the decimal once three digits are showing", () => {
    expect(moneyShort(lira(148_000), "en")).toBe("148K ₺");
  });
});

describe("percent and rate", () => {
  it("never prints a trailing zero decimal", () => {
    expect(percent(80, "en")).toBe("80%");
    expect(percent(80.04, "en")).toBe("80%");
    expect(percent(66.7, "tr")).toBe("66,7%");
  });

  it("puts the sign where each language puts it", () => {
    expect(rate(0.27, "tr")).toBe("%27");
    expect(rate(0.27, "en")).toBe("27%");
    expect(rate(0.155, "tr")).toBe("%15,5");
  });
});

describe("dates", () => {
  it("renders in UTC, so a due date never slips a day", () => {
    expect(day("2026-02-14", "en")).toBe("14 Feb 2026");
    expect(day("2026-01-01", "en")).toBe("1 Jan 2026");
    expect(day("2026-12-31", "en")).toBe("31 Dec 2026");
  });

  it("names a month from its key", () => {
    expect(month("2026-03", "en")).toBe("March 2026");
    expect(month("2026-03", "tr")).toBe("Mart 2026");
  });
});
