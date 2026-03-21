// @vitest-environment jsdom
import { describe, it, expect, afterEach } from "vitest";
import { renderHook, act, cleanup } from "@testing-library/react";
import { useMeetingSelection } from "../../electron-ui/ui/src/hooks/useMeetingSelection.js";

afterEach(cleanup);

describe("useMeetingSelection", () => {
  it("starts with null selectedMeetingId and empty checkedMeetingIds", () => {
    const { result } = renderHook(() => useMeetingSelection());
    expect(result.current.selectedMeetingId).toBe(null);
    expect(result.current.checkedMeetingIds).toEqual(new Set());
    expect(result.current.previewMeetingId).toBe(null);
  });

  it("sets and clears selectedMeetingId", () => {
    const { result } = renderHook(() => useMeetingSelection());
    act(() => result.current.setSelectedMeetingId("m1"));
    expect(result.current.selectedMeetingId).toBe("m1");
    act(() => result.current.setSelectedMeetingId(null));
    expect(result.current.selectedMeetingId).toBe(null);
  });

  it("toggles individual meeting check via handleCheck", () => {
    const { result } = renderHook(() => useMeetingSelection());
    act(() => result.current.handleCheck("m1"));
    expect(result.current.checkedMeetingIds).toEqual(new Set(["m1"]));
    act(() => result.current.handleCheck("m2"));
    expect(result.current.checkedMeetingIds).toEqual(new Set(["m1", "m2"]));
    act(() => result.current.handleCheck("m1"));
    expect(result.current.checkedMeetingIds).toEqual(new Set(["m2"]));
  });

  it("checks/unchecks a group via handleCheckGroup", () => {
    const { result } = renderHook(() => useMeetingSelection());
    act(() => result.current.handleCheckGroup(["m1", "m2", "m3"]));
    expect(result.current.checkedMeetingIds).toEqual(new Set(["m1", "m2", "m3"]));
    act(() => result.current.handleCheckGroup(["m1", "m2", "m3"]));
    expect(result.current.checkedMeetingIds).toEqual(new Set());
  });

  it("resets checked meetings via handleResetChecked", () => {
    const { result } = renderHook(() => useMeetingSelection());
    act(() => result.current.handleCheck("m1"));
    act(() => result.current.handleResetChecked());
    expect(result.current.checkedMeetingIds).toEqual(new Set());
  });

  it("sets and clears previewMeetingId", () => {
    const { result } = renderHook(() => useMeetingSelection());
    act(() => result.current.setPreviewMeetingId("m5"));
    expect(result.current.previewMeetingId).toBe("m5");
    act(() => result.current.setPreviewMeetingId(null));
    expect(result.current.previewMeetingId).toBe(null);
  });
});
