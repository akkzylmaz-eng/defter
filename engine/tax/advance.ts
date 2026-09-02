import type { Kurus } from "@/kit/money";
import { roundHalfUp } from "@/kit/money";
import type { Day } from "@/kit/dates";

/**
 * Geçici vergi: the quarterly advance instalments.
 *
 * The rule that catches people out is that each quarter is **cumulative**, not
 * standalone. Q2 is calculated on income from January to June and then reduced
 * by everything already paid, rather than on April-to-June alone. Treating the
 * quarters as independent gets the right answer only when income is flat, and
 * a freelancer's income is never flat: one large invoice in March and the
 * standalone version underpays every remaining quarter of the year.
 *
 * The fourth quarter has no instalment. It is settled in the annual return.
 */

export const ADVANCE_RATE = 0.15;

export interface Period {
  quarter: 1 | 2 | 3;
  /** Cumulative gross fees from the start of the year to the end of this quarter. */
  cumulativeGross: Kurus;
  cumulativeExpenses: Kurus;
  /** Cumulative withholding to the end of this quarter. */
  cumulativeWithheld: Kurus;
  dueOn: Day;
}

export interface Instalment {
  quarter: 1 | 2 | 3;
  base: Kurus;
  /** Tax on the cumulative base at the advance rate. */
  cumulativeTax: Kurus;
  /** Withholding plus earlier instalments. */
  credits: Kurus;
  /** What is actually payable this quarter; never negative. */
  payable: Kurus;
  /** Credit carried into the next quarter when this one nets out to nothing. */
  carried: Kurus;
  dueOn: Day;
}

export function schedule(periods: readonly Period[]): Instalment[] {
  const instalments: Instalment[] = [];
  let paidSoFar = 0;

  for (const period of [...periods].sort((a, b) => a.quarter - b.quarter)) {
    const base = Math.max(0, period.cumulativeGross - period.cumulativeExpenses);
    const cumulativeTax = roundHalfUp(base * ADVANCE_RATE);
    const credits = period.cumulativeWithheld + paidSoFar;
    const balance = cumulativeTax - credits;

    // A quarter never refunds. An excess credit stays on the account and is
    // offset against the next quarter, which is what `credits` picks up again
    // through the cumulative figures.
    const payable = Math.max(0, balance);
    instalments.push({
      quarter: period.quarter,
      base,
      cumulativeTax,
      credits,
      payable,
      carried: balance < 0 ? -balance : 0,
      dueOn: period.dueOn,
    });
    paidSoFar += payable;
  }

  return instalments;
}

/** Instalments still ahead of `today`, in due order: the cash-flow view. */
export function upcoming(instalments: readonly Instalment[], today: Day): Instalment[] {
  return instalments
    .filter((instalment) => instalment.dueOn >= today && instalment.payable > 0)
    .sort((a, b) => a.dueOn.localeCompare(b.dueOn));
}

export function totalAdvancePaid(instalments: readonly Instalment[], today: Day): Kurus {
  return instalments
    .filter((instalment) => instalment.dueOn < today)
    .reduce((total, instalment) => total + instalment.payable, 0);
}
