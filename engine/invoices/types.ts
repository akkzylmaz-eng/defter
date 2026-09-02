import type { Kurus } from "@/kit/money";
import type { Day } from "@/kit/dates";
import type { Rates } from "@/engine/makbuz/receipt";

export type Bilingual = { tr: string; en: string };

export interface Invoice {
  id: string;
  /** Receipt serial, as printed on the document. */
  serial: string;
  clientId: string;
  description: Bilingual;
  /** The fee before withholding and VAT. */
  brut: Kurus;
  rates: Rates;
  issuedOn: Day;
  dueOn: Day;
  /** The day the money arrived, or null while outstanding. */
  paidOn: Day | null;
  /** Not yet issued: excluded from every tax and ageing figure. */
  draft?: boolean;
}

export type InvoiceState = "draft" | "outstanding" | "overdue" | "paid" | "paid-late";

export const STATE_LABEL: Record<InvoiceState, Bilingual> = {
  draft: { tr: "Taslak", en: "Draft" },
  outstanding: { tr: "Bekliyor", en: "Outstanding" },
  overdue: { tr: "Gecikti", en: "Overdue" },
  paid: { tr: "Ödendi", en: "Paid" },
  "paid-late": { tr: "Geç ödendi", en: "Paid late" },
};
