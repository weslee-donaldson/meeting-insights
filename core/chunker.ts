import { createLogger } from "./logger.js";
import type { SpeakerTurn } from "./parser.js";

const log = createLogger("extract:chunk");

function estimateTokens(turn: SpeakerTurn): number {
  return Math.ceil((turn.speaker_name.length + turn.text.length) / 4);
}

export function chunkTranscript(turns: SpeakerTurn[], tokenLimit: number): SpeakerTurn[][] {
  const chunks: SpeakerTurn[][] = [];
  let current: SpeakerTurn[] = [];
  let currentTokens = 0;

  for (const turn of turns) {
    const tokens = estimateTokens(turn);
    if (current.length > 0 && currentTokens + tokens > tokenLimit) {
      chunks.push(current);
      current = [];
      currentTokens = 0;
    }
    current.push(turn);
    currentTokens += tokens;
  }
  if (current.length > 0) chunks.push(current);

  log("split into %d chunks", chunks.length);
  return chunks;
}
