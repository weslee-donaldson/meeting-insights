import React from "react";

interface MobileListHeaderProps {
  title: string;
  subtitle?: string;
  onNew?: () => void;
  newLabel?: string;
  filterSlot?: React.ReactNode;
}

export function MobileListHeader({ title, subtitle, onNew, newLabel = "+ New", filterSlot }: MobileListHeaderProps) {
  return (
    <div data-testid="mobile-list-header">
      <div className="flex items-center justify-between px-4 py-3">
        <div>
          <h1
            className="text-[20px] font-bold text-[var(--color-text-primary)]"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            {title}
          </h1>
          {subtitle && (
            <p className="text-[12px] text-[var(--color-text-secondary)] mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
        {onNew && (
          <button
            onClick={onNew}
            className="text-[13px] font-semibold text-[var(--color-accent)] bg-transparent border-0 cursor-pointer shrink-0"
            aria-label={newLabel}
          >
            {newLabel}
          </button>
        )}
      </div>
      {filterSlot && (
        <div className="flex items-center gap-2 px-4 pb-2 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
          {filterSlot}
        </div>
      )}
    </div>
  );
}
