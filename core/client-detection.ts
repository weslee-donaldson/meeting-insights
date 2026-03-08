import type { DatabaseSync as Database } from "node:sqlite";
import { createLogger } from "./logger.js";
import { getAllClients } from "./client-registry.js";
import type { Participant } from "./client-registry.js";
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

export function nameTokensFromParticipant(entry: string): Set<string> {
  if (entry.startsWith("@")) return new Set();
  const localPart = entry.includes("@") ? entry.split("@")[0] : entry;
  return normalizeTokens(localPart);
}

export function parseSpeakerNames(rawTranscript: string): string[] {
  const seen = new Set<string>();
  const names: string[] = [];
  for (const line of rawTranscript.split("\n")) {
    const m = /^([^|]+)\|/.exec(line);
    if (m) {
      const name = m[1].trim();
      if (name && !seen.has(name)) {
        seen.add(name);
        names.push(name);
      }
    }
  }
  return names;
}

function speakerMatchesMembers(members: Participant[], speakerNames: string[]): boolean {
  const speakerTokenSets = speakerNames.map(n => normalizeTokens(n));
  return members.some(p => {
    const tokens = new Set([
      ...normalizeTokens(p.name),
      ...(p.email ? nameTokensFromParticipant(p.email) : []),
    ]);
    return tokens.size > 0 && speakerTokenSets.some(st => [...tokens].some(t => st.has(t)));
  });
}

export function detectClient(db: Database, meetingId: string): DetectionResult[] {
  const meeting = getMeeting(db, meetingId);
  const clients = getAllClients(db);
  const participants: Array<{ email: string }> = JSON.parse(meeting.participants);
  const title = meeting.title ?? "";
  const rawTranscript = meeting.raw_transcript ?? "";

  const speakerNames = parseSpeakerNames(rawTranscript);
  const results: DetectionResult[] = [];

  for (const client of clients) {
    const aliases: string[] = JSON.parse(client.aliases);
    const clientTeam: Participant[] = JSON.parse(client.client_team ?? "[]");
    const implTeam: Participant[] = JSON.parse(client.implementation_team ?? "[]");
    const meetingNames: string[] = JSON.parse(client.meeting_names ?? "[]");

    const allMembers = [...clientTeam, ...implTeam];
    const memberEmails = allMembers.map(p => p.email).filter((e): e is string => Boolean(e));
    const domainMatch = participants.some(p => memberEmails.some(e => p.email.endsWith(e)));
    const speakerMatch = speakerMatchesMembers(allMembers, speakerNames);
    const hasParticipant = domainMatch || speakerMatch;
    const participantMethod = speakerMatch && !domainMatch ? "speaker_name" : "participant";

    const aliasInTitle = aliases.some((a) => title.includes(a));
    const aliasInTranscript = aliases.some((a) => rawTranscript.includes(a));
    const aliasMatch = aliasInTitle || aliasInTranscript;
    const titleTokens = normalizeTokens(title);
    const meetingNameMatch = meetingNames.some(mn => meetingNameMatches(mn, titleTokens));

    let confidence = 0;
    let method = "";

    if (hasParticipant && aliasMatch && meetingNameMatch) {
      confidence = 0.95;
      method = `${participantMethod}+alias+meeting_name`;
    } else if (hasParticipant && aliasMatch) {
      confidence = 0.95;
      method = `${participantMethod}+alias`;
    } else if (hasParticipant && meetingNameMatch) {
      confidence = 0.95;
      method = `${participantMethod}+meeting_name`;
    } else if (hasParticipant) {
      confidence = 0.8;
      method = participantMethod;
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
  const top = [...results].sort((a, b) => b.confidence - a.confidence)[0];
  if (top) {
    const clientRow = db.prepare("SELECT id FROM clients WHERE name = ?").get(top.client_name) as { id: string } | undefined;
    if (clientRow?.id) {
      db.prepare("UPDATE meetings SET client_id = ? WHERE id = ?").run(clientRow.id, meetingId);
    }
  }
}
