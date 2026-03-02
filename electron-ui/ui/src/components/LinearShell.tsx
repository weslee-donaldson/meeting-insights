import React, { useState, useRef, useCallback } from "react";

interface LinearShellProps {
  topBar: React.ReactNode;
  sidebar: React.ReactNode;
  main: React.ReactNode;
  detail: React.ReactNode;
  detailOpen: boolean;
}

export function LinearShell({ topBar, sidebar, main, detail, detailOpen }: LinearShellProps) {
  const [sidebarWidth, setSidebarWidth] = useState(240);
  const [detailWidth, setDetailWidth] = useState(480);

  const sidebarDragRef = useRef<{ startX: number; startWidth: number } | null>(null);
  const detailDragRef = useRef<{ startX: number; startWidth: number } | null>(null);

  const handleSidebarMouseDown = useCallback((e: React.MouseEvent) => {
    sidebarDragRef.current = { startX: e.clientX, startWidth: sidebarWidth };

    const onMouseMove = (ev: MouseEvent) => {
      if (!sidebarDragRef.current) return;
      const delta = ev.clientX - sidebarDragRef.current.startX;
      setSidebarWidth(Math.max(140, Math.min(400, sidebarDragRef.current.startWidth + delta)));
    };

    const onMouseUp = () => {
      sidebarDragRef.current = null;
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  }, [sidebarWidth]);

  const handleDetailMouseDown = useCallback((e: React.MouseEvent) => {
    detailDragRef.current = { startX: e.clientX, startWidth: detailWidth };

    const onMouseMove = (ev: MouseEvent) => {
      if (!detailDragRef.current) return;
      const delta = detailDragRef.current.startX - ev.clientX;
      setDetailWidth(Math.max(280, detailDragRef.current.startWidth + delta));
    };

    const onMouseUp = () => {
      detailDragRef.current = null;
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  }, [detailWidth]);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden" }}>
      <div style={{ flexShrink: 0 }}>
        {topBar}
      </div>

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <div data-testid="sidebar-panel" style={{ width: sidebarWidth + "px", flexShrink: 0, overflow: "hidden" }}>
          {sidebar}
        </div>

        <div
          data-testid="sidebar-resize-handle"
          onMouseDown={handleSidebarMouseDown}
          style={{ width: "4px", flexShrink: 0, cursor: "col-resize", background: "var(--color-border)" }}
        />

        <div style={{ flex: 1, minWidth: "200px", overflowY: "auto", overflowX: "auto" }}>
          {main}
        </div>

        {detailOpen && (
          <div
            data-testid="detail-resize-handle"
            onMouseDown={handleDetailMouseDown}
            style={{ width: "4px", flexShrink: 0, cursor: "col-resize", background: "var(--color-border)" }}
          />
        )}

        <div
          data-testid="detail-panel"
          style={{
            width: detailOpen ? detailWidth + "px" : "0px",
            overflow: "hidden",
            transition: "width 0.2s ease",
            flexShrink: 0,
            borderLeft: detailOpen ? "none" : "1px solid var(--color-border)",
          }}
        >
          {detail}
        </div>
      </div>
    </div>
  );
}
