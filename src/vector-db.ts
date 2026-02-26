import * as lancedb from "@lancedb/lancedb";
import { Float32, Field, FixedSizeList, Schema, Utf8 } from "apache-arrow";

const VECTOR_DIM = 384;

export type VectorDb = lancedb.Connection;
export type VectorTable = lancedb.Table;

export async function connectVectorDb(path: string): Promise<VectorDb> {
  return lancedb.connect(path);
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
  return db.createEmptyTable("meeting_vectors", meetingSchema, { existOk: true });
}

export async function createFeatureTable(db: VectorDb): Promise<VectorTable> {
  return db.createEmptyTable("feature_vectors", featureSchema, { existOk: true });
}
