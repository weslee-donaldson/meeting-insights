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

export function normalizeTokens(s: string): Set<string> {
  return new Set(
    s.toLowerCase().replace(/[^a-z0-9]/g, " ").split(/\s+/).filter(Boolean)
  );
}

function meetingNameMatches(meetingName: string, titleTokens: Set<string>): boolean {
  const nameTokens = normalizeTokens(meetingName);
  return nameTokens.size > 0 && [...nameTokens].every(t => titleTokens.has(t));
}

export function detectClient(db: Database, meetingId: string): DetectionResult[] {
  const meeting = getMeeting(db, meetingId);
  const clients = getAllClients(db);
  const participants: Array<{ email: string }> = JSON.parse(meeting.participants);
  const title = meeting.title ?? "";
  const rawTranscript = meeting.raw_transcript ?? "";

  const results: DetectionResult[] = [];

  for (const client of clients) {
    const aliases: string[] = JSON.parse(client.aliases);
    const knownDomains: string[] = JSON.parse(client.known_participants);
    const meetingNames: string[] = JSON.parse(client.meeting_names ?? "[]");

    const domainMatch = participants.some((p) =>
      knownDomains.some((domain) => p.email.endsWith(domain)),
    );
    const aliasInTitle = aliases.some((a) => title.includes(a));
    const aliasInTranscript = aliases.some((a) => rawTranscript.includes(a));
    const aliasMatch = aliasInTitle || aliasInTranscript;
    const titleTokens = normalizeTokens(title);
    const meetingNameMatch = meetingNames.some(mn => meetingNameMatches(mn, titleTokens));

    let confidence = 0;
    let method = "";

    if (domainMatch && aliasMatch && meetingNameMatch) {
      confidence = 0.95;
      method = "participant+alias+meeting_name";
    } else if (domainMatch && aliasMatch) {
      confidence = 0.95;
      method = "participant+alias";
    } else if (domainMatch && meetingNameMatch) {
      confidence = 0.95;
      method = "participant+meeting_name";
    } else if (domainMatch) {
      confidence = 0.8;
      method = "participant";
    } else if (meetingNameMatch && aliasMatch) {
      confidence = 0.7;
      method = "meeting_name+alias";
    } else if (meetingNameMatch) {
      confidence = 0.7;
      method = "meeting_name";
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
