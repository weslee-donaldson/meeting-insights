export function computePeriodBounds(
  periodType: "day" | "week" | "month",
  referenceDate: string,
): { start: string; end: string } {
  if (periodType === "day") {
    return { start: referenceDate, end: referenceDate };
  }
  return { start: referenceDate, end: referenceDate };
}
