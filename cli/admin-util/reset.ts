import { rmSync, existsSync, readdirSync, renameSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { loadCliConfig } from "./shared.js";
import { resolveDataPaths } from "../../core/paths.js";

const { dbPath: DB_PATH, vectorPath: VECTOR_PATH } = loadCliConfig();
const dataPaths = resolveDataPaths(process.env.MTNINSIGHTS_DATA_DIR);
const RAW_DIR = dataPaths.manual.rawTranscripts;
const PROCESSED_DIR = dataPaths.manual.processed;
const FAILED_DIR = dataPaths.manual.failed;

if (existsSync(DB_PATH)) {
  rmSync(DB_PATH);
  console.log(`✓ Deleted ${DB_PATH}`);
}

if (existsSync(VECTOR_PATH)) {
  rmSync(VECTOR_PATH, { recursive: true });
  console.log(`✓ Deleted ${VECTOR_PATH}`);
}

mkdirSync(RAW_DIR, { recursive: true });

for (const dir of [PROCESSED_DIR, FAILED_DIR]) {
  if (!existsSync(dir)) continue;
  const files = readdirSync(dir);
  for (const f of files) {
    renameSync(join(dir, f), join(RAW_DIR, f));
  }
  if (files.length > 0) console.log(`✓ Restored ${files.length} files from ${dir}`);
}

console.log("Reset complete. Run: pnpm setup");
