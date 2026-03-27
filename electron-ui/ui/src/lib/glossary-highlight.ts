interface GlossaryEntry {
  term: string;
  variants: string[];
  description: string;
}

export function highlightGlossaryTerms(text: string, glossary: GlossaryEntry[]): string {
  if (!glossary.length || !text) return text;

  const lookup = new Map<string, GlossaryEntry>();
  for (const entry of glossary) {
    lookup.set(entry.term.toLowerCase(), entry);
    for (const v of entry.variants) {
      lookup.set(v.toLowerCase(), entry);
    }
  }

  const allTerms = [...lookup.keys()].sort((a, b) => b.length - a.length);
  const escaped = allTerms.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const pattern = new RegExp(`\\b(${escaped.join("|")})\\b`, "gi");

  const seen = new Set<string>();

  return text.replace(pattern, (match) => {
    const entry = lookup.get(match.toLowerCase());
    if (!entry || seen.has(entry.term)) return match;
    seen.add(entry.term);
    const escapedDesc = entry.description
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
    return `<span class="glossary-term" title="${escapedDesc}" data-term="${entry.term}">${match}</span>`;
  });
}
