interface BatchDedupItem {
  description: string;
  priority: "critical" | "normal" | "low";
  meetingTitle: string;
  date: string;
}

export function buildBatchDedupPrompt(template: string, items: BatchDedupItem[]): string {
  const lines = items.map(
    (item, i) => `${i}. [${item.priority}] [${item.meetingTitle}, ${item.date}] "${item.description}"`,
  );
  const itemsBlock = lines.length > 0 ? `Items:\n${lines.join("\n")}` : "Items:";
  return template.replace("{{items}}", itemsBlock);
}
