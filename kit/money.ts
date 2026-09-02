/**
 * Money is kuruş.
 *
 * Every amount in Defter is an integer number of kuruş (1/100 TL), never a
 * float. This is not fussiness: a 20% VAT on 1.234,56 TL computed in floats
 * lands on 246.91200000000003, and an invoice that adds up to one kuruş off
 * is an invoice an accountant sends back. Integers make the arithmetic exact
 * and the rounding an explicit, testable decision instead of an accident.
 */

/** An integer number of kuruş. */
export type Kurus = number;

export const KURUS_PER_LIRA = 100;

/** Lira (possibly fractional) to kuruş, rounded half away from zero. */
export function lira(amount: number): Kurus {
  return roundHalfUp(amount * KURUS_PER_LIRA);
}

/**
 * Apply a rate to an amount and round to whole kuruş.
 *
 * Half away from zero, which is what Turkish invoicing does and what a person
 * checking the arithmetic by hand expects. JavaScript's `Math.round` rounds
 * half *up* on the number line, so it turns -0.5 into -0 rather than -1, and
 * a credit note would be a kuruş light.
 */
export function applyRate(amount: Kurus, rate: number): Kurus {
  return roundHalfUp(amount * rate);
}

export function roundHalfUp(value: number): Kurus {
  // Nudge by an epsilon proportional to the magnitude before rounding: the
  // product of a kuruş amount and a rate like 0.20 can land a hair below the
  // true .5 boundary in binary floating point (0.5 stored as 0.49999999999).
  const sign = value < 0 ? -1 : 1;
  const magnitude = Math.abs(value);
  return sign * Math.round(magnitude + Number.EPSILON * magnitude);
}

export function sum(amounts: readonly Kurus[]): Kurus {
  return amounts.reduce((total, amount) => total + amount, 0);
}

/**
 * Split an amount into `parts` shares that add back up to exactly the amount.
 *
 * The naive `Math.round(total / parts)` loses or invents kuruş: 100 kuruş over
 * three ways is 33.33 each, and three roundings give 99 or 102. The remainder
 * is handed out one kuruş at a time to the earliest shares instead.
 */
export function split(amount: Kurus, parts: number): Kurus[] {
  if (parts <= 0) return [];
  const base = Math.trunc(amount / parts);
  const remainder = amount - base * parts;
  const step = remainder < 0 ? -1 : 1;
  const shares = new Array<Kurus>(parts).fill(base);
  for (let i = 0; i < Math.abs(remainder); i += 1) shares[i] += step;
  return shares;
}

/** Share of `part` in `whole`, as a percentage. Zero whole gives zero. */
export function share(part: Kurus, whole: Kurus): number {
  if (whole === 0) return 0;
  return Math.round((part / whole) * 1000) / 10;
}
