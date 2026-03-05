import { createDb } from "./core/db.ts";
import { getArtifact } from "./core/extractor.ts";
import { deepSearch } from "./core/deep-search.ts";
import { createLlmAdapter } from "./core/llm-adapter.ts";
import { readFileSync } from "node:fs";

const db = createDb("db/meetings.db");
const art = getArtifact(db, "019caf11414c739fbffb4caeeab3ef7e");
console.log("artifact exists:", !!art);
if (art) {
  console.log("summary:", art.summary?.slice(0, 100));
}

const promptTemplate = readFileSync("config/prompts/deep-search.md", "utf8");
console.log("prompt loaded:", promptTemplate.length, "chars");

const llm = createLlmAdapter({ type: "stub" });
const results = await deepSearch(llm, db, ["019caf11414c739fbffb4caeeab3ef7e"], "Recurly commerce", promptTemplate);
console.log("stub results:", results.length, JSON.stringify(results, null, 2));

// Now with anthropic
const llmReal = createLlmAdapter({ type: "anthropic", apiKey: process.env.ANTHROPIC_API_KEY ?? "" });
console.log("\n--- Testing with real LLM ---");
const realResults = await deepSearch(llmReal, db, ["019caf11414c739fbffb4caeeab3ef7e"], "Recurly commerce", promptTemplate);
console.log("real results:", realResults.length, JSON.stringify(realResults, null, 2));
