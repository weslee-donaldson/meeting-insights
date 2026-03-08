import { describe, it, expect } from "vitest";
import { computePeriodBounds } from "../core/insights.js";

describe("computePeriodBounds", () => {
  it("returns same day for day period", () => {
    const result = computePeriodBounds("day", "2026-03-08");
    expect(result).toEqual({ start: "2026-03-08", end: "2026-03-08" });
  });
});
