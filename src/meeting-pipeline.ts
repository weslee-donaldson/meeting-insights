import { embed } from "./embedder.js";
import { createLogger } from "./logger.js";
import type { InferenceSession } from "onnxruntime-node";
import type { Artifact } from "./extractor.js";
import type { VectorTable } from "./vector-db.js";

const log = createLogger("embed:meeting");

interface MeetingVectorMetadata {
  client: string;
  meeting_type: string;
  date: string;
}

export function buildEmbeddingInput(artifact: Artifact): string {
  return [
    artifact.summary,
    ...artifact.proposed_features,
    ...artifact.technical_topics,
    ...artifact.decisions,
  ].join(" ");
}

export async function embedMeeting(
  session: InferenceSession & { _tokenizer: unknown },
  input: string,
): Promise<Float32Array> {
  return embed(session as Parameters<typeof embed>[0], input);
}

export async function storeMeetingVector(
  table: VectorTable,
  meetingId: string,
  vec: Float32Array,
  meta: MeetingVectorMetadata,
): Promise<void> {
  await table.add([
    {
      meeting_id: meetingId,
      vector: Array.from(vec),
      client: meta.client,
      meeting_type: meta.meeting_type,
      date: meta.date,
    },
  ]);
  log("stored vector for meeting %s client=%s", meetingId, meta.client);
}
