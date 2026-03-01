import type { DatabaseSync as Database } from "node:sqlite";
import { createLogger } from "./logger.js";
import { getAllClients } from "./client-registry.js";
import { getMeeting } from "./ingest.js";

const log = createLogger("client:detect");

export interface DetectionResult {
  client_name: string;
  confidence: number;
  method: string;
}

export function detectClient(db: Database, meetingId: string): DetectionResult[] {
  const meeting = getMeeting(db, meetingId);
  const clients = getAllClients(db);
  const participants: Array<{ email: string }> = JSON.parse(meeting.participants);
  const title = meeting.title ?? "";
  const transcriptText = participants.map((p) => p.email).join(" ");
  const rawTranscript = meeting.raw_transcript ?? "";

  const results: DetectionResult[] = [];

  for (const client of clients) {
    const aliases: string[] = JSON.parse(client.aliases);
    const knownDomains: string[] = JSON.parse(client.known_participants);

    const domainMatch = participants.some((p) =>
      knownDomains.some((domain) => p.email.endsWith(domain)),
    );
    const aliasInTitle = aliases.some((a) => title.includes(a));
    const aliasInTranscript = aliases.some((a) => rawTranscript.includes(a));
    const aliasMatch = aliasInTitle || aliasInTranscript;

    let confidence = 0;
    let method = "";

    if (domainMatch && aliasMatch) {
      confidence = 0.95;
      method = "participant+alias";
    } else if (domainMatch) {
      confidence = 0.8;
      method = "participant";
    } else if (aliasMatch) {
      confidence = 0.5;
      method = "alias";
    }

    if (confidence > 0) {
      log("detected client=%s confidence=%d method=%s", client.name, confidence, method);
      results.push({ client_name: client.name, confidence, method });
    }
  }

  return results;
}

export function storeDetection(db: Database, meetingId: string, results: DetectionResult[]): void {
  const stmt = db.prepare("INSERT INTO client_detections (meeting_id, client_name, confidence, method) VALUES (?, ?, ?, ?)");
  for (const r of results) {
    stmt.run(meetingId, r.client_name, r.confidence, r.method);
  }
}
