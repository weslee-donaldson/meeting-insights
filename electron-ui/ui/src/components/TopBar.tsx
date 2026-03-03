import React from "react";
import * as Select from "@radix-ui/react-select";
import { ChevronDown, RotateCcw, Sun, Moon, Droplets } from "lucide-react";
import type { ThemeName, Theme } from "../theme.js";
import { SearchBar } from "./SearchBar.js";
import type { SearchResultRow } from "../../../electron/channels.js";
import { Button } from "./ui/button.js";

interface TopBarProps {
  clients: string[];
  selectedClient: string | null;
  dateRange: { after: string; before: string };
  searchQuery: string;
  onClientChange: (name: string | null) => void;
  onDateChange: (field: "after" | "before", value: string) => void;
  onSearchQueryChange: (q: string) => void;
  onReset: () => void;
  onSelectSearchResults: (results: SearchResultRow[]) => void;
  theme: ThemeName;
  setTheme: (name: ThemeName) => void;
  themes: Theme[];
}

const THEME_ICONS: Record<ThemeName, React.ReactNode> = {
  "deep-sea": <Droplets className="w-3.5 h-3.5" />,
  "daylight": <Sun className="w-3.5 h-3.5" />,
  "midnight": <Moon className="w-3.5 h-3.5" />,
};

export function TopBar({
  clients,
  selectedClient,
  dateRange,
  searchQuery,
  onClientChange,
  onDateChange,
  onSearchQueryChange,
  onReset,
  onSelectSearchResults,
  theme,
  setTheme,
  themes,
}: TopBarProps) {
  function cycleTheme() {
    const idx = themes.findIndex((t) => t.name === theme);
    const next = themes[(idx + 1) % themes.length];
    setTheme(next.name);
  }

  return (
    <div className="flex flex-col gap-1 px-4 py-2 bg-card border-b border-border shrink-0">
      <span className="text-muted-foreground text-xs">Start by selecting a client</span>
      <div className="flex items-center gap-3">
      <span className="text-muted-foreground text-sm">Client</span>
      <Select.Root
        value={selectedClient ?? "__all"}
        onValueChange={(v) => onClientChange(v === "__all" ? null : v)}
      >
        <Select.Trigger
          className="flex items-center gap-1 px-2 py-1 rounded min-w-[120px] bg-input text-foreground border border-border"
          aria-label="Client"
        >
          <Select.Value placeholder="All Clients" />
          <ChevronDown className="w-3 h-3 ml-auto text-muted-foreground" />
        </Select.Trigger>
        <Select.Portal>
          <Select.Content className="rounded shadow-xl z-50 bg-secondary border border-border">
            <Select.Viewport className="p-1">
              <Select.Item
                value="__all"
                className="px-3 py-1.5 rounded cursor-pointer focus:outline-none text-secondary-foreground"
              >
                <Select.ItemText>All Clients</Select.ItemText>
              </Select.Item>
              {clients.map((c) => (
                <Select.Item
                  key={c}
                  value={c}
                  className="px-3 py-1.5 rounded cursor-pointer focus:outline-none text-foreground"
                >
                  <Select.ItemText>{c}</Select.ItemText>
                </Select.Item>
              ))}
            </Select.Viewport>
          </Select.Content>
        </Select.Portal>
      </Select.Root>

      <span className="text-muted-foreground text-sm">From</span>
      <input
        type="date"
        value={dateRange.after}
        onChange={(e) => onDateChange("after", e.target.value)}
        className="px-2 py-1 rounded focus:outline-none bg-input text-foreground border border-border text-sm"
        aria-label="After date"
      />
      <span className="text-muted-foreground text-sm">to</span>
      <input
        type="date"
        value={dateRange.before}
        onChange={(e) => onDateChange("before", e.target.value)}
        className="px-2 py-1 rounded focus:outline-none bg-input text-foreground border border-border text-sm"
        aria-label="Before date"
      />

      <div className="ml-auto">
        <SearchBar
          query={searchQuery}
          onQueryChange={onSearchQueryChange}
          client={selectedClient ?? undefined}
          onSelectResults={onSelectSearchResults}
        />
      </div>

      <Button
        variant="ghost"
        size="sm"
        onClick={onReset}
        aria-label="Reset"
      >
        <RotateCcw className="w-3 h-3" />
        <span>Reset</span>
      </Button>

      <Button
        variant="ghost"
        size="icon"
        onClick={cycleTheme}
        aria-label={`Theme: ${theme}`}
        title={`Switch theme (current: ${themes.find((t) => t.name === theme)?.label})`}
      >
        {THEME_ICONS[theme]}
      </Button>
      </div>
    </div>
  );
}
