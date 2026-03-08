import { describe, it, expect } from "vitest";
import { computePeriodBounds } from "../core/insights.js";

describe("computePeriodBounds", () => {
  it("returns same day for day period", () => {
    const result = computePeriodBounds("day", "2026-03-08");
    expect(result).toEqual({ start: "2026-03-08", end: "2026-03-08" });
  });

  it("returns Monday-Sunday for week period", () => {
    const result = computePeriodBounds("week", "2026-03-11");
    expect(result).toEqual({ start: "2026-03-09", end: "2026-03-15" });
  });

  it("returns Monday-Sunday when reference is Monday", () => {
    const result = computePeriodBounds("week", "2026-03-09");
    expect(result).toEqual({ start: "2026-03-09", end: "2026-03-15" });
  });

  it("returns Monday-Sunday when reference is Sunday", () => {
    const result = computePeriodBounds("week", "2026-03-15");
    expect(result).toEqual({ start: "2026-03-09", end: "2026-03-15" });
  });

  it("returns first and last day of month for month period", () => {
    const result = computePeriodBounds("month", "2026-03-15");
    expect(result).toEqual({ start: "2026-03-01", end: "2026-03-31" });
  });

  it("handles February in a non-leap year", () => {
    const result = computePeriodBounds("month", "2027-02-10");
    expect(result).toEqual({ start: "2027-02-01", end: "2027-02-28" });
  });

  it("handles February in a leap year", () => {
    const result = computePeriodBounds("month", "2028-02-10");
    expect(result).toEqual({ start: "2028-02-01", end: "2028-02-29" });
  });
});
