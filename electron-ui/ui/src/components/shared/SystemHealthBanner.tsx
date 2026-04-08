import React from "react";
import { AlertTriangle, WifiOff, X } from "lucide-react";
import type { HealthStatus } from "../../../../electron/channels.js";

interface SystemHealthBannerProps {
  health: HealthStatus | undefined;
  isError: boolean;
  onAcknowledge: () => void;
}

export function SystemHealthBanner({ health, isError, onAcknowledge }: SystemHealthBannerProps) {
  if (isError) {
    return (
      <div role="alert" className="bg-gray-600 text-white flex items-center gap-3 px-4 py-2.5 w-full">
        <WifiOff className="w-4 h-4 shrink-0" />
        <span className="text-[13px] flex-1">Unable to reach server -- health status unknown</span>
      </div>
    );
  }

  if (!health || health.status !== "critical") {
    return null;
  }

  const primaryGroup = health.error_groups.find(g => g.severity === "critical") ?? health.error_groups[0];
  const headline = primaryGroup.provider
    ? `${primaryGroup.provider} API error`
    : "System error";

  return (
    <div role="alert" className="bg-red-600 text-white flex items-center gap-3 px-4 py-2.5 w-full">
      <AlertTriangle className="w-4 h-4 shrink-0" />
      <div className="flex flex-col flex-1 min-w-0">
        <span className="text-[13px] font-semibold">{headline}</span>
        <span className="text-[12px] opacity-90">{primaryGroup.resolution_hint}</span>
        {health.meetings_without_artifact > 0 && (
          <span className="text-[11px] opacity-80 mt-0.5">
            {health.meetings_without_artifact} meeting(s) affected
          </span>
        )}
      </div>
      <button
        onClick={onAcknowledge}
        aria-label="Dismiss"
        className="ml-auto p-1 bg-transparent border-0 cursor-pointer text-white opacity-80 hover:opacity-100 shrink-0"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
