import { describe, it, expect } from "vitest";
import { renderNotesGroups } from "../src/display-helpers.js";

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
