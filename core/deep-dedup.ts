export interface BatchDedupItem {
  description: string;
  priority: "critical" | "normal" | "low";
  meetingTitle: string;
  date: string;
}

export interface IndexedBatchDedupItem extends BatchDedupItem {
  originalIndex: number;
}

export function filterAndCapItems(items: BatchDedupItem[], batchSize: number): IndexedBatchDedupItem[] {
  const indexed: IndexedBatchDedupItem[] = items.map((item, i) => ({ ...item, originalIndex: i }));
  const eligible = indexed.filter((item) => item.priority !== "low");
  const critical = eligible.filter((item) => item.priority === "critical");
  const normal = eligible.filter((item) => item.priority === "normal");
  critical.sort((a, b) => b.date.localeCompare(a.date));
  normal.sort((a, b) => b.date.localeCompare(a.date));
  return [...critical.slice(0, batchSize), ...normal.slice(0, batchSize)];
}

export function buildBatchDedupPrompt(template: string, items: BatchDedupItem[]): string {
  const lines = items.map(
    (item, i) => `${i}. [${item.priority}] [${item.meetingTitle}, ${item.date}] "${item.description}"`,
  );
  const itemsBlock = lines.length > 0 ? `Items:\n${lines.join("\n")}` : "Items:";
  return template.replace("{{items}}", itemsBlock);
}
