export function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

export function l2ToCosineSim(l2Distance: number): number {
  return 1 - (l2Distance * l2Distance) / 2;
}

export function isSemanticDuplicate(
  l2Distance: number,
  threshold = 0.85,
): boolean {
  return l2ToCosineSim(l2Distance) >= threshold;
}
