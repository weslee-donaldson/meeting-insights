import React, { useState, useRef, useCallback } from "react";

interface LinearShellProps {
  topBar: React.ReactNode;
  panels: React.ReactNode[];
  navRail?: React.ReactNode;
  chat?: React.ReactNode;
  chatOpen?: boolean;
}

export function LinearShell({ topBar, panels, navRail, chat, chatOpen = false }: LinearShellProps) {
  const [panel0Width, setPanel0Width] = useState(500);
  const [chatWidth, setChatWidth] = useState(380);

  const mainDragRef = useRef<{ startX: number; startWidth: number } | null>(null);
  const chatDragRef = useRef<{ startX: number; startWidth: number } | null>(null);

  const handleMainMouseDown = useCallback((e: React.MouseEvent) => {
    mainDragRef.current = { startX: e.clientX, startWidth: panel0Width };

    const onMouseMove = (ev: MouseEvent) => {
      if (!mainDragRef.current) return;
      const delta = ev.clientX - mainDragRef.current.startX;
      setPanel0Width(Math.max(160, mainDragRef.current.startWidth + delta));
    };

    const onMouseUp = () => {
      mainDragRef.current = null;
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  }, [panel0Width]);

  const handleChatMouseDown = useCallback((e: React.MouseEvent) => {
    chatDragRef.current = { startX: e.clientX, startWidth: chatWidth };

    const onMouseMove = (ev: MouseEvent) => {
      if (!chatDragRef.current) return;
      const delta = chatDragRef.current.startX - ev.clientX;
      setChatWidth(Math.max(200, chatDragRef.current.startWidth + delta));
    };

    const onMouseUp = () => {
      chatDragRef.current = null;
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  }, [chatWidth]);

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <div className="shrink-0">
        {topBar}
      </div>

      <div className="flex flex-1 overflow-hidden">
        {navRail}

        {panels.map((panel, i) => (
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
                i === 0
                  ? "shrink-0 overflow-auto pl-[15px]"
                  : `flex-1 min-w-[200px] overflow-auto${chatOpen ? "" : " pr-[15px]"}`
              }
              style={i === 0 ? { width: panel0Width + "px" } : undefined}
            >
              {panel}
            </div>
          </React.Fragment>
        ))}

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
