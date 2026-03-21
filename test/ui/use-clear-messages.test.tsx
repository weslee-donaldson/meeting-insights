// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { renderHook, act, cleanup } from "@testing-library/react";
import { useClearMessages } from "../../electron-ui/ui/src/hooks/useClearMessages.js";

afterEach(cleanup);

describe("useClearMessages", () => {
  it("starts with pendingClear as false", () => {
    const onClear = vi.fn();
    const { result } = renderHook(() => useClearMessages(onClear));
    expect(result.current.pendingClear).toBe(false);
  });

  it("sets pendingClear to true when requestClear is called", () => {
    const onClear = vi.fn();
    const { result } = renderHook(() => useClearMessages(onClear));
    act(() => result.current.requestClear());
    expect(result.current.pendingClear).toBe(true);
  });

  it("resets pendingClear when cancelClear is called", () => {
    const onClear = vi.fn();
    const { result } = renderHook(() => useClearMessages(onClear));
    act(() => result.current.requestClear());
    act(() => result.current.cancelClear());
    expect(result.current.pendingClear).toBe(false);
  });

  it("calls onClear and resets state on confirmClear", async () => {
    const onClear = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() => useClearMessages(onClear));
    act(() => result.current.requestClear());
    await act(() => result.current.confirmClear());
    expect(onClear).toHaveBeenCalled();
    expect(result.current.pendingClear).toBe(false);
  });

  it("resets pendingClear even when onClear throws", async () => {
    const onClear = vi.fn().mockRejectedValue(new Error("fail"));
    const { result } = renderHook(() => useClearMessages(onClear));
    act(() => result.current.requestClear());
    await act(() => result.current.confirmClear());
    expect(result.current.pendingClear).toBe(false);
  });
});
