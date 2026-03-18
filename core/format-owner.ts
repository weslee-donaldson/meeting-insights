import type { DensityMode } from "../electron-ui/ui/src/components/shared/density-toggle.js";

export function formatOwner(name: string | undefined, mode: DensityMode): string {
  if (!name) return "";
  const trimmed = name.trim();
  if (!trimmed) return "";
  if (mode === "comfortable") return trimmed;

  const parts = trimmed.split(/\s+/);

  if (mode === "compact") {
    if (parts.length === 1) return parts[0];
    return `${parts[0]} ${parts[1][0].toUpperCase()}.`;
  }

  return parts.slice(0, 2).map((p) => p[0].toUpperCase()).join("");
}
