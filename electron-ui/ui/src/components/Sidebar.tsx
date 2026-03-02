import React from "react";
import { cn } from "../lib/utils.js";

interface SidebarProps {
  clients: string[];
  selected: string | null;
  onSelect: (name: string | null) => void;
}

export function Sidebar({ clients, selected, onSelect }: SidebarProps) {
  return (
    <div className="w-full h-full bg-card shrink-0">
      <ul className="list-none m-0 py-1">
        {clients.map((name) => (
          <li key={name}>
            <button
              onClick={() => onSelect(selected === name ? null : name)}
              aria-selected={selected === name}
              className={cn(
                "w-full text-left py-2 px-3 border-0 border-l-4 cursor-pointer text-sm",
                selected === name
                  ? "border-l-primary bg-secondary text-foreground"
                  : "border-l-transparent bg-transparent text-secondary-foreground",
              )}
            >
              {name}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
