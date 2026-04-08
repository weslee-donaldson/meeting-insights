// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { SystemHealthBanner } from "../../electron-ui/ui/src/components/shared/SystemHealthBanner.js";
import type { HealthStatus } from "../../core/system-health.js";

afterEach(cleanup);

const healthyStatus: HealthStatus = {
  status: "healthy",
  error_groups: [],
  meetings_without_artifact: 0,
  last_error_at: null,
};

const criticalStatus: HealthStatus = {
  status: "critical",
  error_groups: [
    {
      error_type: "api_error",
      severity: "critical",
      count: 5,
      latest_message: "[api_error] 402 Insufficient funds",
      latest_meeting_filename: "standup.json",
      provider: "openai",
      resolution_hint: "Check your LLM provider account billing and API key validity",
    },
  ],
  meetings_without_artifact: 5,
  last_error_at: "2026-04-07 10:00:00",
};

describe("SystemHealthBanner", () => {
  it("renders nothing when health is undefined and isError is false", () => {
    const { container } = render(
      <SystemHealthBanner health={undefined} isError={false} onAcknowledge={vi.fn()} />
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders nothing when health status is healthy", () => {
    const { container } = render(
      <SystemHealthBanner health={healthyStatus} isError={false} onAcknowledge={vi.fn()} />
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders red banner with error content for critical status", () => {
    render(
      <SystemHealthBanner health={criticalStatus} isError={false} onAcknowledge={vi.fn()} />
    );
    const banner = screen.getByRole("alert");
    expect(banner).toBeTruthy();
    expect(banner.className).toContain("bg-red-600");
    expect(screen.getByText(/openai.*API error|API error.*openai/i)).toBeTruthy();
    expect(screen.getByText(/Check your LLM provider account billing/i)).toBeTruthy();
    expect(screen.getByText(/5 meeting\(s\) affected/i)).toBeTruthy();
  });

  it("shows dismiss button for critical status", () => {
    render(
      <SystemHealthBanner health={criticalStatus} isError={false} onAcknowledge={vi.fn()} />
    );
    const dismissBtn = screen.getByRole("button");
    expect(dismissBtn).toBeTruthy();
  });

  it("calls onAcknowledge when dismiss button clicked", () => {
    const onAcknowledge = vi.fn();
    render(
      <SystemHealthBanner health={criticalStatus} isError={false} onAcknowledge={onAcknowledge} />
    );
    fireEvent.click(screen.getByRole("button"));
    expect(onAcknowledge).toHaveBeenCalledOnce();
  });

  it("renders gray 'unable to reach server' banner when isError is true", () => {
    render(
      <SystemHealthBanner health={undefined} isError={true} onAcknowledge={vi.fn()} />
    );
    const banner = screen.getByRole("alert");
    expect(banner.className).toContain("bg-gray-600");
    expect(screen.getByText(/Unable to reach server/i)).toBeTruthy();
  });

  it("does not show affected badge when meetings_without_artifact is 0", () => {
    const critNoAffected: HealthStatus = {
      ...criticalStatus,
      meetings_without_artifact: 0,
    };
    render(
      <SystemHealthBanner health={critNoAffected} isError={false} onAcknowledge={vi.fn()} />
    );
    expect(screen.queryByText(/meeting\(s\) affected/i)).toBeNull();
  });
});
