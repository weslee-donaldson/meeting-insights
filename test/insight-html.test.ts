import { describe, it, expect } from "vitest";
import { plainTextToHtml, stripHtml } from "../core/insights.js";

describe("plainTextToHtml", () => {
  it("wraps single line in paragraph", () => {
    expect(plainTextToHtml("Single line")).toBe("<p>Single line</p>");
  });

  it("wraps multiple paragraphs separated by blank lines", () => {
    expect(plainTextToHtml("Line 1\n\nLine 2")).toBe("<p>Line 1</p><p>Line 2</p>");
  });

  it("returns empty string for empty input", () => {
    expect(plainTextToHtml("")).toBe("");
  });

  it("treats consecutive newlines as paragraph breaks", () => {
    expect(plainTextToHtml("A\n\nB\n\nC")).toBe("<p>A</p><p>B</p><p>C</p>");
  });
});

describe("stripHtml", () => {
  it("strips paragraph tags and joins with double newlines", () => {
    expect(stripHtml("<p>Hello</p><p>World</p>")).toBe("Hello\n\nWorld");
  });

  it("returns empty string for empty input", () => {
    expect(stripHtml("")).toBe("");
  });

  it("strips inline tags", () => {
    expect(stripHtml("<p><strong>Bold</strong> text</p>")).toBe("Bold text");
  });

  it("handles list items", () => {
    expect(stripHtml("<ul><li>Item 1</li><li>Item 2</li></ul>")).toBe("Item 1\nItem 2");
  });
});
