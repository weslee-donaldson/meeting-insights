import React from "react";
import { cn } from "../../lib/utils.js";

type ActionVariant = "primary" | "default" | "success" | "destructive";

interface CommandAction {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  variant?: ActionVariant;
}

interface CommandBarProps {
  actions: CommandAction[];
  className?: string;
}

const variantStyles: Record<ActionVariant, string> = {
  primary: "bg-[var(--color-bg-surface)] text-[var(--color-text-body)]",
  default: "text-[var(--color-text-secondary)]",
  success: "text-[#15803D]",
  destructive: "text-[var(--color-danger)]",
};

export function CommandBar({ actions, className }: CommandBarProps) {
  const primaryActions = actions.filter(
    (a) => a.variant === "primary" || a.variant === "default" || !a.variant,
  );
  const destructiveActions = actions.filter((a) => a.variant === "destructive");
  const successActions = actions.filter((a) => a.variant === "success");
  const contextualActions = [...successActions];

  return (
    <div
      className={cn(
        "flex items-center gap-[1px] p-0.5 rounded-lg",
        "bg-[var(--color-bg-elevated)]",
        className,
      )}
      role="toolbar"
    >
      {primaryActions.map((action) => (
        <button
          key={action.label}
          onClick={action.onClick}
          className={cn(
            "flex items-center gap-[5px] px-3 py-1.5 rounded-md",
            "text-xs font-medium transition-colors",
            variantStyles[action.variant ?? "default"],
          )}
        >
          {action.icon}
          {action.label}
        </button>
      ))}
      {contextualActions.length > 0 && (
        <>
          <div className="w-px h-4 bg-[var(--color-line)] flex-shrink-0" />
          {contextualActions.map((action) => (
            <button
              key={action.label}
              onClick={action.onClick}
              className={cn(
                "flex items-center gap-[5px] px-3 py-1.5 rounded-md",
                "text-xs font-medium transition-colors",
                variantStyles[action.variant ?? "default"],
              )}
            >
              {action.icon}
              {action.label}
            </button>
          ))}
        </>
      )}
      {destructiveActions.length > 0 && (
        <>
          <div className="flex-1" />
          {destructiveActions.map((action) => (
            <button
              key={action.label}
              onClick={action.onClick}
              className={cn(
                "flex items-center gap-[5px] px-3 py-1.5 rounded-md",
                "text-xs font-medium transition-colors",
                variantStyles.destructive,
              )}
            >
              {action.icon}
              {action.label}
            </button>
          ))}
        </>
      )}
    </div>
  );
}
