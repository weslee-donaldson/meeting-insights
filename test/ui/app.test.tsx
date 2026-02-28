// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, beforeAll, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { App } from "../../ui/src/App.js";

afterEach(cleanup);


vi.mock("react-resizable-panels", () => ({
  Group: ({ children }: { children: React.ReactNode }) => <div data-panel-group>{children}</div>,
  Panel: ({ children, ...props }: { children: React.ReactNode; [k: string]: unknown }) => (
    <div {...props}>{children}</div>
  ),
  Separator: () => <div data-panel-separator />,
}));

beforeAll(() => {
  (window as unknown as Record<string, unknown>).api = {
    getClients: vi.fn().mockResolvedValue([]),
    getMeetings: vi.fn().mockResolvedValue([]),
    getArtifact: vi.fn().mockResolvedValue(null),
    chat: vi.fn().mockResolvedValue({ answer: "", sources: [], charCount: 0 }),
  };
});

function wrapper({ children }: { children: React.ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
}

describe("App", () => {
  it("renders all four panel regions", () => {
    render(<App />, { wrapper });
    expect(screen.getByTestId("clients-panel")).toBeDefined();
    expect(screen.getByTestId("meetings-panel")).toBeDefined();
    expect(screen.getByTestId("context-panel")).toBeDefined();
    expect(screen.getByTestId("chat-panel")).toBeDefined();
  });
});
