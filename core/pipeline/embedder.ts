import * as ort from "onnxruntime-node";
import { readFileSync } from "node:fs";
import { createLogger } from "../logger.js";

const log = createLogger("embed");

export type { InferenceSession } from "onnxruntime-node";

interface TokenizerData {
  model: {
    vocab: Record<string, number>;
    unk_token: string;
  };
  added_tokens: Array<{ id: number; content: string }>;
}

interface Tokenizer {
  vocab: Record<string, number>;
  unkId: number;
  clsId: number;
  sepId: number;
  padId: number;
}

function loadTokenizer(tokenizerPath: string): Tokenizer {
  const data: TokenizerData = JSON.parse(readFileSync(tokenizerPath, "utf-8"));
  const vocab = data.model.vocab;
  return {
    vocab,
    unkId: vocab[data.model.unk_token] ?? 100,
    clsId: vocab["[CLS]"] ?? 101,
    sepId: vocab["[SEP]"] ?? 102,
    padId: vocab["[PAD]"] ?? 0,
  };
}

function tokenize(tokenizer: Tokenizer, text: string, maxLen = 128): { inputIds: BigInt64Array; attentionMask: BigInt64Array; tokenTypeIds: BigInt64Array } {
  const lower = text.toLowerCase();
  const words = lower.split(/\s+/).filter(Boolean);
  const ids: number[] = [tokenizer.clsId];

  for (const word of words) {
    let remaining = word;
    let isFirst = true;
    while (remaining.length > 0) {
      let found = false;
      for (let end = remaining.length; end > 0; end--) {
        const sub = isFirst ? remaining.slice(0, end) : `##${remaining.slice(0, end)}`;
        if (sub in tokenizer.vocab) {
          ids.push(tokenizer.vocab[sub]);
          remaining = remaining.slice(end);
          isFirst = false;
          found = true;
          break;
        }
      }
      if (!found) {
        ids.push(tokenizer.unkId);
        break;
      }
    }
    if (ids.length >= maxLen - 1) break;
  }
  ids.push(tokenizer.sepId);

  const seqLen = Math.min(ids.length, maxLen);
  const inputIds = new BigInt64Array(seqLen).fill(BigInt(tokenizer.padId));
  const attentionMask = new BigInt64Array(seqLen).fill(0n);
  const tokenTypeIds = new BigInt64Array(seqLen).fill(0n);

  for (let i = 0; i < seqLen; i++) {
    inputIds[i] = BigInt(ids[i]);
    attentionMask[i] = 1n;
  }

  return { inputIds, attentionMask, tokenTypeIds };
}

function meanPooling(output: Float32Array, attentionMask: BigInt64Array, seqLen: number, hiddenSize: number): Float32Array {
  const pooled = new Float32Array(hiddenSize);
  let count = 0;
  for (let t = 0; t < seqLen; t++) {
    if (attentionMask[t] === 1n) {
      count++;
      for (let h = 0; h < hiddenSize; h++) {
        pooled[h] += output[t * hiddenSize + h];
      }
    }
  }
  for (let h = 0; h < hiddenSize; h++) pooled[h] /= count;

  let norm = 0;
  for (const v of pooled) norm += v * v;
  norm = Math.sqrt(norm);
  for (let h = 0; h < hiddenSize; h++) pooled[h] /= norm;

  return pooled;
}

export async function loadModel(modelPath: string, tokenizerPath: string): Promise<ort.InferenceSession & { _tokenizer: Tokenizer }> {
  const session = await ort.InferenceSession.create(modelPath) as ort.InferenceSession & { _tokenizer: Tokenizer };
  session._tokenizer = loadTokenizer(tokenizerPath);
  return session;
}

export async function embed(session: ort.InferenceSession & { _tokenizer: Tokenizer }, text: string): Promise<Float32Array> {
  const start = Date.now();
  const { inputIds, attentionMask, tokenTypeIds } = tokenize(session._tokenizer, text);
  const seqLen = inputIds.length;

  const feeds = {
    input_ids: new ort.Tensor("int64", inputIds, [1, seqLen]),
    attention_mask: new ort.Tensor("int64", attentionMask, [1, seqLen]),
    token_type_ids: new ort.Tensor("int64", tokenTypeIds, [1, seqLen]),
  };

  const results = await session.run(feeds);
  const outputKey = Object.keys(results)[0];
  const outputData = results[outputKey].data as Float32Array;
  const hiddenSize = outputData.length / seqLen;

  const vec = meanPooling(outputData, attentionMask, seqLen, hiddenSize);
  log("embedded %d chars in %dms", text.length, Date.now() - start);
  return vec;
}
