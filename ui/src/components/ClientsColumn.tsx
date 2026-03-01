import React from "react";
import { Circle } from "lucide-react";

interface Props {
  clients: string[];
  selected: string | null;
  onSelect: (name: string) => void;
}

export function ClientsColumn({ clients, selected, onSelect }: Props) {
  return (
    <ul className="py-1">
      {clients.map((name) => (
        <li key={name}>
          <button
            onClick={() => onSelect(name)}
            aria-selected={selected === name}
            className="w-full text-left px-3 py-2 text-sm flex items-center gap-2 transition-colors"
            style={{
              background: selected === name ? "var(--color-bg-elevated)" : "transparent",
              color: selected === name ? "var(--color-text-primary)" : "var(--color-text-secondary)",
            }}
          >
            <Circle
              className="w-2 h-2 shrink-0"
              style={{ color: selected === name ? "var(--color-accent)" : "var(--color-text-muted)" }}
              fill="currentColor"
            />
            {name}
          </button>
        </li>
      ))}
    </ul>
  );
}
