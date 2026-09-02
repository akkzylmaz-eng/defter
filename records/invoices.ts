import { lira } from "@/kit/money";
import { DEFAULT_RATES, EXPORT_RATES, NO_WITHHOLDING } from "@/engine/makbuz/receipt";
import type { Invoice } from "@/engine/invoices/types";

/**
 * The receipt book for 2026, frozen at 19 July.
 *
 * Chosen so every view has something true to show: one invoice more than
 * ninety days late, one client whose four settled invoices all landed twelve
 * days past terms (which is what the projection learns from), an exported
 * service with neither withholding nor VAT, an individual client who does not
 * withhold, and one draft that must stay out of every tax figure.
 */
export const invoices: Invoice[] = [
  // ── Torna: the anchor client, always a few days late ────────────────────
  {
    id: "inv-2601", serial: "2026/001", clientId: "torna",
    description: { tr: "Ocak tasarım sistemi bakımı", en: "January design system retainer" },
    brut: lira(72_000), rates: DEFAULT_RATES,
    issuedOn: "2026-01-30", dueOn: "2026-02-14", paidOn: "2026-02-26",
  },
  {
    id: "inv-2604", serial: "2026/004", clientId: "torna",
    description: { tr: "Şubat tasarım sistemi bakımı", en: "February design system retainer" },
    brut: lira(72_000), rates: DEFAULT_RATES,
    issuedOn: "2026-02-27", dueOn: "2026-03-14", paidOn: "2026-03-26",
  },
  {
    id: "inv-2608", serial: "2026/008", clientId: "torna",
    description: { tr: "Mart tasarım sistemi bakımı", en: "March design system retainer" },
    brut: lira(78_000), rates: DEFAULT_RATES,
    issuedOn: "2026-03-31", dueOn: "2026-04-15", paidOn: "2026-04-28",
  },
  {
    id: "inv-2612", serial: "2026/012", clientId: "torna",
    description: { tr: "Nisan-Mayıs mobil akış çalışması", en: "April to May mobile flow work" },
    brut: lira(164_000), rates: DEFAULT_RATES,
    issuedOn: "2026-05-29", dueOn: "2026-06-13", paidOn: "2026-06-25",
  },
  {
    id: "inv-2617", serial: "2026/017", clientId: "torna",
    description: { tr: "Haziran tasarım sistemi bakımı", en: "June design system retainer" },
    brut: lira(78_000), rates: DEFAULT_RATES,
    issuedOn: "2026-06-30", dueOn: "2026-07-15", paidOn: null,
  },

  // ── Kavun: the agency that pays when its own client pays ─────────────────
  {
    id: "inv-2602", serial: "2026/002", clientId: "kavun",
    description: { tr: "Kampanya açılış sayfası", en: "Campaign landing page" },
    brut: lira(46_000), rates: DEFAULT_RATES,
    issuedOn: "2026-02-05", dueOn: "2026-02-20", paidOn: "2026-04-02",
  },
  {
    id: "inv-2609", serial: "2026/009", clientId: "kavun",
    description: { tr: "E-ticaret ödeme akışı", en: "Checkout flow rework" },
    brut: lira(88_000), rates: DEFAULT_RATES,
    issuedOn: "2026-04-03", dueOn: "2026-04-18", paidOn: "2026-06-02",
  },
  {
    id: "inv-2614", serial: "2026/014", clientId: "kavun",
    description: { tr: "Marka sayfaları ikinci faz", en: "Brand pages, second phase" },
    brut: lira(64_000), rates: DEFAULT_RATES,
    issuedOn: "2026-04-10", dueOn: "2026-04-25", paidOn: null,
  },

  // ── Northwind: exported service, pays ahead of terms ─────────────────────
  {
    id: "inv-2605", serial: "2026/005", clientId: "northwind",
    description: { tr: "Ürün keşif atölyesi", en: "Product discovery workshop" },
    brut: lira(96_000), rates: EXPORT_RATES,
    issuedOn: "2026-03-06", dueOn: "2026-04-05", paidOn: "2026-03-30",
  },
  {
    id: "inv-2615", serial: "2026/015", clientId: "northwind",
    description: { tr: "Tasarım sistemi denetimi", en: "Design system audit" },
    brut: lira(118_000), rates: EXPORT_RATES,
    issuedOn: "2026-06-08", dueOn: "2026-07-08", paidOn: "2026-07-01",
  },

  // ── Bereket: new, and pays on the day ────────────────────────────────────
  {
    id: "inv-2606", serial: "2026/006", clientId: "bereket",
    description: { tr: "Okuma uygulaması arayüzü", en: "Reading app interface" },
    brut: lira(54_000), rates: DEFAULT_RATES,
    issuedOn: "2026-03-12", dueOn: "2026-03-27", paidOn: "2026-03-27",
  },
  {
    id: "inv-2613", serial: "2026/013", clientId: "bereket",
    description: { tr: "Abonelik akışı", en: "Subscription flow" },
    brut: lira(62_000), rates: DEFAULT_RATES,
    issuedOn: "2026-05-14", dueOn: "2026-05-29", paidOn: "2026-05-29",
  },
  {
    id: "inv-2618", serial: "2026/018", clientId: "bereket",
    description: { tr: "Yaz kampanyası sayfaları", en: "Summer campaign pages" },
    brut: lira(48_000), rates: DEFAULT_RATES,
    issuedOn: "2026-07-06", dueOn: "2026-07-21", paidOn: null,
  },

  // ── Aksu: an individual, so no withholding, and slow ─────────────────────
  {
    id: "inv-2607", serial: "2026/007", clientId: "aksu",
    description: { tr: "Mimarlık ofisi web sitesi", en: "Architecture studio website" },
    brut: lira(38_000), rates: NO_WITHHOLDING,
    issuedOn: "2026-03-20", dueOn: "2026-04-04", paidOn: "2026-05-20",
  },
  {
    id: "inv-2611", serial: "2026/011", clientId: "aksu",
    description: { tr: "Proje arşivi bölümü", en: "Project archive section" },
    brut: lira(26_000), rates: NO_WITHHOLDING,
    issuedOn: "2026-03-18", dueOn: "2026-04-02", paidOn: null,
  },

  // Issued in July with terms running into August: these are the two that
  // separate the learned projection from the naive one, because Torna takes
  // twelve days past terms and Kavun takes six weeks.
  {
    id: "inv-2619", serial: "2026/019", clientId: "torna",
    description: { tr: "Yaz sprinti, iki haftalık blok", en: "Summer sprint, a two-week block" },
    brut: lira(82_000), rates: DEFAULT_RATES,
    issuedOn: "2026-07-10", dueOn: "2026-08-25", paidOn: null,
  },
  {
    id: "inv-2620", serial: "2026/020", clientId: "kavun",
    description: { tr: "Yeni ürün açılışı", en: "New product launch" },
    brut: lira(96_000), rates: DEFAULT_RATES,
    issuedOn: "2026-07-14", dueOn: "2026-08-09", paidOn: null,
  },

  // ── Not issued: must stay out of every tax and ageing figure ─────────────
  {
    id: "inv-draft-1", serial: "-", clientId: "torna",
    description: { tr: "Temmuz tasarım sistemi bakımı", en: "July design system retainer" },
    brut: lira(78_000), rates: DEFAULT_RATES,
    issuedOn: "2026-07-31", dueOn: "2026-08-15", paidOn: null, draft: true,
  },
];
