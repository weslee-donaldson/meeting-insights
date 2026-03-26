import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
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

const WEBVTT_TIMESTAMP_RE = /^\d{2}:\d{2}:\d{2}\.\d{3}\s*-->\s*\d{2}:\d{2}:\d{2}\.\d{3}/;
const WEBVTT_SPEAKER_RE = /^(.+?):\s+(.+)$/;

export function parseWebVttBody(content: string): SpeakerTurn[] {
  const lines = content.split("\n");
  const turns: SpeakerTurn[] = [];
  let lastTimestamp = "00:00";

  for (const line of lines) {
    const trimmed = line.trim();
    if (WEBVTT_TIMESTAMP_RE.test(trimmed)) {
      lastTimestamp = trimmed.slice(0, 5);
      continue;
    }
    const speakerMatch = trimmed.match(WEBVTT_SPEAKER_RE);
    if (speakerMatch) {
      const prev = turns[turns.length - 1];
      if (prev && prev.speaker_name === speakerMatch[1]) {
        prev.text += "\n" + speakerMatch[2];
      } else {
        turns.push({ speaker_name: speakerMatch[1], timestamp: lastTimestamp, text: speakerMatch[2] });
      }
    }
  }
  logBody("parsed %d speaker turns (webvtt)", turns.length);
  return turns;
}

const logParser = createLogger("parser");

export interface ParsedMeeting {
  externalId?: string;
  timestamp: string;
  title: string;
  participants: Participant[];
  turns: SpeakerTurn[];
  rawTranscript: string;
  sourceFilename: string;
}

export function parseKrispFile(filePath: string, filename: string): ParsedMeeting | null {
  try {
    const raw = readFileSync(filePath, "utf-8");
    const { timestamp, title } = parseFilename(filename);
    const { attendance, transcript } = splitSections(raw);
    const participants = parseAttendance(attendance);
    const turns = parseTranscriptBody(transcript);
    return { timestamp, title, participants, turns, rawTranscript: raw, sourceFilename: filename };
  } catch (err) {
    logParser("failed to parse %s: %s", filename, err);
    return null;
  }
}

export function readTranscriptFile(filePath: string): string {
  return readFileSync(filePath, "utf-8");
}

export function listTranscriptFiles(dir: string): string[] {
  const files = readdirSync(dir).sort();
  logDir("found %d files in %s", files.length, dir);
  return files;
}

export function listWebhookFiles(dir: string): string[] {
  if (!existsSync(dir)) return [];
  const files = readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .sort();
  logDir("found %d webhook files in %s", files.length, dir);
  return files;
}

export interface ManifestEntry {
  meeting_id: string;
  meeting_title: string;
  meeting_date: string;
  meeting_files: string[];
}

export function parseManifest(rawDir: string): ManifestEntry[] {
  return JSON.parse(readFileSync(join(rawDir, "manifest.json"), "utf-8")) as ManifestEntry[];
}

const MD_TURN_HEADER_RE = /^\*\*(.+?) \| (\d{2}:\d{2})\*\*$/;

export function parseMarkdownTranscriptBody(content: string): SpeakerTurn[] {
  const lines = content.split("\n");
  const turns: SpeakerTurn[] = [];
  let current: SpeakerTurn | null = null;

  for (const line of lines) {
    const match = line.match(MD_TURN_HEADER_RE);
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
  logBody("parsed %d speaker turns (markdown)", turns.length);
  return turns;
}

export function parseKrispFolder(rawDir: string, folderName: string, entry: ManifestEntry): ParsedMeeting | null {
  try {
    const raw = readFileSync(join(rawDir, folderName, "transcript.md"), "utf-8");
    const idx = raw.indexOf("# Transcript\n");
    if (idx === -1) throw new Error("No # Transcript section found");
    const turns = parseMarkdownTranscriptBody(raw.slice(idx + "# Transcript\n".length).trim());
    return { externalId: entry.meeting_id, timestamp: entry.meeting_date, title: entry.meeting_title, participants: [], turns, rawTranscript: raw, sourceFilename: folderName };
  } catch (err) {
    logParser("failed to parse folder %s: %s", folderName, err);
    return null;
  }
}

interface WebhookSpeaker {
  index: number;
  first_name: string | null;
  last_name: string | null;
  id: string;
  email: string;
}

interface WebhookContentEntry {
  speaker: string;
  speakerIndex: number;
  text: string;
}

export function parseWebhookPayload(json: string, filename: string): ParsedMeeting | null {
  try {
    const payload = JSON.parse(json);
    if (payload.event !== "transcript_created") return null;
    const meeting = payload.data.meeting;
    if (!meeting?.speakers || !Array.isArray(payload.data.content)) return null;
    const participants: Participant[] = meeting.speakers.map((s: WebhookSpeaker) => ({
      first_name: s.first_name ?? s.email?.split("@")[0] ?? "Unknown",
      last_name: s.last_name ?? "",
      id: s.id,
      email: s.email ?? "",
    }));
    const turns: SpeakerTurn[] = payload.data.content.map((c: WebhookContentEntry) => ({
      speaker_name: c.speaker,
      timestamp: "00:00",
      text: c.text,
    }));
    const rawTranscript = turns.map((t) => `${t.speaker_name} | ${t.timestamp}\n${t.text}\n`).join("");
    return {
      externalId: meeting.id,
      timestamp: meeting.start_date,
      title: meeting.title,
      participants,
      turns,
      rawTranscript,
      sourceFilename: filename,
    };
  } catch (err) {
    logParser("failed to parse webhook %s: %s", filename, err);
    return null;
  }
}

export interface ParsedWebhookNote {
  externalMeetingId: string;
  noteType: string;
  title: string;
  body: string;
}

const NOTE_EVENT_MAP: Record<string, { noteType: string; title: string }> = {
  key_points_generated: { noteType: "key-points", title: "Krisp Key Points" },
  action_items_generated: { noteType: "action-items", title: "Krisp Action Items" },
};

export function parseWebhookNote(json: string, _filename: string): ParsedWebhookNote | null {
  try {
    const payload = JSON.parse(json);
    const mapping = NOTE_EVENT_MAP[payload.event];
    if (!mapping) return null;
    const meetingId = payload.data?.meeting?.id;
    const rawContent = payload.data?.raw_content;
    if (!meetingId || typeof rawContent !== "string") return null;
    return {
      externalMeetingId: meetingId,
      noteType: mapping.noteType,
      title: mapping.title,
      body: rawContent,
    };
  } catch {
    return null;
  }
}
