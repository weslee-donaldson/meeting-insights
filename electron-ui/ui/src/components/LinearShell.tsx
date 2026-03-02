import React, { useState, useRef, useCallback } from "react";

interface LinearShellProps {
  topBar: React.ReactNode;
  sidebar: React.ReactNode;
  main: React.ReactNode;
  detail: React.ReactNode;
  chat?: React.ReactNode;
  chatOpen?: boolean;
}

export function LinearShell({ topBar, sidebar, main, detail, chat, chatOpen = false }: LinearShellProps) {
  const [sidebarWidth, setSidebarWidth] = useState(240);
  const [mainWidth, setMainWidth] = useState(200);
  const [chatWidth, setChatWidth] = useState(380);

  const sidebarDragRef = useRef<{ startX: number; startWidth: number } | null>(null);
  const mainDragRef = useRef<{ startX: number; startWidth: number } | null>(null);
  const chatDragRef = useRef<{ startX: number; startWidth: number } | null>(null);

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

  const handleMainMouseDown = useCallback((e: React.MouseEvent) => {
    mainDragRef.current = { startX: e.clientX, startWidth: mainWidth };

    const onMouseMove = (ev: MouseEvent) => {
      if (!mainDragRef.current) return;
      const delta = ev.clientX - mainDragRef.current.startX;
      setMainWidth(Math.max(140, Math.min(500, mainDragRef.current.startWidth + delta)));
    };

    const onMouseUp = () => {
      mainDragRef.current = null;
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  }, [mainWidth]);

  const handleChatMouseDown = useCallback((e: React.MouseEvent) => {
    chatDragRef.current = { startX: e.clientX, startWidth: chatWidth };

    const onMouseMove = (ev: MouseEvent) => {
      if (!chatDragRef.current) return;
      const delta = chatDragRef.current.startX - ev.clientX;
      setChatWidth(Math.max(280, Math.min(600, chatDragRef.current.startWidth + delta)));
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
        <div
          data-testid="sidebar-panel"
          className="shrink-0 overflow-hidden"
          style={{ width: sidebarWidth + "px" }}
        >
          {sidebar}
        </div>

        <div
          data-testid="sidebar-resize-handle"
          onMouseDown={handleSidebarMouseDown}
          className="w-1 shrink-0 cursor-col-resize bg-border"
        />

        <div
          data-testid="main-panel"
          className="shrink-0 overflow-auto"
          style={{ width: mainWidth + "px" }}
        >
          {main}
        </div>

        <div
          data-testid="main-resize-handle"
          onMouseDown={handleMainMouseDown}
          className="w-1 shrink-0 cursor-col-resize bg-border"
        />

        <div
          data-testid="detail-panel"
          className="flex-1 min-w-[280px] overflow-auto"
        >
          {detail}
        </div>

        {chatOpen && (
          <>
            <div
              data-testid="chat-resize-handle"
              onMouseDown={handleChatMouseDown}
              className="w-1 shrink-0 cursor-col-resize bg-border"
            />
            <div
              data-testid="chat-panel"
              className="shrink-0 overflow-hidden border-l border-border"
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
