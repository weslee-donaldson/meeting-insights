import { describe, it, expect } from "vitest";
import {
  cosineSimilarity,
  l2ToCosineSim,
  isSemanticDuplicate,
} from "../core/math.js";

describe("cosineSimilarity", () => {
  it("returns 1.0 for identical unit vectors", () => {
    const v = [1, 0, 0];
    expect(cosineSimilarity(v, v)).toBeCloseTo(1.0);
  });

  it("returns 0.0 for orthogonal vectors", () => {
    expect(cosineSimilarity([1, 0, 0], [0, 1, 0])).toBeCloseTo(0.0);
  });

  it("returns 0.0 when either vector is all zeros", () => {
    expect(cosineSimilarity([0, 0, 0], [1, 2, 3])).toBe(0);
    expect(cosineSimilarity([1, 2, 3], [0, 0, 0])).toBe(0);
  });

  it("returns expected value for known vectors", () => {
    const a = [1, 2, 3];
    const b = [4, 5, 6];
    const dot = 1 * 4 + 2 * 5 + 3 * 6;
    const normA = Math.sqrt(1 + 4 + 9);
    const normB = Math.sqrt(16 + 25 + 36);
    expect(cosineSimilarity(a, b)).toBeCloseTo(dot / (normA * normB));
  });
});

describe("l2ToCosineSim", () => {
  it("returns 1.0 for L2 distance of 0 (identical unit vectors)", () => {
    expect(l2ToCosineSim(0)).toBeCloseTo(1.0);
  });

  it("returns 0.0 for L2 distance of sqrt(2) (orthogonal unit vectors)", () => {
    expect(l2ToCosineSim(Math.sqrt(2))).toBeCloseTo(0.0);
  });

  it("converts L2 distance 0.548 to approximately 0.85 cosine similarity", () => {
    const l2 = Math.sqrt(2 * (1 - 0.85));
    expect(l2ToCosineSim(l2)).toBeCloseTo(0.85);
  });
});

describe("isSemanticDuplicate", () => {
  it("returns true when L2 distance corresponds to similarity above default threshold", () => {
    const l2 = Math.sqrt(2 * (1 - 0.9));
    expect(isSemanticDuplicate(l2)).toBe(true);
  });

  it("returns false when L2 distance corresponds to similarity below default threshold", () => {
    const l2 = Math.sqrt(2 * (1 - 0.7));
    expect(isSemanticDuplicate(l2)).toBe(false);
  });

  it("returns true for L2 distance of 0 (identical vectors)", () => {
    expect(isSemanticDuplicate(0)).toBe(true);
  });

  it("accepts a custom threshold", () => {
    const l2 = Math.sqrt(2 * (1 - 0.8));
    expect(isSemanticDuplicate(l2, 0.9)).toBe(false);
    expect(isSemanticDuplicate(l2, 0.7)).toBe(true);
  });
});
