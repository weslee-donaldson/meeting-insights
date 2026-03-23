// @vitest-environment jsdom
import React from "react";
import { describe, afterEach, it, expect, vi, beforeEach } from "vitest";
import { render, cleanup, screen, fireEvent } from "@testing-library/react";
import { useMobileNav } from "../../electron-ui/ui/src/hooks/useMobileNav.js";
import { ResponsiveShell } from "../../electron-ui/ui/src/components/ResponsiveShell.js";

afterEach(cleanup);

function ChatTrigger() {
  const { goToChat, isMobile } = useMobileNav();
  return (
    <div>
      <span data-testid="is-mobile">{String(isMobile)}</span>
      <button onClick={goToChat} data-testid="go-to-chat">Chat</button>
    </div>
  );
}

function DetailTrigger() {
  const { goToDetail } = useMobileNav();
  return <button onClick={goToDetail} data-testid="go-to-detail">Detail</button>;
}

describe("useMobileNav via ResponsiveShell", () => {
  beforeEach(() => {
    Object.defineProperty(window, "innerWidth", { writable: true, configurable: true, value: 390 });
    window.dispatchEvent(new Event("resize"));
  });

  it("provides isMobile=true on mobile viewport", () => {
    render(
      <ResponsiveShell
        topBar={<div>Top</div>}
        panels={[<ChatTrigger key="a" />, <div key="b">Detail</div>]}
        currentView="meetings"
        onNavigate={vi.fn()}
      />,
    );
    expect(screen.getByTestId("is-mobile").textContent).toBe("true");
  });

  it("goToDetail navigates to detail screen", () => {
    render(
      <ResponsiveShell
        topBar={<div>Top</div>}
        panels={[<DetailTrigger key="a" />, <div key="b" data-testid="detail-content">Detail view</div>]}
        currentView="meetings"
        onNavigate={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByTestId("go-to-detail"));
    expect(screen.getByTestId("detail-content")).toBeDefined();
  });

  it("goToChat navigates to chat screen", () => {
    render(
      <ResponsiveShell
        topBar={<div>Top</div>}
        panels={[<DetailTrigger key="a" />, <ChatTrigger key="b" />]}
        chat={<div data-testid="chat-view">Chat content</div>}
        currentView="meetings"
        onNavigate={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByTestId("go-to-detail"));
    fireEvent.click(screen.getByTestId("go-to-chat"));
    expect(screen.getByTestId("chat-view")).toBeDefined();
  });

  it("provides isMobile=false on desktop viewport", () => {
    Object.defineProperty(window, "innerWidth", { writable: true, configurable: true, value: 1440 });
    window.dispatchEvent(new Event("resize"));
    render(
      <ResponsiveShell
        topBar={<div>Top</div>}
        panels={[<ChatTrigger key="a" />]}
        currentView="meetings"
        onNavigate={vi.fn()}
      />,
    );
    expect(screen.getByTestId("is-mobile").textContent).toBe("false");
  });
});
