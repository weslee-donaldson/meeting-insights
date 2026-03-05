import { describe, it, expect } from "vitest";
import { mergeSearchResults } from "../core/hybrid-search.js";

describe("mergeSearchResults", () => {
  it("returns min score per meeting_id across multiple result arrays", () => {
    const a = [
      { meeting_id: "m1", score: 0.5 },
      { meeting_id: "m2", score: 0.8 },
    ];
    const b = [
      { meeting_id: "m1", score: 0.3 },
      { meeting_id: "m3", score: 0.6 },
    ];
    const merged = mergeSearchResults([a, b]);
    expect(merged).toEqual(
      new Map([
        ["m1", 0.3],
        ["m2", 0.8],
        ["m3", 0.6],
      ]),
    );
  });

  it("handles empty arrays gracefully", () => {
    const merged = mergeSearchResults([[], []]);
    expect(merged).toEqual(new Map());
  });

  it("handles single result array", () => {
    const a = [{ meeting_id: "m1", score: 0.4 }];
    const merged = mergeSearchResults([a]);
    expect(merged).toEqual(new Map([["m1", 0.4]]));
  });

  it("picks the lower score when same meeting appears in all arrays", () => {
    const a = [{ meeting_id: "m1", score: 1.2 }];
    const b = [{ meeting_id: "m1", score: 0.9 }];
    const c = [{ meeting_id: "m1", score: 1.5 }];
    const merged = mergeSearchResults([a, b, c]);
    expect(merged).toEqual(new Map([["m1", 0.9]]));
  });
});
