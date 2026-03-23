import React, { useState } from "react";

interface ShowMoreProps {
  children: React.ReactNode;
  lineClamp?: number;
}

export function ShowMore({ children, lineClamp = 4 }: ShowMoreProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div data-testid="show-more">
      <div
        style={expanded ? undefined : {
          display: "-webkit-box",
          WebkitLineClamp: lineClamp,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
      >
        {children}
      </div>
      <button
        onClick={() => setExpanded(!expanded)}
        className="text-[12px] text-[var(--color-accent)] bg-transparent border-0 cursor-pointer mt-1"
        data-testid="show-more-toggle"
      >
        {expanded ? "Show less" : "Show more"}
      </button>
    </div>
  );
}
