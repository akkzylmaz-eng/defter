import { describe, expect, it } from "vitest";
import {
  addDays,
  addMonths,
  daysBetween,
  endOfMonth,
  median,
  monthOf,
  quarterOf,
} from "@/kit/dates";

describe("daysBetween", () => {
  it("counts whole days and signs the direction", () => {
    expect(daysBetween("2026-03-01", "2026-03-31")).toBe(30);
    expect(daysBetween("2026-03-31", "2026-03-01")).toBe(-30);
    expect(daysBetween("2026-03-01", "2026-03-01")).toBe(0);
  });

  it("crosses a leap day correctly", () => {
    expect(daysBetween("2028-02-28", "2028-03-01")).toBe(2);
    expect(daysBetween("2026-02-28", "2026-03-01")).toBe(1);
  });

  it("is unaffected by daylight saving, because everything is UTC", () => {
    // Turkey no longer shifts, but a server elsewhere does; a local-time
    // implementation returns 29 or 31 across a European DST boundary.
    expect(daysBetween("2026-03-01", "2026-04-01")).toBe(31);
    expect(daysBetween("2026-10-01", "2026-11-01")).toBe(31);
  });
});

describe("addMonths", () => {
  it("clamps to the end of a shorter month", () => {
    expect(addMonths("2026-01-31", 1)).toBe("2026-02-28");
    expect(addMonths("2028-01-31", 1)).toBe("2028-02-29");
    expect(addMonths("2026-03-31", 1)).toBe("2026-04-30");
  });

  it("rolls over a year boundary", () => {
    expect(addMonths("2026-11-15", 3)).toBe("2027-02-15");
    expect(addMonths("2026-02-15", -3)).toBe("2025-11-15");
  });
});

describe("addDays", () => {
  it("crosses months and years", () => {
    expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
    expect(addDays("2026-01-01", -1)).toBe("2025-12-31");
  });
});

describe("calendar helpers", () => {
  it("finds the end of a month, leap years included", () => {
    expect(endOfMonth("2026-02")).toBe("2026-02-28");
    expect(endOfMonth("2028-02")).toBe("2028-02-29");
    expect(endOfMonth("2026-12")).toBe("2026-12-31");
  });

  it("maps a day to its month and quarter", () => {
    expect(monthOf("2026-07-19")).toBe("2026-07");
    expect(quarterOf("2026-01-01")).toBe(1);
    expect(quarterOf("2026-03-31")).toBe(1);
    expect(quarterOf("2026-04-01")).toBe(2);
    expect(quarterOf("2026-12-31")).toBe(4);
  });
});

describe("median", () => {
  it("averages the middle pair for an even sample", () => {
    expect(median([1, 2, 3, 4])).toBe(2.5);
    expect(median([3, 1, 4, 2])).toBe(2.5);
  });

  it("resists a single outlier where a mean would not", () => {
    expect(median([30, 32, 31, 400])).toBe(31.5);
  });

  it("is zero for an empty sample", () => {
    expect(median([])).toBe(0);
  });
});
