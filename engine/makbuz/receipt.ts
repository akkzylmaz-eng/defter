import { applyRate, type Kurus } from "@/kit/money";

/**
 * The serbest meslek makbuzu.
 *
 * A Turkish freelancer's receipt carries two rates pulling in opposite
 * directions. Withholding (stopaj) is deducted from the fee and paid to the
 * state by the client on the freelancer's behalf; VAT (KDV) is added on top
 * and collected from the client. At the current 20% and 20% they cancel out
 * exactly, so the amount that lands in the bank equals the gross fee, which is
 * why so many freelancers believe stopaj is not real money. It is: it has
 * already been paid against a tax bill that has not been calculated yet, and
 * `engine/tax` is where it comes back as a credit.
 *
 * Not every client withholds. A private individual, or a client abroad, pays
 * the fee with no stopaj at all, so withholding is a property of the receipt
 * rather than a constant.
 */

export interface Rates {
  /** Withholding on the fee. 0.20 for most corporate clients, 0 for none. */
  stopaj: number;
  /** VAT added on top of the fee. */
  kdv: number;
}

export const DEFAULT_RATES: Rates = { stopaj: 0.2, kdv: 0.2 };
export const NO_WITHHOLDING: Rates = { stopaj: 0, kdv: 0.2 };
/** Services exported abroad carry neither withholding nor Turkish VAT. */
export const EXPORT_RATES: Rates = { stopaj: 0, kdv: 0 };

export interface Receipt {
  /** The fee before anything is added or taken off. */
  brut: Kurus;
  stopaj: Kurus;
  kdv: Kurus;
  /** Fee less withholding: what the work actually earned, VAT aside. */
  net: Kurus;
  /** What the client transfers: brut - stopaj + kdv. */
  tahsil: Kurus;
}

/**
 * Build a receipt from the gross fee.
 *
 * Each component is rounded once, from the gross, and `tahsil` is then derived
 * by addition rather than rounded separately. Rounding it independently would
 * let the receipt disagree with its own lines by a kuruş, which is exactly the
 * error that makes a bookkeeper reject the document.
 */
export function fromGross(brut: Kurus, rates: Rates = DEFAULT_RATES): Receipt {
  const stopaj = applyRate(brut, rates.stopaj);
  const kdv = applyRate(brut, rates.kdv);
  const net = brut - stopaj;
  return { brut, stopaj, kdv, net, tahsil: net + kdv };
}

/**
 * Work backwards from the fee the freelancer wants to keep.
 *
 * "I need 40.000 TL in hand for this job" is the question people actually ask,
 * and dividing by (1 - stopaj) is the only correct answer. Multiplying the
 * target by 1.20 instead, which is the common shortcut, undershoots: 20% off a
 * larger number is more than 20% of the smaller one.
 */
export function fromNet(net: Kurus, rates: Rates = DEFAULT_RATES): Receipt {
  if (rates.stopaj >= 1) throw new RangeError("stopaj rate must be below 1");
  const brut = Math.round(net / (1 - rates.stopaj));
  return fromGross(brut, rates);
}

/** Totals across a set of receipts, used for the tax year and the dashboard. */
export interface ReceiptTotals {
  brut: Kurus;
  stopaj: Kurus;
  kdv: Kurus;
  net: Kurus;
  tahsil: Kurus;
  count: number;
}

export function totalReceipts(receipts: readonly Receipt[]): ReceiptTotals {
  return receipts.reduce<ReceiptTotals>(
    (total, receipt) => ({
      brut: total.brut + receipt.brut,
      stopaj: total.stopaj + receipt.stopaj,
      kdv: total.kdv + receipt.kdv,
      net: total.net + receipt.net,
      tahsil: total.tahsil + receipt.tahsil,
      count: total.count + 1,
    }),
    { brut: 0, stopaj: 0, kdv: 0, net: 0, tahsil: 0, count: 0 },
  );
}
