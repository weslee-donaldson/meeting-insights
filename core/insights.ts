function formatDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function computePeriodBounds(
  periodType: "day" | "week" | "month",
  referenceDate: string,
): { start: string; end: string } {
  const [year, month, day] = referenceDate.split("-").map(Number);
  if (periodType === "day") {
    return { start: referenceDate, end: referenceDate };
  }
  if (periodType === "week") {
    const d = new Date(year, month - 1, day);
    const dow = d.getDay();
    const mondayOffset = dow === 0 ? -6 : 1 - dow;
    const monday = new Date(year, month - 1, day + mondayOffset);
    const sunday = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + 6);
    return { start: formatDate(monday), end: formatDate(sunday) };
  }
  const firstDay = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0);
  return { start: formatDate(firstDay), end: formatDate(lastDay) };
}
