import React from "react";

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function HighlightText({ text, terms }: { text: string; terms: string[] }) {
  if (terms.length === 0) return <>{text}</>;

  const pattern = new RegExp(`(${terms.map(escapeRegex).join("|")})`, "gi");
  const parts = text.split(pattern);

  return (
    <>
      {parts.map((part, i) =>
        pattern.test(part) ? (
          <mark key={i} className="bg-yellow-200/50 text-inherit rounded-sm px-0.5">{part}</mark>
        ) : (
          <React.Fragment key={i}>{part}</React.Fragment>
        ),
      )}
    </>
  );
}
