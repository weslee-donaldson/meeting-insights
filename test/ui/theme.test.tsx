// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, afterEach, beforeEach, vi } from "vitest";
import { render, cleanup, act, screen } from "@testing-library/react";
import { ThemeProvider, useTheme } from "../../electron-ui/ui/src/ThemeContext.js";

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
      <button onClick={() => setTheme("stone-dark")}>Set Stone Dark</button>
      <button onClick={() => setTheme("teal-light")}>Set Teal Light</button>
    </div>
  );
}

describe("ThemeProvider", () => {
  it("sets data-theme on document.documentElement to stone-light by default", () => {
    render(<ThemeProvider><ThemeConsumer /></ThemeProvider>);
    expect(document.documentElement.getAttribute("data-theme")).toBe("stone-light");
  });

  it("persists chosen theme to localStorage", async () => {
    render(<ThemeProvider><ThemeConsumer /></ThemeProvider>);
    await act(async () => { screen.getByRole("button", { name: "Set Stone Dark" }).click(); });
    expect(lsMock.getItem("mtninsights-theme")).toBe("stone-dark");
  });

  it("updates data-theme attribute when theme changes", async () => {
    render(<ThemeProvider><ThemeConsumer /></ThemeProvider>);
    await act(async () => { screen.getByRole("button", { name: "Set Teal Light" }).click(); });
    expect(document.documentElement.getAttribute("data-theme")).toBe("teal-light");
  });

  it("reads persisted theme from localStorage on mount", () => {
    lsMock.setItem("mtninsights-theme", "teal-light");
    render(<ThemeProvider><ThemeConsumer /></ThemeProvider>);
    expect(screen.getByTestId("theme").textContent).toBe("teal-light");
  });

  it("useTheme returns all 4 themes", () => {
    render(<ThemeProvider><ThemeConsumer /></ThemeProvider>);
    expect(screen.getByTestId("themes-count").textContent).toBe("4");
  });
});
