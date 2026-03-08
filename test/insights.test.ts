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
});
