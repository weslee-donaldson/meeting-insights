import { describe, it, expect } from "vitest";
import { parseKeywords } from "../core/threads.js";

describe("parseKeywords", () => {
  it("returns empty array for empty string", () => {
    expect(parseKeywords("")).toEqual([]);
  });

  it("splits unquoted terms by whitespace", () => {
    expect(parseKeywords("ftp deploy CI")).toEqual(["ftp", "deploy", "CI"]);
  });

  it("preserves quoted multi-word terms as single items", () => {
    expect(parseKeywords('"ftp bug" deploy')).toEqual(["ftp bug", "deploy"]);
  });

  it("handles multiple quoted terms mixed with unquoted", () => {
    expect(parseKeywords('"blue green" rollback "CI pipeline"')).toEqual(["blue green", "rollback", "CI pipeline"]);
  });

  it("trims whitespace and ignores extra spaces", () => {
    expect(parseKeywords("  ftp   deploy  ")).toEqual(["ftp", "deploy"]);
  });

  it("handles only quoted term", () => {
    expect(parseKeywords('"deployment failure"')).toEqual(["deployment failure"]);
  });
});
