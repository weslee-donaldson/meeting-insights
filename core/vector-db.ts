import * as lancedb from "@lancedb/lancedb";
import { Float32, Field, FixedSizeList, Schema, Utf8 } from "apache-arrow";
import { resolve } from "node:path";

const VECTOR_DIM = 384;

export type VectorDb = lancedb.Connection;
export type VectorTable = lancedb.Table;

export async function connectVectorDb(path: string): Promise<VectorDb> {
  return lancedb.connect(resolve(path));
}

const meetingSchema = new Schema([
  new Field("meeting_id", new Utf8()),
  new Field("vector", new FixedSizeList(VECTOR_DIM, new Field("item", new Float32()))),
  new Field("client", new Utf8()),
  new Field("meeting_type", new Utf8()),
  new Field("date", new Utf8()),
]);

const featureSchema = new Schema([
  new Field("feature_text", new Utf8()),
  new Field("meeting_id", new Utf8()),
  new Field("client", new Utf8()),
  new Field("date", new Utf8()),
  new Field("vector", new FixedSizeList(VECTOR_DIM, new Field("item", new Float32()))),
]);

export async function createMeetingTable(db: VectorDb): Promise<VectorTable> {
  const names = await db.tableNames();
  if (names.includes("meeting_vectors")) return db.openTable("meeting_vectors");
  return db.createEmptyTable("meeting_vectors", meetingSchema);
}

export async function createFeatureTable(db: VectorDb): Promise<VectorTable> {
  const names = await db.tableNames();
  if (names.includes("feature_vectors")) return db.openTable("feature_vectors");
  return db.createEmptyTable("feature_vectors", featureSchema);
}

const itemSchema = new Schema([
  new Field("canonical_id", new Utf8()),
  new Field("item_text", new Utf8()),
  new Field("item_type", new Utf8()),
  new Field("meeting_id", new Utf8()),
  new Field("date", new Utf8()),
  new Field("client", new Utf8()),
  new Field("vector", new FixedSizeList(VECTOR_DIM, new Field("item", new Float32()))),
]);

export async function createItemTable(db: VectorDb): Promise<VectorTable> {
  const names = await db.tableNames();
  if (names.includes("item_vectors")) return db.openTable("item_vectors");
  return db.createEmptyTable("item_vectors", itemSchema);
}
