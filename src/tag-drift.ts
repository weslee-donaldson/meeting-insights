import { createLogger } from "./logger.js";
import type { DatabaseSync as Database } from "node:sqlite";

const log = createLogger("cluster:drift");

interface DriftResult {
  drifted: boolean;
  magnitude: number;
}

function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

export function detectTagDrift(
  db: Database,
  clusterId: string,
  currentCentroid: number[],
  threshold: number,
): DriftResult {
  const row = db
    .prepare("SELECT centroid_snapshot FROM clusters WHERE cluster_id = ?")
    .get(clusterId) as { centroid_snapshot: string } | undefined;

  if (!row) return { drifted: false, magnitude: 0 };

  const stored: number[] = JSON.parse(row.centroid_snapshot);
  const similarity = cosineSimilarity(stored, currentCentroid);
  const magnitude = 1 - similarity;
  const drifted = magnitude > threshold;

  log("cluster=%s magnitude=%f drifted=%s", clusterId, magnitude, drifted);
  return { drifted, magnitude };
}
