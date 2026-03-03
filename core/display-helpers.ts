/**
 * Extracts citation indices from an answer string containing [M1], [M2], etc. references.
 * Returns a sorted, de-duplicated array of 1-based indices.
 */
export function parseCitations(text: string): number[] {
  const matches = text.matchAll(/\[M(\d+)\]/g);
  const indices = new Set<number>();
  for (const m of matches) indices.add(parseInt(m[1], 10));
  return [...indices].sort((a, b) => a - b);
}

function formatCitationDate(isoDate: string): string {
  const d = new Date(isoDate);
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return `${days[d.getUTCDay()]}, ${d.getUTCMonth() + 1}/${d.getUTCDate()}/${d.getUTCFullYear()}`;
}

/**
 * Replaces [M1], [M2], etc. citation markers in text with human-readable
 * meeting title and formatted date. Unknown markers are left unchanged.
 */
export function replaceCitations(
  text: string,
  meetings: Array<{ id: string; title: string; date: string }>,
): string {
  return text.replace(/\[M(\d+)\]/g, (match, numStr: string) => {
    const idx = parseInt(numStr, 10) - 1;
    const mtg = meetings[idx];
    if (!mtg) return match;
    return `${mtg.title} (${formatCitationDate(mtg.date)})`;
  });
}

/**
 * Renders an additional_notes array as a human-readable string with group headers and bullet points.
 */
export function renderNotesGroups(notes: Array<Record<string, unknown>>): string {
  if (notes.length === 0) return "";
  const lines: string[] = [];
  for (const obj of notes) {
    const entries = Object.entries(obj);
    const headerEntry = entries.find(([, v]) => typeof v === "string");
    if (!headerEntry) continue;
    lines.push(`  ${headerEntry[1]}`);
    for (const [key, val] of entries) {
      if (key === headerEntry[0]) continue;
      if (typeof val === "string") {
        lines.push(`    • ${val}`);
      } else if (Array.isArray(val)) {
        for (const item of val) {
          if (typeof item === "string") lines.push(`    • ${item}`);
        }
      }
    }
  }
  return lines.join("\n");
}
