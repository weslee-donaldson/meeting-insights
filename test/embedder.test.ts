import { describe, it, expect, beforeAll } from "vitest";
import { loadModel, embed } from "../core/embedder.js";
import type { InferenceSession } from "onnxruntime-node";

let session: InferenceSession;

beforeAll(async () => {
  session = await loadModel("models/all-MiniLM-L6-v2.onnx", "models/tokenizer.json");
}, 30000);

function cosineSimilarity(a: Float32Array, b: Float32Array): number {
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

describe("loadModel", () => {
  it("loads ONNX model and returns session", () => {
    expect(session).toBeDefined();
    expect(typeof session.run).toBe("function");
  });
});

describe("embed", () => {
  it("returns Float32Array of length 384", async () => {
    const vec = await embed(session, "Hello world");
    expect(vec).toBeInstanceOf(Float32Array);
    expect(vec.length).toBe(384);
  });

  it("returns similar vectors for semantically similar inputs", async () => {
    const a = await embed(session, "The dog sat on the mat");
    const b = await embed(session, "A dog is sitting on a mat");
    expect(cosineSimilarity(a, b)).toBeGreaterThan(0.8);
  });

  it("returns dissimilar vectors for unrelated inputs", async () => {
    const a = await embed(session, "The dog sat on the mat");
    const b = await embed(session, "The stock market crashed due to inflation fears");
    expect(cosineSimilarity(a, b)).toBeLessThan(0.3);
  });
});
