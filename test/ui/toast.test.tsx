// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, cleanup, screen, act } from "@testing-library/react";
import { renderHook } from "@testing-library/react";
import { ToastItem, ToastContainer, useToast } from "../../electron-ui/ui/src/components/ui/toast.js";

afterEach(cleanup);

describe("ToastItem", () => {
  it("renders the message", () => {
    render(<ToastItem id={1} message="Operation done" type="success" onDismiss={vi.fn()} />);
    expect(screen.getByText("Operation done")).toBeDefined();
  });

  it("calls onDismiss with id after 4000ms", () => {
    vi.useFakeTimers();
    const onDismiss = vi.fn();
    render(<ToastItem id={42} message="Done" type="success" onDismiss={onDismiss} />);
    act(() => vi.advanceTimersByTime(4000));
    expect(onDismiss).toHaveBeenCalledWith(42);
    vi.useRealTimers();
  });
});

describe("ToastContainer", () => {
  it("renders all provided toasts", () => {
    render(
      <ToastContainer
        toasts={[
          { id: 1, message: "First", type: "success" },
          { id: 2, message: "Second", type: "error" },
        ]}
        onDismiss={vi.fn()}
      />,
    );
    expect(screen.getByText("First")).toBeDefined();
    expect(screen.getByText("Second")).toBeDefined();
  });

  it("renders nothing when toasts is empty", () => {
    const { container } = render(<ToastContainer toasts={[]} onDismiss={vi.fn()} />);
    expect(container.firstChild).toBeNull();
  });
});

describe("useToast", () => {
  it("addToast adds a toast to the list", () => {
    const { result } = renderHook(() => useToast());
    act(() => result.current.addToast("hello", "success"));
    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0].message).toBe("hello");
    expect(result.current.toasts[0].type).toBe("success");
  });

  it("removeToast removes toast by id", () => {
    const { result } = renderHook(() => useToast());
    act(() => result.current.addToast("hello", "success"));
    const id = result.current.toasts[0].id;
    act(() => result.current.removeToast(id));
    expect(result.current.toasts).toHaveLength(0);
  });
});
