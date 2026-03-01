// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, afterEach, beforeEach, vi } from "vitest";
import { render, cleanup, act, screen } from "@testing-library/react";
import { ThemeProvider, useTheme } from "../../ui/src/ThemeContext.js";

function makeLocalStorageMock() {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
    reset: () => { store = {}; },
  };
}

const lsMock = makeLocalStorageMock();

beforeEach(() => {
  lsMock.reset();
  vi.stubGlobal("localStorage", lsMock);
  document.documentElement.removeAttribute("data-theme");
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

function ThemeConsumer() {
  const { theme, setTheme, themes } = useTheme();
  return (
    <div>
      <span data-testid="theme">{theme}</span>
      <span data-testid="themes-count">{themes.length}</span>
      <button onClick={() => setTheme("daylight")}>Set Daylight</button>
      <button onClick={() => setTheme("midnight")}>Set Midnight</button>
    </div>
  );
}

describe("ThemeProvider", () => {
  it("sets data-theme on document.documentElement to deep-sea by default", () => {
    render(<ThemeProvider><ThemeConsumer /></ThemeProvider>);
    expect(document.documentElement.getAttribute("data-theme")).toBe("deep-sea");
  });

  it("persists chosen theme to localStorage", async () => {
    render(<ThemeProvider><ThemeConsumer /></ThemeProvider>);
    await act(async () => { screen.getByRole("button", { name: "Set Daylight" }).click(); });
    expect(lsMock.getItem("mtninsights-theme")).toBe("daylight");
  });

  it("updates data-theme attribute when theme changes", async () => {
    render(<ThemeProvider><ThemeConsumer /></ThemeProvider>);
    await act(async () => { screen.getByRole("button", { name: "Set Midnight" }).click(); });
    expect(document.documentElement.getAttribute("data-theme")).toBe("midnight");
  });

  it("reads persisted theme from localStorage on mount", () => {
    lsMock.setItem("mtninsights-theme", "midnight");
    render(<ThemeProvider><ThemeConsumer /></ThemeProvider>);
    expect(screen.getByTestId("theme").textContent).toBe("midnight");
  });

  it("useTheme returns all 3 themes", () => {
    render(<ThemeProvider><ThemeConsumer /></ThemeProvider>);
    expect(screen.getByTestId("themes-count").textContent).toBe("3");
  });
});
