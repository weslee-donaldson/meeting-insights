import { rmSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { loadCliConfig } from "./shared.js";

const { dbPath: DB_PATH, vectorPath: VECTOR_PATH } = loadCliConfig();

const meetingId = process.argv[2];

if (meetingId) {
  const { createDb, migrate } = await import("../../core/db.js");
  const db = createDb(resolve(DB_PATH));
  migrate(db);

  db.prepare("DELETE FROM item_mentions WHERE meeting_id = ?").run(meetingId);
  db.prepare("DELETE FROM action_item_completions WHERE meeting_id = ?").run(meetingId);
  db.prepare("DELETE FROM meeting_clusters WHERE meeting_id = ?").run(meetingId);
  db.prepare("DELETE FROM client_detections WHERE meeting_id = ?").run(meetingId);
  db.prepare("DELETE FROM artifacts WHERE meeting_id = ?").run(meetingId);
  db.prepare("DELETE FROM meetings WHERE id = ?").run(meetingId);
  console.log(`✓ Deleted SQL records for meeting ${meetingId}`);

  if (existsSync(VECTOR_PATH)) {
    const { connectVectorDb } = await import("../../core/vector-db.js");
    const vdb = await connectVectorDb(resolve(VECTOR_PATH));
    const filter = `meeting_id = '${meetingId.replace(/'/g, "''")}'`;
    const names = await vdb.tableNames();
    const targets = ["meeting_vectors", "feature_vectors", "item_vectors"].filter((n) => names.includes(n));
    for (const name of targets) {
      const table = await vdb.openTable(name);
      await table.delete(filter);
    }
    if (targets.length > 0) {
      console.log(`✓ Deleted vectors from ${targets.join(", ")}`);
    }
  }

  console.log(`Purge complete for meeting ${meetingId}`);
} else {
  if (existsSync(DB_PATH)) {
    rmSync(DB_PATH);
    console.log(`✓ Deleted ${DB_PATH}`);
  }

  if (existsSync(VECTOR_PATH)) {
    rmSync(VECTOR_PATH, { recursive: true });
    console.log(`✓ Deleted ${VECTOR_PATH}`);
  }

  console.log("Purge complete. Run: pnpm setup");
}
