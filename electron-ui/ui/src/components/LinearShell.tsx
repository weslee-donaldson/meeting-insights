import React from "react";

interface LinearShellProps {
  topBar: React.ReactNode;
  sidebar: React.ReactNode;
  main: React.ReactNode;
  detail: React.ReactNode;
  detailOpen: boolean;
}

export function LinearShell({ topBar, sidebar, main, detail, detailOpen }: LinearShellProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden" }}>
      <div style={{ flexShrink: 0 }}>
        {topBar}
      </div>

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <div style={{ flexShrink: 0 }}>
          {sidebar}
        </div>

        <div style={{ flex: 1, overflowY: "auto" }}>
          {main}
        </div>

        <div
          data-testid="detail-panel"
          style={{
            width: detailOpen ? "480px" : "0px",
            overflow: "hidden",
            transition: "width 0.2s ease",
            flexShrink: 0,
            borderLeft: "1px solid var(--color-border)",
          }}
        >
          {detail}
        </div>
      </div>
    </div>
  );
}
