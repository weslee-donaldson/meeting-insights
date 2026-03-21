// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { renderHook, act, cleanup } from "@testing-library/react";
import { useDeleteConfirmation } from "../../electron-ui/ui/src/hooks/useDeleteConfirmation.js";

afterEach(cleanup);

describe("useDeleteConfirmation", () => {
  it("starts with null pendingDeleteId", () => {
    const onDelete = vi.fn();
    const { result } = renderHook(() => useDeleteConfirmation(onDelete));
    expect(result.current.pendingDeleteId).toBe(null);
  });

  it("sets pendingDeleteId when requestDelete is called", () => {
    const onDelete = vi.fn();
    const { result } = renderHook(() => useDeleteConfirmation(onDelete));
    act(() => result.current.requestDelete("abc"));
    expect(result.current.pendingDeleteId).toBe("abc");
  });

  it("clears pendingDeleteId when cancelDelete is called", () => {
    const onDelete = vi.fn();
    const { result } = renderHook(() => useDeleteConfirmation(onDelete));
    act(() => result.current.requestDelete("abc"));
    act(() => result.current.cancelDelete());
    expect(result.current.pendingDeleteId).toBe(null);
  });

  it("calls onDelete with the pending id and clears state on confirmDelete", async () => {
    const onDelete = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() => useDeleteConfirmation(onDelete));
    act(() => result.current.requestDelete("abc"));
    await act(() => result.current.confirmDelete());
    expect(onDelete).toHaveBeenCalledWith("abc");
    expect(result.current.pendingDeleteId).toBe(null);
  });

  it("does not call onDelete when confirmDelete is called without a pending id", async () => {
    const onDelete = vi.fn();
    const { result } = renderHook(() => useDeleteConfirmation(onDelete));
    await act(() => result.current.confirmDelete());
    expect(onDelete).not.toHaveBeenCalled();
  });

  it("clears pendingDeleteId even when onDelete throws", async () => {
    const onDelete = vi.fn().mockRejectedValue(new Error("fail"));
    const { result } = renderHook(() => useDeleteConfirmation(onDelete));
    act(() => result.current.requestDelete("abc"));
    await act(() => result.current.confirmDelete());
    expect(result.current.pendingDeleteId).toBe(null);
  });
});
