import { describe, it, expect } from "vitest";
import { buildBatchDedupPrompt } from "../core/deep-dedup.js";

describe("buildBatchDedupPrompt", () => {
  const template = "Analyze these items:\n\n{{items}}";

  it("formats numbered items with priority tags and replaces placeholder", () => {
    const items = [
      { description: "Deploy application to production", priority: "critical" as const, meetingTitle: "Monday Standup", date: "2026-01-10" },
      { description: "Update API documentation", priority: "normal" as const, meetingTitle: "Friday Review", date: "2026-01-14" },
    ];
    const result = buildBatchDedupPrompt(template, items);
    expect(result).toBe(
      "Analyze these items:\n\n" +
      "Items:\n" +
      '0. [critical] [Monday Standup, 2026-01-10] "Deploy application to production"\n' +
      '1. [normal] [Friday Review, 2026-01-14] "Update API documentation"',
    );
  });

  it("returns template with empty items list when no items provided", () => {
    const result = buildBatchDedupPrompt(template, []);
    expect(result).toBe("Analyze these items:\n\nItems:");
  });
});
