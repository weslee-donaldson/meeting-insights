import { createHash } from "node:crypto";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join } from "node:path";

export const MODEL_URLS: Record<string, string> = {
  "all-MiniLM-L6-v2.onnx":
    "https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2/resolve/main/onnx/model.onnx",
  "tokenizer.json":
    "https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2/resolve/main/tokenizer.json",
};

export const MODEL_HASHES: Record<string, string> = {
  "all-MiniLM-L6-v2.onnx": "6fd5d72fe4589f189f8ebc006442dbb529bb7ce38f8082112682524616046452",
  "tokenizer.json": "be50c3628f2bf5bb5e3a7f17b1f74611b2561a3a27eeab05e5aa30f411572037",
};

export function getModelUrls(): Record<string, string> {
  return { ...MODEL_URLS };
}

export async function verifyHash(filePath: string, expectedHash: string): Promise<boolean> {
  const buf = readFileSync(filePath);
  const actual = createHash("sha256").update(buf).digest("hex");
  return actual === expectedHash;
}

export interface DownloadOptions {
  hashes?: Record<string, string>;
  urls?: Record<string, string>;
  fetch?: typeof globalThis.fetch;
  onProgress?: (filename: string, status: "skip" | "download" | "done") => void;
}

export async function downloadIfMissing(modelDir: string, options: DownloadOptions = {}): Promise<void> {
  const hashes = options.hashes ?? MODEL_HASHES;
  const urls = options.urls ?? MODEL_URLS;
  const fetchFn = options.fetch ?? globalThis.fetch;
  const onProgress = options.onProgress ?? (() => {});

  if (!existsSync(modelDir)) mkdirSync(modelDir, { recursive: true });

  for (const [filename, expectedHash] of Object.entries(hashes)) {
    const filePath = join(modelDir, filename);

    if (existsSync(filePath) && (await verifyHash(filePath, expectedHash))) {
      onProgress(filename, "skip");
      continue;
    }

    const url = urls[filename];
    if (!url) throw new Error(`no URL configured for ${filename}`);

    onProgress(filename, "download");
    const res = await fetchFn(url);
    if (!res.ok) throw new Error(`download failed for ${filename}: HTTP ${res.status}`);

    const buf = Buffer.from(await res.arrayBuffer());
    writeFileSync(filePath, buf);

    if (!(await verifyHash(filePath, expectedHash))) {
      throw new Error(`hash mismatch after download for ${filename}`);
    }
    onProgress(filename, "done");
  }
}

const isDirectRun = process.argv[1] && import.meta.url.endsWith(process.argv[1].replace(/^.*\//, ""));
if (isDirectRun) {
  const modelDir = process.env.MTNINSIGHTS_MODEL_DIR ?? "models";
  await downloadIfMissing(modelDir, {
    onProgress: (file, status) => {
      if (status === "skip") console.log(`✓ ${file} (already present)`);
      if (status === "download") console.log(`↓ ${file} (downloading...)`);
      if (status === "done") console.log(`✓ ${file} (verified)`);
    },
  });
  console.log("Models ready.");
}
