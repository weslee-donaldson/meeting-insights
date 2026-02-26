import { mkdirSync } from "node:fs";
import { createDb, migrate } from "../src/db.js";
import { connectVectorDb, createMeetingTable, createFeatureTable } from "../src/vector-db.js";
import { seedClients, getAllClients } from "../src/client-registry.js";

process.loadEnvFile?.(".env.local");

const DB_PATH = process.env.MTNINSIGHTS_DB_PATH ?? "db/mtninsights.db";
const VECTOR_PATH = process.env.MTNINSIGHTS_VECTOR_PATH ?? "db/lancedb";

mkdirSync("db", { recursive: true });

const db = createDb(DB_PATH);
migrate(db);
seedClients(db, "data/clients/clients.json");

const vdb = await connectVectorDb(VECTOR_PATH);
await createMeetingTable(vdb);
await createFeatureTable(vdb);

const clientCount = getAllClients(db).length;
const meetingCount = (db.prepare("SELECT COUNT(*) as n FROM meetings").get() as { n: number }).n;

console.log(`✓ DB initialized at ${DB_PATH}`);
console.log(`✓ ${clientCount} clients seeded`);
console.log(`✓ ${meetingCount} meetings in DB`);
console.log(`✓ LanceDB ready at ${VECTOR_PATH}`);
