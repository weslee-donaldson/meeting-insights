// @vitest-environment jsdom
import React from "react";
import { describe, afterEach, it, expect, vi, beforeEach } from "vitest";
import { render, cleanup, screen, fireEvent, waitFor } from "@testing-library/react";
import { SplitMeetingDialog } from "../../electron-ui/ui/src/components/SplitMeetingDialog.js";

afterEach(cleanup);

const mockSplitMeeting = vi.fn();

beforeEach(() => {
  mockSplitMeeting.mockReset();
  (window as unknown as { api: { splitMeeting: typeof mockSplitMeeting } }).api = {
    splitMeeting: mockSplitMeeting,
  };
});

describe("SplitMeetingDialog", () => {
  const defaultProps = {
    open: true,
    onOpenChange: vi.fn(),
    meetingId: "meeting-123",
    meetingTitle: "Weekly Standup",
    totalDurationMinutes: 90,
    onSuccess: vi.fn(),
  };

  it("renders with default 2 segment inputs", () => {
    render(<SplitMeetingDialog {...defaultProps} />);
    expect(screen.getByRole("button", { name: /split meeting/i })).toBeDefined();
    const durationInputs = screen.getAllByPlaceholderText(/minutes/i);
    expect(durationInputs).toHaveLength(1);
  });

  it("changing segment count updates duration rows", () => {
    render(<SplitMeetingDialog {...defaultProps} />);
    const countInput = screen.getByLabelText(/how many/i) as HTMLInputElement;
    fireEvent.change(countInput, { target: { value: "3" } });
    const durationInputs = screen.getAllByPlaceholderText(/minutes/i);
    expect(durationInputs).toHaveLength(2);
  });

  it("calls window.api.splitMeeting with meetingId and durations on confirm", async () => {
    const splitResult = { source_meeting_id: "meeting-123", segments: [] };
    mockSplitMeeting.mockResolvedValue(splitResult);
    render(<SplitMeetingDialog {...defaultProps} totalDurationMinutes={90} />);
    const durationInput = screen.getAllByPlaceholderText(/minutes/i)[0] as HTMLInputElement;
    fireEvent.change(durationInput, { target: { value: "60" } });
    fireEvent.click(screen.getByRole("button", { name: /split meeting/i }));
    await waitFor(() => {
      expect(mockSplitMeeting).toHaveBeenCalledWith("meeting-123", [60, 30]);
    });
  });

  it("calls onSuccess with result after successful split", async () => {
    const onSuccess = vi.fn();
    const splitResult = { source_meeting_id: "meeting-123", segments: [{ meeting_id: "seg-1" }] };
    mockSplitMeeting.mockResolvedValue(splitResult);
    render(<SplitMeetingDialog {...defaultProps} onSuccess={onSuccess} />);
    const durationInput = screen.getAllByPlaceholderText(/minutes/i)[0] as HTMLInputElement;
    fireEvent.change(durationInput, { target: { value: "60" } });
    fireEvent.click(screen.getByRole("button", { name: /split meeting/i }));
    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith(splitResult);
    });
  });

  it("shows error message on API failure", async () => {
    mockSplitMeeting.mockRejectedValue(new Error("Split failed"));
    render(<SplitMeetingDialog {...defaultProps} />);
    const durationInput = screen.getAllByPlaceholderText(/minutes/i)[0] as HTMLInputElement;
    fireEvent.change(durationInput, { target: { value: "60" } });
    fireEvent.click(screen.getByRole("button", { name: /split meeting/i }));
    await waitFor(() => {
      expect(screen.getByText(/split failed/i)).toBeDefined();
    });
  });

  it("cancel button calls onOpenChange", () => {
    const onOpenChange = vi.fn();
    render(<SplitMeetingDialog {...defaultProps} onOpenChange={onOpenChange} />);
    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
