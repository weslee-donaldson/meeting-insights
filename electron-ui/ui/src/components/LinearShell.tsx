import React, { useState, useRef, useCallback, useEffect } from "react";

const STORAGE_PREFIX = "mtninsights:columns:";
const DEFAULT_PANEL0 = 500;
const DEFAULT_CHAT = 380;

function loadWidths(viewId: string): { panel0: number; chat: number } {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + viewId);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        panel0: typeof parsed.panel0 === "number" ? parsed.panel0 : DEFAULT_PANEL0,
        chat: typeof parsed.chat === "number" ? parsed.chat : DEFAULT_CHAT,
      };
    }
  } catch {}
  return { panel0: DEFAULT_PANEL0, chat: DEFAULT_CHAT };
}

function saveWidths(viewId: string, panel0: number, chat: number): void {
  try {
    localStorage.setItem(STORAGE_PREFIX + viewId, JSON.stringify({ panel0, chat }));
  } catch {}
}

interface LinearShellProps {
  topBar: React.ReactNode;
  panels: React.ReactNode[];
  navRail?: React.ReactNode;
  chat?: React.ReactNode;
  chatOpen?: boolean;
  viewId?: string;
}

export function LinearShell({ topBar, panels, navRail, chat, chatOpen = false, viewId = "default" }: LinearShellProps) {
  const [panel0Width, setPanel0Width] = useState(() => loadWidths(viewId).panel0);
  const [chatWidth, setChatWidth] = useState(() => loadWidths(viewId).chat);

  useEffect(() => {
    const stored = loadWidths(viewId);
    setPanel0Width(stored.panel0);
    setChatWidth(stored.chat);
  }, [viewId]);

  const mainDragRef = useRef<{ startX: number; startWidth: number } | null>(null);
  const chatDragRef = useRef<{ startX: number; startWidth: number } | null>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const viewIdRef = useRef(viewId);
  viewIdRef.current = viewId;

  const scheduleSave = useCallback((p0: number, c: number) => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => saveWidths(viewIdRef.current, p0, c), 300);
  }, []);

  const handleMainMouseDown = useCallback((e: React.MouseEvent) => {
    mainDragRef.current = { startX: e.clientX, startWidth: panel0Width };

    const onMouseMove = (ev: MouseEvent) => {
      if (!mainDragRef.current) return;
      const delta = ev.clientX - mainDragRef.current.startX;
      const newWidth = Math.max(160, mainDragRef.current.startWidth + delta);
      setPanel0Width(newWidth);
    };

    const onMouseUp = () => {
      mainDragRef.current = null;
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
      setPanel0Width((w) => {
        setChatWidth((c) => {
          scheduleSave(w, c);
          return c;
        });
        return w;
      });
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  }, [panel0Width, scheduleSave]);

  const handleChatMouseDown = useCallback((e: React.MouseEvent) => {
    chatDragRef.current = { startX: e.clientX, startWidth: chatWidth };

    const onMouseMove = (ev: MouseEvent) => {
      if (!chatDragRef.current) return;
      const delta = chatDragRef.current.startX - ev.clientX;
      const newWidth = Math.max(200, chatDragRef.current.startWidth + delta);
      setChatWidth(newWidth);
    };

    const onMouseUp = () => {
      chatDragRef.current = null;
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
      setChatWidth((c) => {
        setPanel0Width((w) => {
          scheduleSave(w, c);
          return w;
        });
        return c;
      });
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  }, [chatWidth, scheduleSave]);

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <div className="shrink-0">
        {topBar}
      </div>

      <div className="flex flex-1 overflow-hidden">
        {navRail}

        {panels.map((panel, i) => {
          const isOnlyPanel = panels.length === 1;
          return (
          <React.Fragment key={i}>
            {i > 0 && (
              <div
                data-testid="main-resize-handle"
                onMouseDown={handleMainMouseDown}
                className="w-1 shrink-0 cursor-col-resize bg-border"
              />
            )}
            <div
              data-testid={`panel-${i}`}
              className={
                i === 0 && !isOnlyPanel
                  ? "shrink-0 overflow-auto pl-[15px]"
                  : i === 0
                  ? `flex-1 overflow-auto pl-[15px]${chatOpen ? "" : " pr-[15px]"}`
                  : `flex-1 min-w-[200px] overflow-auto${chatOpen ? "" : " pr-[15px]"}`
              }
              style={i === 0 && !isOnlyPanel ? { width: panel0Width + "px" } : undefined}
            >
              {panel}
            </div>
          </React.Fragment>
          );
        })}

        {chatOpen && (
          <>
            <div
              data-testid="chat-resize-handle"
              onMouseDown={handleChatMouseDown}
              className="w-1 shrink-0 cursor-col-resize bg-border"
            />
            <div
              data-testid="chat-panel"
              className="shrink-0 overflow-hidden border-l border-border pr-[15px]"
              style={{ width: chatWidth + "px" }}
            >
              {chat}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
