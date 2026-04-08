import { readFileSync, writeFileSync } from "node:fs";
import { extname } from "node:path";

const INITIALS_RE = /^[A-Z]{2,3}$/;
const TIMESTAMP_HEADER_RE = /^(\d+) minutes? (\d+) seconds?(\d+:\d{2})$/;
const CONTINUATION_RE = /^(.+?) (\d+) minutes? (\d+) seconds?$/;
const COMPACT_TS_RE = /^(\d{1,2}):(\d{2})$/;

interface Turn {
  speaker: string;
  minutes: number;
  seconds: number;
  text: string;
}

function parseDuplicateNameFormat(content: string): Turn[] {
  const lines = content.split("\n");
  const turns: Turn[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i].trim();
    if (!line) { i++; continue; }

    const nextLine = i + 1 < lines.length ? lines[i + 1].trim() : "";
    if (nextLine === line) {
      const speaker = line;
      i += 2;
      let minutes = 0;
      let seconds = 0;
      const tsLine = i < lines.length ? lines[i].trim() : "";
      const tsMatch = tsLine.match(COMPACT_TS_RE);
      if (tsMatch) {
        minutes = parseInt(tsMatch[1], 10);
        seconds = parseInt(tsMatch[2], 10);
        i++;
      }

      const textLines: string[] = [];
      while (i < lines.length) {
        const cur = lines[i].trim();
        if (!cur) { i++; continue; }
        const peek = i + 1 < lines.length ? lines[i + 1].trim() : "";
        if (peek === cur) break;
        textLines.push(cur);
        i++;
      }
      if (textLines.length > 0) {
        turns.push({ speaker, minutes, seconds, text: textLines.join(" ") });
      }
    } else {
      i++;
    }
  }
  return turns;
}

function parseTeamsVerboseFormat(content: string): Turn[] {
  const lines = content.split("\n");
  const turns: Turn[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i].trim();
    if (!line || INITIALS_RE.test(line)) { i++; continue; }

    const nextLine = i + 1 < lines.length ? lines[i + 1].trim() : "";
    const tsMatch = nextLine.match(TIMESTAMP_HEADER_RE);
    if (tsMatch) {
      const speaker = line;
      const minutes = parseInt(tsMatch[1], 10);
      const seconds = parseInt(tsMatch[2], 10);
      i += 3;
      const textLines: string[] = [];
      while (i < lines.length) {
        const cur = lines[i].trim();
        if (!cur) { i++; break; }
        if (INITIALS_RE.test(cur)) break;
        const contMatch = cur.match(CONTINUATION_RE);
        if (contMatch) {
          if (textLines.length > 0) {
            turns.push({ speaker, minutes, seconds, text: textLines.join(" ") });
            textLines.length = 0;
          }
          const contSpeaker = contMatch[1];
          const contMin = parseInt(contMatch[2], 10);
          const contSec = parseInt(contMatch[3], 10);
          i++;
          const contTextLines: string[] = [];
          while (i < lines.length) {
            const cl = lines[i].trim();
            if (!cl) { i++; break; }
            if (INITIALS_RE.test(cl)) break;
            if (cl.match(CONTINUATION_RE)) break;
            const peek = i + 1 < lines.length ? lines[i + 1].trim() : "";
            if (peek.match(TIMESTAMP_HEADER_RE)) break;
            contTextLines.push(cl);
            i++;
          }
          if (contTextLines.length > 0) {
            turns.push({ speaker: contSpeaker, minutes: contMin, seconds: contSec, text: contTextLines.join(" ") });
          }
          continue;
        }
        const peekNext = i + 1 < lines.length ? lines[i + 1].trim() : "";
        if (peekNext.match(TIMESTAMP_HEADER_RE)) break;
        textLines.push(cur);
        i++;
      }
      if (textLines.length > 0) {
        turns.push({ speaker, minutes, seconds, text: textLines.join(" ") });
      }
    } else {
      i++;
    }
  }
  return turns;
}

function detectAndParse(content: string): Turn[] {
  const verbose = parseTeamsVerboseFormat(content);
  if (verbose.length > 0) return verbose;
  return parseDuplicateNameFormat(content);
}

function formatVttTimestamp(minutes: number, seconds: number): string {
  const h = String(Math.floor(minutes / 60)).padStart(2, "0");
  const m = String(minutes % 60).padStart(2, "0");
  const s = String(seconds).padStart(2, "0");
  return `${h}:${m}:${s}.000`;
}

function toWebVtt(turns: Turn[]): string {
  const lines = ["WEBVTT", ""];
  for (let i = 0; i < turns.length; i++) {
    const t = turns[i];
    const start = formatVttTimestamp(t.minutes, t.seconds);
    const next = turns[i + 1];
    const end = next
      ? formatVttTimestamp(next.minutes, next.seconds)
      : formatVttTimestamp(t.minutes, t.seconds + 30);
    lines.push(String(i + 1));
    lines.push(`${start} --> ${end}`);
    lines.push(`${t.speaker}: ${t.text}`);
    lines.push("");
  }
  return lines.join("\n");
}

const inputPath = process.argv[2];
if (!inputPath) {
  console.error("Usage: pnpm to-webvtt <input.txt> [output.vtt]");
  process.exit(1);
}

const content = readFileSync(inputPath, "utf-8");
const turns = detectAndParse(content);
if (turns.length === 0) {
  console.error("No speaker turns parsed from input file.");
  process.exit(1);
}

const outputPath = process.argv[3] ?? inputPath.replace(extname(inputPath), ".vtt");
const vtt = toWebVtt(turns);
writeFileSync(outputPath, vtt, "utf-8");
console.log(`Converted ${turns.length} turns → ${outputPath}`);
