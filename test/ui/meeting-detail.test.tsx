// @vitest-environment jsdom
import React from "react";
import { describe, afterEach, it, expect, vi } from "vitest";
import { render, cleanup, screen, fireEvent, waitFor } from "@testing-library/react";
import { MeetingDetail } from "../../electron-ui/ui/src/components/MeetingDetail.js";
import type { MeetingRow, Artifact } from "../../electron-ui/electron/channels.js";

afterEach(cleanup);

function makeMeeting(overrides: Partial<MeetingRow> = {}): MeetingRow {
  return {
    id: "m1",
    title: "Alpha Meeting",
    date: "2026-02-25T10:00:00.000Z",
    client: "Acme",
    series: "alpha meeting",
    ...overrides,
  };
}

function makeArtifact(overrides: Partial<Artifact> = {}): Artifact {
  return {
    summary: "We discussed the roadmap.",
    decisions: ["Ship by March"],
    proposed_features: ["Dark mode"],
    action_items: [{ description: "Write tests", owner: "Alice", due_date: null }],
    technical_topics: ["TypeScript"],
    open_questions: ["When to launch?"],
    risk_items: ["Timeline slippage"],
    additional_notes: [],
    ...overrides,
  };
}

const defaultChatContext = { meetingIds: ["m1", "m2"], charCount: 5000 };

describe("MeetingDetail", () => {
  it("renders placeholder when meeting is null", () => {
    render(
      <MeetingDetail
        meeting={null}
        artifact={null}
        chatContext={defaultChatContext}
        onChat={vi.fn()}
      />,
    );
    expect(screen.getByText("Select a meeting")).toBeDefined();
  });

  it("renders meeting title when meeting is set", () => {
    render(
      <MeetingDetail
        meeting={makeMeeting()}
        artifact={null}
        chatContext={defaultChatContext}
        onChat={vi.fn()}
      />,
    );
    expect(screen.getByText("Alpha Meeting")).toBeDefined();
  });

  it("renders summary section when artifact is set", () => {
    render(
      <MeetingDetail
        meeting={makeMeeting()}
        artifact={makeArtifact()}
        chatContext={defaultChatContext}
        onChat={vi.fn()}
      />,
    );
    const trigger = screen.getByRole("button", { name: /summary/i });
    fireEvent.click(trigger);
    expect(screen.getByText("We discussed the roadmap.")).toBeDefined();
  });

  it("send button is disabled when textarea is empty", () => {
    render(
      <MeetingDetail
        meeting={makeMeeting()}
        artifact={null}
        chatContext={defaultChatContext}
        onChat={vi.fn()}
      />,
    );
    const sendBtn = screen.getByLabelText("Send");
    expect((sendBtn as HTMLButtonElement).disabled).toBe(true);
  });

  it("calls onChat and renders the response when submitted", async () => {
    const onChat = vi.fn().mockResolvedValue({ answer: "The answer is 42.", sources: [], charCount: 0 });
    render(
      <MeetingDetail
        meeting={makeMeeting()}
        artifact={null}
        chatContext={defaultChatContext}
        onChat={onChat}
      />,
    );
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "What was decided?" } });
    fireEvent.click(screen.getByLabelText("Send"));
    expect(onChat).toHaveBeenCalledWith("What was decided?");
    await waitFor(() => expect(screen.getByText("The answer is 42.")).toBeDefined());
  });
});
