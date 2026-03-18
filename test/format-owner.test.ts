import { describe, it, expect } from "vitest";
import { formatOwner } from "../core/format-owner.js";

describe("formatOwner", () => {
  it("returns full name in comfortable mode", () => {
    expect(formatOwner("Wesley Donaldson", "comfortable")).toBe("Wesley Donaldson");
  });

  it("returns shortened name in compact mode", () => {
    expect(formatOwner("Wesley Donaldson", "compact")).toBe("Wesley D.");
  });

  it("returns initials in dense mode", () => {
    expect(formatOwner("Wesley Donaldson", "dense")).toBe("WD");
  });

  it("handles single name in compact mode", () => {
    expect(formatOwner("Harry", "compact")).toBe("Harry");
  });

  it("handles single name in dense mode", () => {
    expect(formatOwner("Harry", "dense")).toBe("H");
  });

  it("handles three-part name in compact mode", () => {
    expect(formatOwner("António Falcão Jr", "compact")).toBe("António F.");
  });

  it("handles three-part name in dense mode", () => {
    expect(formatOwner("António Falcão Jr", "dense")).toBe("AF");
  });

  it("returns empty string for empty input", () => {
    expect(formatOwner("", "comfortable")).toBe("");
    expect(formatOwner("", "compact")).toBe("");
    expect(formatOwner("", "dense")).toBe("");
  });

  it("handles undefined input", () => {
    expect(formatOwner(undefined, "comfortable")).toBe("");
    expect(formatOwner(undefined, "compact")).toBe("");
    expect(formatOwner(undefined, "dense")).toBe("");
  });

  it("trims whitespace", () => {
    expect(formatOwner("  Wesley Donaldson  ", "compact")).toBe("Wesley D.");
    expect(formatOwner("  Wesley Donaldson  ", "dense")).toBe("WD");
  });
});
