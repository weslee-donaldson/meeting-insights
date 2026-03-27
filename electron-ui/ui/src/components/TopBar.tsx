import React from "react";
import { Sun, Moon, Palette, Leaf } from "lucide-react";
import type { ThemeName, Theme } from "../theme.js";
import { WorkspaceBanner } from "./shared/workspace-banner.js";

interface TopBarProps {
  clients: string[];
  selectedClient: string | null;
  dateRange: { after: string; before: string };
  searchQuery: string;
  onClientChange: (name: string | null) => void;
  onDateChange: (field: "after" | "before", value: string) => void;
  onSearchQueryChange: (q: string) => void;
  onSubmitSearch: (q: string) => void;
  onSearchNavigate?: (query: string) => void;
  deepSearchEnabled?: boolean;
  onDeepSearchToggle?: (enabled: boolean) => void;
  onReset: () => void;
  theme: ThemeName;
  setTheme: (name: ThemeName) => void;
  themes: Theme[];
  stats?: { meetings: number; actionItems: number; threads: number };
}

const THEME_ICONS: Record<ThemeName, React.ReactNode> = {
  "stone-light": <Sun className="w-3.5 h-3.5" />,
  "stone-dark": <Moon className="w-3.5 h-3.5" />,
  "teal-light": <Leaf className="w-3.5 h-3.5" />,
  "teal-dark": <Palette className="w-3.5 h-3.5" />,
};

export function TopBar({
  clients,
  selectedClient,
  dateRange,
  searchQuery,
  onClientChange,
  onDateChange,
  onSearchQueryChange,
  onSubmitSearch,
  onSearchNavigate,
  deepSearchEnabled,
  onDeepSearchToggle,
  onReset,
  theme,
  setTheme,
  themes,
  stats,
}: TopBarProps) {
  function cycleTheme() {
    const idx = themes.findIndex((t) => t.name === theme);
    const next = themes[(idx + 1) % themes.length];
    setTheme(next.name);
  }

  return (
    <div className="flex items-stretch shrink-0">
      <WorkspaceBanner
        clientName={selectedClient}
        clients={clients}
        onClientChange={onClientChange}
        stats={stats}
        searchQuery={searchQuery}
        onSearchQueryChange={onSearchQueryChange}
        onSubmitSearch={onSubmitSearch}
        onSearchNavigate={onSearchNavigate}
        dateRange={dateRange}
        onDateChange={onDateChange}
        deepSearchEnabled={deepSearchEnabled}
        onDeepSearchToggle={onDeepSearchToggle}
        onReset={onReset}
        className="flex-1"
      />
      <div className="flex items-start px-2 py-2.5 bg-[var(--color-bg-surface)] border-b border-[var(--color-line)]">
        <button
          onClick={cycleTheme}
          aria-label={`Theme: ${theme}`}
          title={`Switch theme (current: ${themes.find((t) => t.name === theme)?.label})`}
          className="p-1.5 rounded-md text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] bg-transparent border-0 cursor-pointer transition-colors"
        >
          {THEME_ICONS[theme]}
        </button>
      </div>
    </div>
  );
}
