import { describe, it, expect } from "vitest";
import { renderNotesGroups, parseCitations, replaceCitations, formatMultiTranscript } from "../core/utils/display.js";

describe("renderNotesGroups", () => {
  it("returns empty string for empty notes array", () => {
    expect(renderNotesGroups([])).toBe("");
  });

  it("renders group header from first string-valued key", () => {
    const notes = [{ category: "Architecture", notes: ["Prefer stateless design"] }];
    const output = renderNotesGroups(notes);
    expect(output).toContain("Architecture");
  });

  it("renders note items as bullet points under the header", () => {
    const notes = [{ category: "Architecture", notes: ["Prefer stateless design", "Avoid tight coupling"] }];
    const output = renderNotesGroups(notes);
    expect(output).toContain("• Prefer stateless design");
    expect(output).toContain("• Avoid tight coupling");
  });

  it("renders multiple groups", () => {
    const notes = [
      { category: "Architecture", notes: ["Prefer stateless design"] },
      { theme: "Constraints", items: ["Timeline is fixed"] },
    ];
    const output = renderNotesGroups(notes);
    expect(output).toContain("Architecture");
    expect(output).toContain("Constraints");
  });
});

describe("parseCitations", () => {
  it("extracts citation indices from answer text", () => {
    expect(parseCitations("[M1] and [M3] are relevant")).toEqual([1, 3]);
  });

  it("returns empty array when no citations found", () => {
    expect(parseCitations("")).toEqual([]);
    expect(parseCitations("no citations here")).toEqual([]);
  });

  it("de-duplicates repeated citations", () => {
    expect(parseCitations("[M2] confirms what [M2] says")).toEqual([2]);
  });

  it("returns indices sorted ascending", () => {
    expect(parseCitations("[M3] and [M1] both agree")).toEqual([1, 3]);
  });
});

describe("replaceCitations", () => {
  it("replaces [M1] with meeting title and formatted date", () => {
    const meetings = [
      { id: "a", title: "Alpha Weekly", date: "2026-03-02T10:00:00.000Z" },
    ];
    expect(replaceCitations("Based on [M1], the decision was clear.", meetings))
      .toBe("Based on Alpha Weekly (Mon, 3/2/2026), the decision was clear.");
  });

  it("replaces multiple citation markers with their respective meetings", () => {
    const meetings = [
      { id: "a", title: "Alpha", date: "2026-03-02T10:00:00.000Z" },
      { id: "b", title: "Beta", date: "2026-03-03T14:00:00.000Z" },
    ];
    expect(replaceCitations("[M1] and [M2] both agree.", meetings))
      .toBe("Alpha (Mon, 3/2/2026) and Beta (Tue, 3/3/2026) both agree.");
  });

  it("leaves unknown citation markers unchanged", () => {
    const meetings = [{ id: "a", title: "Alpha", date: "2026-03-02T10:00:00.000Z" }];
    expect(replaceCitations("[M1] and [M5] disagree.", meetings))
      .toBe("Alpha (Mon, 3/2/2026) and [M5] disagree.");
  });

  it("returns original text when no citations present", () => {
    expect(replaceCitations("No meetings referenced.", [])).toBe("No meetings referenced.");
  });
});

describe("notes context cap", () => {
  it("truncates notes text exceeding 1000 chars with ellipsis", () => {
    const longNote = "x".repeat(1100);
    const notes = [{ category: "Long", detail: longNote }];
    const rendered = renderNotesGroups(notes);
    const capped = rendered.length > 1000 ? rendered.slice(0, 1000) + "…" : rendered;
    expect(capped.endsWith("…")).toBe(true);
    expect(capped.length).toBe(1001);
  });

  it("does not truncate notes text under 1000 chars", () => {
    const notes = [{ category: "Short", detail: "brief note" }];
    const rendered = renderNotesGroups(notes);
    const capped = rendered.length > 1000 ? rendered.slice(0, 1000) + "…" : rendered;
    expect(capped.endsWith("…")).toBe(false);
    expect(capped).toContain("brief note");
  });
});

describe("formatMultiTranscript", () => {
  it("formats multiple transcripts with meeting name, date, and separator", () => {
    const result = formatMultiTranscript([
      { title: "Alpha Meeting", date: "2026-02-25T10:00:00.000Z", transcript: "Speaker 1: Hello\nSpeaker 2: Hi" },
      { title: "Beta Meeting", date: "2026-03-01T14:00:00.000Z", transcript: "Speaker A: Good morning" },
    ]);
    expect(result).toEqual(
      [
        "═══════════════════════════════════════════════════════════════",
        "Alpha Meeting — 2026-02-25",
        "═══════════════════════════════════════════════════════════════",
        "",
        "Speaker 1: Hello",
        "Speaker 2: Hi",
        "",
        "═══════════════════════════════════════════════════════════════",
        "Beta Meeting — 2026-03-01",
        "═══════════════════════════════════════════════════════════════",
        "",
        "Speaker A: Good morning",
      ].join("\n"),
    );
  });

  it("returns empty string for empty array", () => {
    expect(formatMultiTranscript([])).toEqual("");
  });

  it("formats single transcript without trailing separator", () => {
    const result = formatMultiTranscript([
      { title: "Solo Meeting", date: "2026-01-15T09:00:00.000Z", transcript: "Only content" },
    ]);
    expect(result).toContain("Solo Meeting — 2026-01-15");
    expect(result).toContain("Only content");
  });
});
