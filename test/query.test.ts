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
