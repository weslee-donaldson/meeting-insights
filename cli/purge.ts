import { rmSync, existsSync } from "node:fs";

process.loadEnvFile?.(".env.local");

const DB_PATH = process.env.MTNINSIGHTS_DB_PATH ?? "db/mtninsights.db";
const VECTOR_PATH = process.env.MTNINSIGHTS_VECTOR_PATH ?? "db/lancedb";

if (existsSync(DB_PATH)) {
  rmSync(DB_PATH);
  console.log(`✓ Deleted ${DB_PATH}`);
}

if (existsSync(VECTOR_PATH)) {
  rmSync(VECTOR_PATH, { recursive: true });
  console.log(`✓ Deleted ${VECTOR_PATH}`);
}

console.log("Purge complete. Run: pnpm setup");
