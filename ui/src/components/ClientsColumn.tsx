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
            className={`w-full text-left px-3 py-2 text-sm flex items-center gap-2 transition-colors ${
              selected === name
                ? "bg-zinc-800 text-zinc-100"
                : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100"
            }`}
          >
            <Circle
              className={`w-2 h-2 shrink-0 ${selected === name ? "text-blue-400" : "text-zinc-700"}`}
              fill="currentColor"
            />
            {name}
          </button>
        </li>
      ))}
    </ul>
  );
}
