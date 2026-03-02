import { randomUUID } from "node:crypto";
import { createLogger } from "./logger.js";
import type { DatabaseSync as Database } from "node:sqlite";
import type { VectorDb } from "./vector-db.js";

const log = createLogger("cluster");

interface ClusterOptions {
  k: number;
  maxIterations?: number;
}

interface ClusterPoint {
  meeting_id: string;
  vector: number[];
}

function distance(a: number[], b: number[]): number {
  let sum = 0;
  for (let i = 0; i < a.length; i++) sum += (a[i] - b[i]) ** 2;
  return sum;
}

function meanVector(vecs: number[][]): number[] {
  const dim = vecs[0].length;
  const mean = new Array(dim).fill(0);
  for (const v of vecs) for (let i = 0; i < dim; i++) mean[i] += v[i];
  for (let i = 0; i < dim; i++) mean[i] /= vecs.length;
  return mean;
}

function initCentroids(points: ClusterPoint[], k: number): number[][] {
  const centroids: number[][] = [[...points[0].vector]];
  while (centroids.length < k) {
    let maxDist = -Infinity;
    let farthest = points[0].vector;
    for (const p of points) {
      const minDist = Math.min(...centroids.map((c) => distance(p.vector, c)));
      if (minDist > maxDist) {
        maxDist = minDist;
        farthest = p.vector;
      }
    }
    centroids.push([...farthest]);
  }
  return centroids;
}

function kmeans(points: ClusterPoint[], k: number, maxIterations = 50): Map<string, number> {
  const n = points.length;
  if (n === 0) return new Map();

  const actualK = Math.min(k, n);
  const centroids: number[][] = initCentroids(points, actualK);
  const assignments = new Map<string, number>();

  for (let iter = 0; iter < maxIterations; iter++) {
    let changed = false;

    for (const p of points) {
      let bestCluster = 0;
      let bestDist = Infinity;
      for (let c = 0; c < actualK; c++) {
        const d = distance(p.vector, centroids[c]);
        if (d < bestDist) {
          bestDist = d;
          bestCluster = c;
        }
      }
      if (assignments.get(p.meeting_id) !== bestCluster) {
        assignments.set(p.meeting_id, bestCluster);
        changed = true;
      }
    }

    if (!changed) break;

    for (let c = 0; c < actualK; c++) {
      const members = points.filter((p) => assignments.get(p.meeting_id) === c);
      if (members.length > 0) centroids[c] = meanVector(members.map((p) => p.vector));
    }
  }

  return assignments;
}

async function loadAllVectors(vdb: VectorDb): Promise<ClusterPoint[]> {
  const table = await vdb.openTable("meeting_vectors");
  const rows = await table.query().limit(10000).toArray();
  return rows.map((r: Record<string, unknown>) => ({
    meeting_id: r.meeting_id as string,
    vector: Array.from(r.vector as Float32Array),
  }));
}

function persistClusters(db: Database, points: ClusterPoint[], assignments: Map<string, number>): Map<number, string> {
  const clusterIdMap = new Map<number, string>();
  const clusterMembers = new Map<number, number[][]>();

  for (const p of points) {
    const c = assignments.get(p.meeting_id)!;
    if (!clusterIdMap.has(c)) {
      clusterIdMap.set(c, randomUUID());
      clusterMembers.set(c, []);
    }
    clusterMembers.get(c)!.push(p.vector);
  }

  db.exec("DELETE FROM meeting_clusters; DELETE FROM clusters;");

  const insertCluster = db.prepare(
    "INSERT INTO clusters (cluster_id, centroid_snapshot, updated_at) VALUES (?, ?, ?)",
  );
  const insertMapping = db.prepare(
    "INSERT INTO meeting_clusters (meeting_id, cluster_id) VALUES (?, ?)",
  );

  const now = new Date().toISOString();
  for (const [c, clusterId] of clusterIdMap) {
    const centroid = meanVector(clusterMembers.get(c)!);
    insertCluster.run(clusterId, JSON.stringify(centroid), now);
    log("cluster %s size=%d", clusterId, clusterMembers.get(c)!.length);
  }

  for (const p of points) {
    const c = assignments.get(p.meeting_id)!;
    const clusterId = clusterIdMap.get(c)!;
    insertMapping.run(p.meeting_id, clusterId);
  }

  return clusterIdMap;
}

export async function clusterMeetings(db: Database, vdb: VectorDb, options: ClusterOptions): Promise<void> {
  const points = await loadAllVectors(vdb);
  const assignments = kmeans(points, options.k, options.maxIterations);
  persistClusters(db, points, assignments);
}

export async function assignCluster(db: Database, vec: Float32Array): Promise<string> {
  const clusters = db.prepare("SELECT cluster_id, centroid_snapshot FROM clusters").all() as Array<{
    cluster_id: string;
    centroid_snapshot: string;
  }>;

  let bestCluster = clusters[0].cluster_id;
  let bestDist = Infinity;

  for (const cluster of clusters) {
    const centroid: number[] = JSON.parse(cluster.centroid_snapshot);
    const d = distance(Array.from(vec), centroid);
    if (d < bestDist) {
      bestDist = d;
      bestCluster = cluster.cluster_id;
    }
  }

  return bestCluster;
}

export async function recluster(db: Database, vdb: VectorDb, options: ClusterOptions): Promise<void> {
  await clusterMeetings(db, vdb, options);
}
