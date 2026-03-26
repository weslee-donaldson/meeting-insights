export function arrayToHtml(items: string[]): string {
  if (items.length === 0) return "";
  return `<ul>${items.map((item) => `<li>${item}</li>`).join("")}</ul>`;
}

export function htmlToArray(html: string): string[] {
  const regex = /<li[^>]*>([\s\S]*?)<\/li>/gi;
  const results: string[] = [];
  let match;
  while ((match = regex.exec(html)) !== null) {
    const text = match[1].replace(/<[^>]*>/g, "").trim();
    if (text) results.push(text);
  }
  return results;
}
