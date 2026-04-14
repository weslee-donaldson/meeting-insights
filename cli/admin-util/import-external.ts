import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync, statSync } from "node:fs";
import { join, basename, extname } from "node:path";
import { randomUUID } from "node:crypto";
import { resolveDataPaths } from "../../core/paths.js";

const dataPaths = resolveDataPaths(process.env.MTNINSIGHTS_DATA_DIR);
const EXTERNAL_DIR = dataPaths.manual.externalTranscripts;
const RAW_DIR = dataPaths.manual.rawTranscripts;
const MANIFEST_PATH = join(RAW_DIR, "manifest.json");

interface ExternalTurn {
  speaker: string;
  timestamp: string;
  lines: string[];
}

function parseExternalTranscript(content: string): ExternalTurn[] {
  const lines = content.split("\n");
  const turns: ExternalTurn[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i].trim();
    if (!line) { i++; continue; }

    const nextLine = i + 1 < lines.length ? lines[i + 1].trim() : "";
    if (nextLine === line) {
      const speaker = line;
      i += 2;
      const timestampLine = i < lines.length ? lines[i].trim() : "";
      const tsMatch = timestampLine.match(/^(\d{1,2}:\d{2})$/);
      if (!tsMatch) { i++; continue; }
      const timestamp = tsMatch[1].padStart(5, "0");
      i++;

      const textLines: string[] = [];
      while (i < lines.length) {
        const cur = lines[i].trim();
        if (!cur) { i++; continue; }
        const peek = i + 1 < lines.length ? lines[i + 1].trim() : "";
        if (peek === cur) break;
        textLines.push(cur);
        i++;
      }
      turns.push({ speaker, timestamp, lines: textLines });
    } else {
      i++;
    }
  }
  return turns;
}

function toKrispMarkdown(title: string, dateStr: string, turns: ExternalTurn[]): string {
  const date = new Date(dateStr);
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const header = `# ${title} - ${monthNames[date.getMonth()]}, ${date.getDate()}`;

  const transcriptLines = turns.map((t) => {
    const text = t.lines.join("\n");
    return `**${t.speaker} | ${t.timestamp}**\n${text}`;
  });

  return `${header}\n\n# Transcript\n${transcriptLines.join("\n\n")}\n`;
}

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");
}

function titleFromFilename(filename: string): string {
  return basename(filename, extname(filename))
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function main() {
  if (!existsSync(EXTERNAL_DIR)) {
    console.error(`External transcripts directory not found: ${EXTERNAL_DIR}`);
    process.exit(1);
  }

  const files = readdirSync(EXTERNAL_DIR).filter((f) => f.endsWith(".txt"));
  if (files.length === 0) {
    console.log("No .txt files found in", EXTERNAL_DIR);
    return;
  }

  const manifest: Array<{ meeting_id: string; meeting_title: string; meeting_date: string; meeting_files: string[] }> = existsSync(MANIFEST_PATH)
    ? JSON.parse(readFileSync(MANIFEST_PATH, "utf-8"))
    : [];

  const existingTitles = new Set(manifest.map((e) => e.meeting_title));
  let imported = 0;

  for (const file of files) {
    const filePath = join(EXTERNAL_DIR, file);
    const title = titleFromFilename(file);

    if (existingTitles.has(title)) {
      console.log(`  skip: "${title}" already in manifest`);
      continue;
    }

    const content = readFileSync(filePath, "utf-8");
    const turns = parseExternalTranscript(content);
    if (turns.length === 0) {
      console.log(`  skip: ${file} — no speaker turns parsed`);
      continue;
    }

    const meetingDate = statSync(filePath).mtime.toISOString();
    const meetingId = randomUUID().replace(/-/g, "");
    const folderName = `${slugify(title)}-${meetingId}`;
    const folderPath = join(RAW_DIR, folderName);

    mkdirSync(folderPath, { recursive: true });

    writeFileSync(join(folderPath, "transcript.md"), toKrispMarkdown(title, meetingDate, turns), "utf-8");

    const recordingPlaceholder = [
      `# ${title}`,
      "",
      "No recording available (imported from external transcript).",
      "",
    ].join("\n");
    writeFileSync(join(folderPath, "recording_download_link.md"), recordingPlaceholder, "utf-8");

    manifest.unshift({
      meeting_id: meetingId,
      meeting_title: title,
      meeting_date: meetingDate,
      meeting_files: [
        `${folderName}/transcript.md`,
        `${folderName}/recording_download_link.md`,
      ],
    });

    console.log(`  imported: ${file} → ${folderName}/ (${turns.length} turns)`);
    imported++;
  }

  writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + "\n", "utf-8");
  console.log(`\nDone. Imported ${imported} of ${files.length} file(s). Run "pnpm process" to process them.`);
}

main();
