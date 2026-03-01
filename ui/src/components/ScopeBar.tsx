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

  const inputStyle = {
    background: "var(--color-bg-input)",
    color: "var(--color-text-primary)",
    border: "1px solid var(--color-border)",
  };

  const mutedStyle = { color: "var(--color-text-muted)" };
  const iconButtonStyle = { color: "var(--color-text-secondary)" };

  return (
    <div
      className="flex items-center gap-3 px-4 py-2 text-sm shrink-0 border-b"
      style={{ background: "var(--color-bg-panel)", borderColor: "var(--color-border)" }}
    >
      <span className="font-medium" style={mutedStyle}>Scope:</span>

      <Select.Root
        value={selectedClient ?? "__all"}
        onValueChange={(v) => onClientChange(v === "__all" ? "" : v)}
      >
        <Select.Trigger
          className="flex items-center gap-1 px-2 py-1 rounded min-w-[120px]"
          style={{ background: "var(--color-bg-input)", color: "var(--color-text-primary)", border: "1px solid var(--color-border)" }}
          aria-label="Client"
        >
          <Select.Value placeholder="All Clients" />
          <ChevronDown className="w-3 h-3 ml-auto" style={mutedStyle} />
        </Select.Trigger>
        <Select.Portal>
          <Select.Content
            className="rounded shadow-xl z-50"
            style={{ background: "var(--color-bg-elevated)", border: "1px solid var(--color-border)" }}
          >
            <Select.Viewport className="p-1">
              <Select.Item
                value="__all"
                className="px-3 py-1.5 rounded cursor-pointer focus:outline-none"
                style={{ color: "var(--color-text-secondary)" }}
              >
                <Select.ItemText>All Clients</Select.ItemText>
              </Select.Item>
              {clients.map((c) => (
                <Select.Item
                  key={c}
                  value={c}
                  className="px-3 py-1.5 rounded cursor-pointer focus:outline-none"
                  style={{ color: "var(--color-text-primary)" }}
                >
                  <Select.ItemText>{c}</Select.ItemText>
                </Select.Item>
              ))}
            </Select.Viewport>
          </Select.Content>
        </Select.Portal>
      </Select.Root>

      <span style={mutedStyle}>From</span>
      <input
        type="date"
        value={dateRange.after}
        onChange={(e) => onDateChange({ ...dateRange, after: e.target.value })}
        className="px-2 py-1 rounded focus:outline-none"
        style={inputStyle}
        aria-label="After date"
      />
      <span style={mutedStyle}>to</span>
      <input
        type="date"
        value={dateRange.before}
        onChange={(e) => onDateChange({ ...dateRange, before: e.target.value })}
        className="px-2 py-1 rounded focus:outline-none"
        style={inputStyle}
        aria-label="Before date"
      />

      <button
        onClick={onReset}
        className="flex items-center gap-1 px-2 py-1 rounded ml-auto"
        style={iconButtonStyle}
        aria-label="Reset"
      >
        <RotateCcw className="w-3 h-3" />
        <span>Reset</span>
      </button>

      <button
        onClick={cycleTheme}
        className="flex items-center gap-1 px-2 py-1 rounded"
        style={iconButtonStyle}
        aria-label={`Theme: ${theme}`}
        title={`Switch theme (current: ${themes.find((t) => t.name === theme)?.label})`}
      >
        {THEME_ICONS[theme]}
      </button>
    </div>
  );
}
