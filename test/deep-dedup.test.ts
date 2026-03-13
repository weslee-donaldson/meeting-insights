import { describe, it, expect } from "vitest";
import { buildBatchDedupPrompt, filterAndCapItems, parseBatchDedupResponse } from "../core/deep-dedup.js";
import type { BatchDedupItem } from "../core/deep-dedup.js";

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

describe("filterAndCapItems", () => {
  const makeItem = (priority: "critical" | "normal" | "low", date: string, desc = "task"): BatchDedupItem => ({
    description: desc,
    priority,
    meetingTitle: "Meeting",
    date,
  });

  it("excludes low-priority items", () => {
    const items = [makeItem("critical", "2026-01-10"), makeItem("low", "2026-01-11"), makeItem("normal", "2026-01-12")];
    const result = filterAndCapItems(items, 50);
    expect(result).toEqual([
      { ...items[0], originalIndex: 0 },
      { ...items[2], originalIndex: 2 },
    ]);
  });

  it("caps each priority group to batchSize most recent items", () => {
    const items = [
      makeItem("critical", "2026-01-01", "old critical"),
      makeItem("critical", "2026-01-03", "new critical"),
      makeItem("critical", "2026-01-02", "mid critical"),
      makeItem("normal", "2026-01-05", "new normal"),
      makeItem("normal", "2026-01-04", "old normal"),
    ];
    const result = filterAndCapItems(items, 2);
    expect(result).toEqual([
      { ...items[1], originalIndex: 1 },
      { ...items[2], originalIndex: 2 },
      { ...items[3], originalIndex: 3 },
      { ...items[4], originalIndex: 4 },
    ]);
  });

  it("preserves original indices for mapping back", () => {
    const items = [makeItem("low", "2026-01-01"), makeItem("normal", "2026-01-02"), makeItem("critical", "2026-01-03")];
    const result = filterAndCapItems(items, 50);
    expect(result.map((r) => r.originalIndex)).toEqual([2, 1]);
  });

  it("returns empty array when all items are low priority", () => {
    const items = [makeItem("low", "2026-01-01"), makeItem("low", "2026-01-02")];
    expect(filterAndCapItems(items, 50)).toEqual([]);
  });
});

describe("parseBatchDedupResponse", () => {
  it("extracts valid groups from LLM response", () => {
    const response = { groups: [[0, 1], [2, 3]], reasoning: {} };
    expect(parseBatchDedupResponse(response, 5)).toEqual([[0, 1], [2, 3]]);
  });

  it("returns empty array when groups is missing", () => {
    expect(parseBatchDedupResponse({ reasoning: {} }, 5)).toEqual([]);
  });

  it("filters out-of-bounds indices", () => {
    const response = { groups: [[0, 5, 1]], reasoning: {} };
    expect(parseBatchDedupResponse(response, 3)).toEqual([[0, 1]]);
  });

  it("drops groups with fewer than 2 valid indices", () => {
    const response = { groups: [[0], [1, 2]], reasoning: {} };
    expect(parseBatchDedupResponse(response, 3)).toEqual([[1, 2]]);
  });

  it("removes duplicate indices across groups", () => {
    const response = { groups: [[0, 1], [1, 2]], reasoning: {} };
    expect(parseBatchDedupResponse(response, 3)).toEqual([[0, 1]]);
  });

  it("handles empty groups array", () => {
    expect(parseBatchDedupResponse({ groups: [] }, 5)).toEqual([]);
  });
});
