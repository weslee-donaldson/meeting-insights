import React, { useState, useCallback } from "react";
import { useBreakpoint } from "../hooks/useBreakpoint.js";
import { LinearShell } from "./LinearShell.js";
import { BottomTabBar } from "./BottomTabBar.js";
import { BreadcrumbBar, type BreadcrumbSegment } from "./BreadcrumbBar.js";
import { layout } from "../design-tokens.js";

type View = "meetings" | "action-items" | "threads" | "insights" | "timelines";
type MobileScreen = "list" | "detail" | "chat";

interface ResponsiveShellProps {
  topBar: React.ReactNode;
  panels: React.ReactNode[];
  navRail?: React.ReactNode;
  chat?: React.ReactNode;
  chatOpen?: boolean;
  viewId?: string;
  defaultSidebarWidth?: number;
  currentView: View;
  onNavigate: (view: View) => void;
  selectedItemTitle?: string;
}

const VIEW_LABELS: Record<View, string> = {
  meetings: "Meetings",
  "action-items": "Action Items",
  threads: "Threads",
  insights: "Insights",
  timelines: "Timelines",
};

export function ResponsiveShell({
  topBar,
  panels,
  navRail,
  chat,
  chatOpen = false,
  viewId = "default",
  defaultSidebarWidth,
  currentView,
  onNavigate,
  selectedItemTitle,
}: ResponsiveShellProps) {
  const breakpoint = useBreakpoint();
  const [mobileScreen, setMobileScreen] = useState<MobileScreen>("list");

  const handleNavigate = useCallback((view: View) => {
    onNavigate(view);
    setMobileScreen("list");
  }, [onNavigate]);

  const handleSelectItem = useCallback(() => {
    setMobileScreen("detail");
  }, []);

  const handleOpenChat = useCallback(() => {
    setMobileScreen("chat");
  }, []);

  const handleBackToList = useCallback(() => {
    setMobileScreen("list");
  }, []);

  const handleBackToDetail = useCallback(() => {
    setMobileScreen("detail");
  }, []);

  if (breakpoint === "desktop") {
    return (
      <LinearShell
        topBar={topBar}
        panels={panels}
        navRail={navRail}
        chat={chat}
        chatOpen={chatOpen}
        viewId={viewId}
        defaultSidebarWidth={defaultSidebarWidth}
      />
    );
  }

  if (breakpoint === "tablet") {
    return (
      <div className="flex flex-col h-screen overflow-hidden" data-testid="responsive-shell-tablet">
        <div className="shrink-0">{topBar}</div>
        <div className="flex flex-1 overflow-hidden">
          <div
            className="shrink-0 overflow-auto border-r border-[var(--color-line)]"
            style={{ width: layout.tablet.sidebarWidth + "px" }}
            data-testid="tablet-list-panel"
          >
            {panels[0]}
          </div>
          <div className="flex-1 overflow-auto" data-testid="tablet-detail-panel">
            {panels[1] ?? panels[0]}
          </div>
          {chatOpen && chat && (
            <div
              className="shrink-0 overflow-hidden border-l border-[var(--color-line)]"
              style={{ width: layout.tablet.chatPanelWidth + "px" }}
              data-testid="tablet-chat-panel"
            >
              {chat}
            </div>
          )}
        </div>
        <BottomTabBar currentView={currentView} onNavigate={handleNavigate} />
      </div>
    );
  }

  const breadcrumbs: BreadcrumbSegment[] = [];
  breadcrumbs.push({
    label: VIEW_LABELS[currentView],
    onClick: mobileScreen !== "list" ? handleBackToList : undefined,
  });
  if (mobileScreen === "detail" || mobileScreen === "chat") {
    breadcrumbs.push({
      label: selectedItemTitle ?? "Detail",
      onClick: mobileScreen === "chat" ? handleBackToDetail : undefined,
    });
  }
  if (mobileScreen === "chat") {
    breadcrumbs.push({ label: "Chat" });
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden" data-testid="responsive-shell-mobile">
      <div className="shrink-0">{topBar}</div>
      {mobileScreen !== "list" && (
        <BreadcrumbBar segments={breadcrumbs} />
      )}
      <div className="flex-1 overflow-auto" data-testid="mobile-content">
        {mobileScreen === "list" && panels[0]}
        {mobileScreen === "detail" && (panels[1] ?? panels[0])}
        {mobileScreen === "chat" && chat}
      </div>
      <BottomTabBar currentView={currentView} onNavigate={handleNavigate} />
    </div>
  );
}

export type { MobileScreen };
export { type View as ShellView };
