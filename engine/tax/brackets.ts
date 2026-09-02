import { lira, roundHalfUp, type Kurus } from "@/kit/money";

/**
 * Progressive income tax.
 *
 * The mistake this module exists to prevent: looking up the band a total falls
 * into and multiplying the whole amount by that band's rate. Turkish income tax
 * is marginal, so only the slice of income inside a band is taxed at its rate.
 * The flat-lookup version overstates the bill by tens of thousands of lira and,
 * worse, produces a cliff where earning one lira more costs you money.
 */

export interface Band {
  /** Upper limit of this band, or null for the top band. */
  upTo: Kurus | null;
  rate: number;
}

/** Bands for a tax year, ascending. */
export interface Schedule {
  year: number;
  bands: Band[];
}

/**
 * The 2026 schedule for self-employment income. The figures live here as data
 * rather than as constants inside a formula, so next year is a new entry
 * instead of a rewrite.
 */
export const SCHEDULE_2026: Schedule = {
  year: 2026,
  bands: [
    { upTo: lira(158_000), rate: 0.15 },
    { upTo: lira(330_000), rate: 0.20 },
    { upTo: lira(800_000), rate: 0.27 },
    { upTo: lira(4_300_000), rate: 0.35 },
    { upTo: null, rate: 0.40 },
  ],
};

export interface BandSlice {
  band: Band;
  /** Income falling inside this band. */
  taxable: Kurus;
  tax: Kurus;
}

/** The per-band breakdown, which is what makes the number explainable. */
export function sliceByBand(base: Kurus, schedule: Schedule = SCHEDULE_2026): BandSlice[] {
  if (base <= 0) return [];
  const slices: BandSlice[] = [];
  let floor = 0;

  for (const band of schedule.bands) {
    const ceiling = band.upTo ?? Infinity;
    const taxable = Math.min(base, ceiling) - floor;
    if (taxable <= 0) break;
    slices.push({ band, taxable, tax: roundHalfUp(taxable * band.rate) });
    floor = ceiling;
    if (base <= ceiling) break;
  }

  return slices;
}

export function incomeTax(base: Kurus, schedule: Schedule = SCHEDULE_2026): Kurus {
  return sliceByBand(base, schedule).reduce((total, slice) => total + slice.tax, 0);
}

/**
 * Tax on the next lira of income.
 *
 * Worth its own function because it is the number that answers "is this job
 * worth taking?", and it is never the average rate the total implies.
 */
export function marginalRate(base: Kurus, schedule: Schedule = SCHEDULE_2026): number {
  for (const band of schedule.bands) {
    if (band.upTo === null || base < band.upTo) return band.rate;
  }
  return schedule.bands[schedule.bands.length - 1].rate;
}

/** Total tax over total income. Always below the marginal rate. */
export function effectiveRate(base: Kurus, schedule: Schedule = SCHEDULE_2026): number {
  if (base <= 0) return 0;
  return Math.round((incomeTax(base, schedule) / base) * 10000) / 100;
}
