import { embed } from "./embedder.js";
import { createLogger } from "./logger.js";
import type { InferenceSession } from "onnxruntime-node";
import type { Artifact } from "./extractor.js";
import type { VectorTable } from "./search/vector-db.js";

const log = createLogger("embed:meeting");

interface MeetingVectorMetadata {
  client: string;
  client_id?: string;
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
    ...artifact.decisions.map((d) => d.text),
    ...artifact.action_items.map((a) => a.description),
    ...artifact.open_questions,
    ...artifact.risk_items.map((r) => typeof r === "string" ? r : r.description),
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
  const record: Record<string, unknown> = {
    meeting_id: meetingId,
    vector: Array.from(vec),
    client: meta.client,
    meeting_type: meta.meeting_type,
    date: meta.date,
  };
  if (meta.client_id) {
    record.client_id = meta.client_id;
  }
  await table.add([record]);
  log("stored vector for meeting %s client=%s", meetingId, meta.client);
}
