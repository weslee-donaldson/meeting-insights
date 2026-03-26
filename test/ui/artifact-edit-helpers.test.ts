import { describe, it, expect } from "vitest";
import { arrayToHtml, htmlToArray } from "../../electron-ui/ui/src/lib/artifact-edit-helpers.js";

describe("arrayToHtml", () => {
  it("converts string array to HTML bullet list", () => {
    expect(arrayToHtml(["Alpha", "Beta"])).toBe("<ul><li>Alpha</li><li>Beta</li></ul>");
  });

  it("returns empty string for empty array", () => {
    expect(arrayToHtml([])).toBe("");
  });
});

describe("htmlToArray", () => {
  it("extracts li text content from HTML", () => {
    expect(htmlToArray("<ul><li>Alpha</li><li>Beta</li></ul>")).toEqual(["Alpha", "Beta"]);
  });

  it("strips nested tags from li content", () => {
    expect(htmlToArray("<ul><li><strong>Bold</strong> text</li></ul>")).toEqual(["Bold text"]);
  });

  it("skips empty li elements", () => {
    expect(htmlToArray("<ul><li>One</li><li></li><li>Three</li></ul>")).toEqual(["One", "Three"]);
  });

  it("returns empty array for non-list HTML", () => {
    expect(htmlToArray("<p>Just text</p>")).toEqual([]);
  });

  it("round-trips through arrayToHtml → htmlToArray", () => {
    const items = ["First item", "Second item", "Third item"];
    expect(htmlToArray(arrayToHtml(items))).toEqual(items);
  });
});
