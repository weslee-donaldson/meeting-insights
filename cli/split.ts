import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
import type { DatabaseSync as Database } from "node:sqlite";
import { splitMeeting } from "../core/meetings/split.js";

export async function runSplit(db: Database, meetingId: string, durations: number[]): Promise<string> {
  const result = await splitMeeting(db, meetingId, durations);
  const N = result.segments.length;
  const sourceTitle = result.segments[0].title.replace(/ \(\d+ of \d+\)$/, "");
  const lines = [`Split meeting "${sourceTitle}" into ${N} segments:`];
  for (const seg of result.segments) {
    lines.push(
      `  ${seg.segment_index} of ${N}: ${seg.meeting_id.slice(0, 8)}  "${seg.title}"  turns: ${seg.turn_count}  ${seg.actual_start}-${seg.actual_end}  (requested: ${seg.requested_duration}m, actual: ${seg.actual_duration}m)`,
    );
  }
  lines.push("Original meeting archived (ignored=1)");
  lines.push("Run pipeline to extract insights for new meetings.");
  return lines.join("\n");
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const meetingId = process.argv[2];
  const durationsFlag = process.argv.indexOf("--durations");

  if (!meetingId) {
    console.error("Usage: pnpm cli split <meeting-id> --durations 60,15,15");
    process.exit(1);
  }

  if (durationsFlag === -1 || !process.argv[durationsFlag + 1]) {
    console.error("Error: --durations flag is required (e.g. --durations 60,30)");
    process.exit(1);
  }

  const rawDurations = process.argv[durationsFlag + 1].split(",").map(Number);
  if (rawDurations.some((d) => isNaN(d) || d <= 0)) {
    console.error("Error: durations must be positive numbers");
    process.exit(1);
  }

  const { createDb, migrate } = await import("../core/db.js");
  const { loadCliConfig } = await import("./admin-util/shared.js");
  const config = loadCliConfig();
  const db = createDb(resolve(config.dbPath));
  migrate(db);

  try {
    console.log(await runSplit(db, meetingId, rawDurations));
  } catch (err) {
    console.error(`Error: ${(err as Error).message}`);
    process.exit(1);
  }
}
