import { useState } from "react";
import type { DensityMode } from "../components/shared/density-toggle.js";

const STORAGE_KEY = "mtninsights-density";
const VALID_MODES: DensityMode[] = ["comfortable", "compact", "dense"];

export function useDensity(): [DensityMode, (mode: DensityMode) => void] {
  const [mode, setModeState] = useState<DensityMode>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && VALID_MODES.includes(saved as DensityMode)) {
      return saved as DensityMode;
    }
    return "comfortable";
  });

  function setMode(next: DensityMode) {
    setModeState(next);
    localStorage.setItem(STORAGE_KEY, next);
  }

  return [mode, setMode];
}
