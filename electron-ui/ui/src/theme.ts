export type ThemeName = "deep-sea" | "daylight" | "midnight";

export interface Theme {
  name: ThemeName;
  label: string;
}

export const themes: Theme[] = [
  { name: "deep-sea", label: "Deep Sea" },
  { name: "daylight", label: "Daylight" },
  { name: "midnight", label: "Midnight" },
];

export const DEFAULT_THEME: ThemeName = "deep-sea";
