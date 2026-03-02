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

function canonicalizeNotes(notes: Array<Record<string, unknown>>): string {
  return notes.map(obj => {
    const entries = Object.entries(obj);
    const headerEntry = entries.find(([, v]) => typeof v === "string");
    if (!headerEntry) return "";
    const header = headerEntry[1] as string;
    const content: string[] = [];
    for (const [key, val] of entries) {
      if (key === headerEntry[0]) continue;
      if (typeof val === "string") content.push(val);
      else if (Array.isArray(val)) content.push(...val.filter((v): v is string => typeof v === "string"));
    }
    return content.length > 0 ? `${header}: ${content.join(". ")}` : header;
  }).filter(Boolean).join(". ");
}

export function buildEmbeddingInput(artifact: Artifact): string {
  const parts = [
    artifact.summary,
    ...artifact.proposed_features,
    ...artifact.architecture,
    ...artifact.decisions.map((d) => d.text),
  ];
  const notes = canonicalizeNotes(artifact.additional_notes ?? []);
  if (notes) parts.push(notes);
  return parts.join(" ");
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
