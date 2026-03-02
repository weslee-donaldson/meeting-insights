import React from "react";

interface SidebarProps {
  clients: string[];
  selected: string | null;
  onSelect: (name: string) => void;
}

export function Sidebar({ clients, selected, onSelect }: SidebarProps) {
  return (
    <div
      style={{
        width: "240px",
        height: "100%",
        background: "var(--color-bg-panel)",
        flexShrink: 0,
      }}
    >
      <ul style={{ listStyle: "none", margin: 0, padding: "4px 0" }}>
        {clients.map((name) => (
          <li key={name}>
            <button
              onClick={() => onSelect(name)}
              aria-selected={selected === name}
              style={{
                width: "100%",
                textAlign: "left",
                padding: "8px 12px",
                border: "none",
                borderLeft: selected === name
                  ? "4px solid var(--color-accent)"
                  : "4px solid transparent",
                background: selected === name
                  ? "var(--color-bg-elevated)"
                  : "transparent",
                color: selected === name
                  ? "var(--color-text-primary)"
                  : "var(--color-text-secondary)",
                cursor: "pointer",
                fontSize: "0.875rem",
              }}
            >
              {name}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
