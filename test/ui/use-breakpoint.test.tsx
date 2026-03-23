// @vitest-environment jsdom
import React from "react";
import { describe, afterEach, it, expect } from "vitest";
import { render, cleanup, screen, act } from "@testing-library/react";
import { useBreakpoint } from "../../electron-ui/ui/src/hooks/useBreakpoint.js";

function BreakpointDisplay() {
  const bp = useBreakpoint();
  return <span data-testid="bp">{bp}</span>;
}

afterEach(cleanup);

describe("useBreakpoint", () => {
  it("returns mobile when window width is below 768", () => {
    Object.defineProperty(window, "innerWidth", { writable: true, configurable: true, value: 390 });
    render(<BreakpointDisplay />);
    expect(screen.getByTestId("bp").textContent).toBe("mobile");
  });

  it("returns tablet when window width is between 768 and 1279", () => {
    Object.defineProperty(window, "innerWidth", { writable: true, configurable: true, value: 1024 });
    render(<BreakpointDisplay />);
    expect(screen.getByTestId("bp").textContent).toBe("tablet");
  });

  it("returns desktop when window width is 1280 or above", () => {
    Object.defineProperty(window, "innerWidth", { writable: true, configurable: true, value: 1440 });
    render(<BreakpointDisplay />);
    expect(screen.getByTestId("bp").textContent).toBe("desktop");
  });

  it("updates when window is resized", () => {
    Object.defineProperty(window, "innerWidth", { writable: true, configurable: true, value: 1440 });
    render(<BreakpointDisplay />);
    expect(screen.getByTestId("bp").textContent).toBe("desktop");

    act(() => {
      Object.defineProperty(window, "innerWidth", { writable: true, configurable: true, value: 500 });
      window.dispatchEvent(new Event("resize"));
    });
    expect(screen.getByTestId("bp").textContent).toBe("mobile");
  });

  it("returns tablet at exactly 768px", () => {
    Object.defineProperty(window, "innerWidth", { writable: true, configurable: true, value: 768 });
    render(<BreakpointDisplay />);
    expect(screen.getByTestId("bp").textContent).toBe("tablet");
  });

  it("returns desktop at exactly 1280px", () => {
    Object.defineProperty(window, "innerWidth", { writable: true, configurable: true, value: 1280 });
    render(<BreakpointDisplay />);
    expect(screen.getByTestId("bp").textContent).toBe("desktop");
  });
});
