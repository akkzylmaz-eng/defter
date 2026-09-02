import type { Client } from "@/engine/clients/book";

export const clients: Client[] = [
  {
    id: "torna",
    name: "Torna Yazılım A.Ş.",
    kind: "company",
    since: "2024-02-01",
    note: {
      tr: "En büyük müşteri. Ödemeleri düzenli ama vadeyi hep birkaç gün geçirir.",
      en: "The largest client. Pays reliably, always a few days past terms.",
    },
  },
  {
    id: "kavun",
    name: "Kavun Dijital",
    kind: "company",
    since: "2025-06-15",
    note: {
      tr: "Ajans. Kendi müşterisinden tahsil edince ödüyor, bu yüzden gecikme uzun.",
      en: "An agency. Pays once their own client pays, which is why the lag is long.",
    },
  },
  {
    id: "northwind",
    name: "Northwind Studio",
    kind: "abroad",
    since: "2025-11-03",
    note: {
      tr: "Yurt dışı. Stopaj ve KDV yok, ödeme vadesinden önce geliyor.",
      en: "Abroad. No withholding, no Turkish VAT, and pays ahead of terms.",
    },
  },
  {
    id: "bereket",
    name: "Bereket Yayıncılık",
    kind: "company",
    since: "2026-01-20",
    note: {
      tr: "Yeni müşteri. Şimdiye kadar her faturayı gününde ödedi.",
      en: "A new client. Every invoice paid on the day so far.",
    },
  },
  {
    id: "aksu",
    name: "Selin Aksu",
    kind: "individual",
    since: "2026-03-02",
    note: {
      tr: "Şahıs müşteri: stopaj kesmez, KDV eklenir. Ödemesi yavaş.",
      en: "An individual: no withholding, VAT still applies. Slow to pay.",
    },
  },
];
