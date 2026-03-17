export type ThemeName = "stone-light" | "stone-dark" | "teal-light" | "teal-dark";

export interface Theme {
  name: ThemeName;
  label: string;
}

export const themes: Theme[] = [
  { name: "stone-light", label: "Stone Light" },
  { name: "stone-dark", label: "Stone Dark" },
  { name: "teal-light", label: "Teal Light" },
  { name: "teal-dark", label: "Teal Dark" },
];

export const DEFAULT_THEME: ThemeName = "stone-light";
