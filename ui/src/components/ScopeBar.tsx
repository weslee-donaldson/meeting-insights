import React from "react";
import * as Select from "@radix-ui/react-select";
import { ChevronDown, RotateCcw, Sun, Moon, Droplets } from "lucide-react";
import type { ThemeName, Theme } from "../theme.js";

interface DateRange {
  after: string;
  before: string;
}

interface Props {
  clients: string[];
  selectedClient: string | null;
  dateRange: DateRange;
  onClientChange: (name: string) => void;
  onDateChange: (range: DateRange) => void;
  onReset: () => void;
  theme: ThemeName;
  setTheme: (name: ThemeName) => void;
  themes: Theme[];
}

const THEME_ICONS: Record<ThemeName, React.ReactNode> = {
  "deep-sea": <Droplets className="w-3.5 h-3.5" />,
  "daylight":  <Sun className="w-3.5 h-3.5" />,
  "midnight":  <Moon className="w-3.5 h-3.5" />,
};

export function ScopeBar({
  clients,
  selectedClient,
  dateRange,
  onClientChange,
  onDateChange,
  onReset,
  theme,
  setTheme,
  themes,
}: Props) {
  function cycleTheme() {
    const idx = themes.findIndex((t) => t.name === theme);
    const next = themes[(idx + 1) % themes.length];
    setTheme(next.name);
  }

  return (
    <div className="flex items-center gap-3 px-4 py-2 bg-zinc-900 border-b border-zinc-800 text-sm shrink-0">
      <span className="text-zinc-500 font-medium">Scope:</span>

      <Select.Root
        value={selectedClient ?? "__all"}
        onValueChange={(v) => onClientChange(v === "__all" ? "" : v)}
      >
        <Select.Trigger
          className="flex items-center gap-1 px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-100 min-w-[120px]"
          aria-label="Client"
        >
          <Select.Value placeholder="All Clients" />
          <ChevronDown className="w-3 h-3 text-zinc-400 ml-auto" />
        </Select.Trigger>
        <Select.Portal>
          <Select.Content className="bg-zinc-800 rounded shadow-xl border border-zinc-700 z-50">
            <Select.Viewport className="p-1">
              <Select.Item
                value="__all"
                className="px-3 py-1.5 rounded cursor-pointer text-zinc-300 hover:bg-zinc-700 focus:outline-none"
              >
                <Select.ItemText>All Clients</Select.ItemText>
              </Select.Item>
              {clients.map((c) => (
                <Select.Item
                  key={c}
                  value={c}
                  className="px-3 py-1.5 rounded cursor-pointer text-zinc-100 hover:bg-zinc-700 focus:outline-none"
                >
                  <Select.ItemText>{c}</Select.ItemText>
                </Select.Item>
              ))}
            </Select.Viewport>
          </Select.Content>
        </Select.Portal>
      </Select.Root>

      <span className="text-zinc-500">From</span>
      <input
        type="date"
        value={dateRange.after}
        onChange={(e) => onDateChange({ ...dateRange, after: e.target.value })}
        className="px-2 py-1 rounded bg-zinc-800 text-zinc-100 border border-zinc-700 focus:outline-none focus:border-zinc-500"
        aria-label="After date"
      />
      <span className="text-zinc-500">to</span>
      <input
        type="date"
        value={dateRange.before}
        onChange={(e) => onDateChange({ ...dateRange, before: e.target.value })}
        className="px-2 py-1 rounded bg-zinc-800 text-zinc-100 border border-zinc-700 focus:outline-none focus:border-zinc-500"
        aria-label="Before date"
      />

      <button
        onClick={onReset}
        className="flex items-center gap-1 px-2 py-1 rounded text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 ml-auto"
        aria-label="Reset"
      >
        <RotateCcw className="w-3 h-3" />
        <span>Reset</span>
      </button>

      <button
        onClick={cycleTheme}
        className="flex items-center gap-1 px-2 py-1 rounded text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
        aria-label={`Theme: ${theme}`}
        title={`Switch theme (current: ${themes.find((t) => t.name === theme)?.label})`}
      >
        {THEME_ICONS[theme]}
      </button>
    </div>
  );
}
