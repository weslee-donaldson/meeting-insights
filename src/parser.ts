import { readdirSync, readFileSync } from "node:fs";
import { createLogger } from "./logger.js";

const logFilename = createLogger("parser:filename");
const logAttend = createLogger("parser:attend");
const logBody = createLogger("parser:body");
const logDir = createLogger("parser:dir");

const TIMESTAMP_RE = /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z)/;
const DUPLICATE_SUFFIX_RE = /\s*\(\d+\)$/;

export interface Participant {
  last_name: string;
  id: string;
  first_name: string;
  email: string;
}

export interface SpeakerTurn {
  speaker_name: string;
  timestamp: string;
  text: string;
}

export function parseFilename(filename: string): { timestamp: string; title: string } {
  const stripped = filename.trimStart();
  const match = stripped.match(TIMESTAMP_RE);
  if (!match) throw new Error(`Cannot parse filename: ${filename}`);
  const timestamp = match[1];
  const title = stripped.slice(timestamp.length).replace(DUPLICATE_SUFFIX_RE, "").trim();
  logFilename("parsed timestamp=%s title=%s", timestamp, title);
  return { timestamp, title };
}

export function splitSections(content: string): { attendance: string; transcript: string } {
  const idx = content.indexOf("Transcript:");
  if (idx === -1) throw new Error("No Transcript: delimiter found");
  const attendance = content.slice(0, idx).replace(/^Attendance:\n?/, "").trim();
  const transcript = content.slice(idx + "Transcript:".length).trim();
  return { attendance, transcript };
}

export function parseAttendance(attendance: string): Participant[] {
  const json = attendance
    .replace(/'/g, '"')
    .replace(/\}\s*,\s*\{/g, "},{");
  const participants: Participant[] = JSON.parse(`[${json}]`);
  logAttend("parsed %d participants", participants.length);
  return participants;
}

const TURN_HEADER_RE = /^(.+?) \| (\d{2}:\d{2})$/;
const SPEAKER_N_RE = /^Speaker (\d+)$/;

export function parseTranscriptBody(transcript: string): SpeakerTurn[] {
  const lines = transcript.split("\n");
  const turns: SpeakerTurn[] = [];
  let current: SpeakerTurn | null = null;

  for (const line of lines) {
    const match = line.match(TURN_HEADER_RE);
    if (match) {
      if (current) turns.push(current);
      const rawName = match[1];
      const speakerN = rawName.match(SPEAKER_N_RE);
      const speaker_name = speakerN ? `Unknown Speaker ${speakerN[1]}` : rawName;
      current = { speaker_name, timestamp: match[2], text: "" };
    } else if (current && line.trim()) {
      current.text = current.text ? `${current.text}\n${line}` : line;
    }
  }
  if (current) turns.push(current);
  logBody("parsed %d speaker turns", turns.length);
  return turns;
}

export function readTranscriptFile(filePath: string): string {
  return readFileSync(filePath, "utf-8");
}

export function listTranscriptFiles(dir: string): string[] {
  const files = readdirSync(dir).sort();
  logDir("found %d files in %s", files.length, dir);
  return files;
}
