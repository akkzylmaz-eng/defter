import { describe, expect, it } from "vitest";
import { lira } from "@/kit/money";
import { DEFAULT_RATES } from "@/engine/makbuz/receipt";
import type { Invoice } from "@/engine/invoices/types";
import {
  ageing,
  bucketOf,
  daysOverdue,
  daysToPayment,
  onTimeRate,
  outstanding,
  receivables,
  stateOf,
} from "@/engine/invoices/ledger";
import { accrued, lateInterest } from "@/engine/invoices/interest";
import { invoices } from "@/records/invoices";
import { TODAY } from "@/records/workspace";

function make(overrides: Partial<Invoice> = {}): Invoice {
  return {
    id: "x", serial: "x", clientId: "c",
    description: { tr: "x", en: "x" },
    brut: lira(10_000), rates: DEFAULT_RATES,
    issuedOn: "2026-01-01", dueOn: "2026-01-31", paidOn: null,
    ...overrides,
  };
}

describe("stateOf", () => {
  it("derives every state from the dates alone", () => {
    expect(stateOf(make({ draft: true }), "2026-06-01")).toBe("draft");
    expect(stateOf(make(), "2026-01-15")).toBe("outstanding");
    expect(stateOf(make(), "2026-02-15")).toBe("overdue");
    expect(stateOf(make({ paidOn: "2026-01-20" }), "2026-06-01")).toBe("paid");
    expect(stateOf(make({ paidOn: "2026-02-20" }), "2026-06-01")).toBe("paid-late");
  });

  it("is not overdue on the due date itself", () => {
    expect(stateOf(make(), "2026-01-31")).toBe("outstanding");
    expect(stateOf(make(), "2026-02-01")).toBe("overdue");
  });

  it("counts a payment on the due date as on time", () => {
    expect(stateOf(make({ paidOn: "2026-01-31" }), "2026-06-01")).toBe("paid");
  });
});

describe("ageing buckets", () => {
  it("puts each boundary in the lower bucket", () => {
    expect(bucketOf(0)).toBe("current");
    expect(bucketOf(1)).toBe("d1_30");
    expect(bucketOf(30)).toBe("d1_30");
    expect(bucketOf(31)).toBe("d31_60");
    expect(bucketOf(60)).toBe("d31_60");
    expect(bucketOf(61)).toBe("d61_90");
    expect(bucketOf(90)).toBe("d61_90");
    expect(bucketOf(91)).toBe("d90_plus");
  });

  it("freezes the clock on a paid invoice", () => {
    const paidLate = make({ paidOn: "2026-02-10" });
    expect(daysOverdue(paidLate, "2026-12-01")).toBe(10);
  });

  it("never counts a draft as late", () => {
    expect(daysOverdue(make({ draft: true, dueOn: "2020-01-01" }), TODAY)).toBe(0);
  });

  it("leaves drafts and settled invoices out of the receivables ageing", () => {
    const rows = ageing(invoices, TODAY);
    const counted = rows.reduce((total, row) => total + row.count, 0);
    expect(counted).toBe(outstanding(invoices).length);
    expect(invoices.some((invoice) => invoice.draft)).toBe(true);
  });

  it("finds the invoice that is more than ninety days late", () => {
    const rows = ageing(invoices, TODAY);
    expect(rows.find((row) => row.bucket === "d90_plus")!.count).toBeGreaterThan(0);
  });

  it("adds up to the total receivables", () => {
    const rows = ageing(invoices, TODAY);
    expect(rows.reduce((total, row) => total + row.amount, 0)).toBe(receivables(invoices));
  });
});

describe("payment behaviour", () => {
  it("uses the median days to payment, not the mean", () => {
    const sample = [
      make({ issuedOn: "2026-01-01", paidOn: "2026-01-31" }),
      make({ issuedOn: "2026-01-01", paidOn: "2026-02-01" }),
      make({ issuedOn: "2026-01-01", paidOn: "2026-02-02" }),
      make({ issuedOn: "2026-01-01", paidOn: "2026-08-01" }),
    ];
    // Mean would be 76 days; the median describes what normally happens.
    expect(daysToPayment(sample)).toBe(31.5);
  });

  it("is zero when nothing has been settled yet", () => {
    expect(daysToPayment([make()])).toBe(0);
    expect(onTimeRate([make()])).toBe(0);
  });

  it("measures on-time against the due date", () => {
    const sample = [
      make({ paidOn: "2026-01-31" }),
      make({ paidOn: "2026-02-05" }),
      make({ paidOn: "2026-01-10" }),
      make({ paidOn: "2026-03-01" }),
    ];
    expect(onTimeRate(sample)).toBe(50);
  });
});

describe("late interest", () => {
  it("charges nothing on an invoice paid on its due date", () => {
    expect(lateInterest(make({ paidOn: "2026-01-31" }), TODAY, 0.48).amount).toBe(0);
  });

  it("charges simple interest per day on the collectable amount", () => {
    // 10.000 collected, 100 days at 48% a year: 10.000 x 0.48 x 100 / 365.
    const interest = lateInterest(make({ paidOn: "2026-05-11" }), TODAY, 0.48);
    expect(interest.days).toBe(100);
    expect(interest.principal).toBe(lira(10_000));
    expect(interest.amount).toBe(lira(10_000 * 0.48 * 100 / 365).valueOf());
    expect(interest.claim).toBe(interest.principal + interest.amount);
  });

  it("does not compound: twice the days is exactly twice the interest", () => {
    const hundred = lateInterest(make({ paidOn: "2026-05-11" }), TODAY, 0.48).amount;
    const twoHundred = lateInterest(make({ paidOn: "2026-08-19" }), TODAY, 0.48).amount;
    expect(Math.abs(twoHundred - hundred * 2)).toBeLessThanOrEqual(1);
  });

  it("keeps accruing while an invoice stays unpaid", () => {
    const invoice = make();
    const earlier = lateInterest(invoice, "2026-03-01", 0.48).amount;
    const later = lateInterest(invoice, "2026-06-01", 0.48).amount;
    expect(later).toBeGreaterThan(earlier);
  });

  it("ignores drafts when accruing across the book", () => {
    const withDraft = accrued([...invoices, make({ draft: true, dueOn: "2020-01-01" })], TODAY, 0.48);
    expect(withDraft).toBe(accrued(invoices, TODAY, 0.48));
  });
});
