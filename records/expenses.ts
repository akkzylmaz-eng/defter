import { lira } from "@/kit/money";
import type { Expense } from "@/engine/kdv/vat";

/**
 * The expense book for 2026, frozen at 19 July alongside the receipts.
 *
 * Dated records rather than a running total, because the VAT return is monthly
 * and a total cannot be filed. The recurring lines repeat every month; the two
 * one-off purchases land in January and are what makes that month's reclaimable
 * VAT larger than the VAT charged to clients, so the book carries a credit into
 * February instead of asking for a refund it would not get.
 */

const MONTHS = ["01", "02", "03", "04", "05", "06", "07"] as const;

interface Recurring {
  key: string;
  day: string;
  category: Expense["category"];
  description: Expense["description"];
  net: number;
  kdvRate: number;
}

const RECURRING: Recurring[] = [
  {
    key: "desk",
    day: "05",
    category: "workspace",
    description: { tr: "Ortak çalışma alanı masa ücreti", en: "Coworking desk" },
    net: 7_000,
    kdvRate: 0.2,
  },
  {
    key: "accountant",
    day: "10",
    category: "professional",
    description: { tr: "Mali müşavir aylık ücreti", en: "Accountant monthly fee" },
    net: 2_600,
    kdvRate: 0.2,
  },
  {
    // Billed from abroad, so there is no Turkish VAT on the invoice to reclaim.
    // The reverse charge that applies to imported services is declared on a
    // separate return and is deliberately out of scope here.
    key: "software",
    day: "03",
    category: "software",
    description: { tr: "Yurt dışı yazılım abonelikleri", en: "Software subscriptions from abroad" },
    net: 1_600,
    kdvRate: 0,
  },
  {
    key: "line",
    day: "18",
    category: "communications",
    description: { tr: "Telefon ve internet", en: "Phone and internet" },
    net: 800,
    kdvRate: 0.2,
  },
];

const recurring: Expense[] = MONTHS.flatMap((month) =>
  RECURRING.map((item) => ({
    id: `exp-${item.key}-${month}`,
    day: `2026-${month}-${item.day}`,
    category: item.category,
    description: item.description,
    net: lira(item.net),
    kdvRate: item.kdvRate,
    reclaimable: true,
  })),
);

const oneOff: Expense[] = [
  {
    id: "exp-laptop",
    day: "2026-01-12",
    category: "equipment",
    description: { tr: "Dizüstü bilgisayar", en: "Laptop" },
    net: lira(44_900),
    kdvRate: 0.2,
    reclaimable: true,
  },
  {
    id: "exp-desk-setup",
    day: "2026-01-19",
    category: "equipment",
    description: { tr: "Monitör ve masa düzeni", en: "Monitor and desk setup" },
    net: lira(20_000),
    kdvRate: 0.2,
    reclaimable: true,
  },
];

export const expenses: Expense[] = [...recurring, ...oneOff].sort((a, b) =>
  a.day.localeCompare(b.day),
);
