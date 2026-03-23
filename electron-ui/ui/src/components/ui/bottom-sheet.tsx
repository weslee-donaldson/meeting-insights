import React, { useCallback, useEffect } from "react";
import { breakpoints } from "../../design-tokens.js";
import { Dialog, DialogContent, DialogTitle } from "./dialog.js";

interface BottomSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  height?: number;
  title?: string;
}

function SheetContent({ open, onOpenChange, children, height = 85, title }: BottomSheetProps) {
  const handleBackdropClick = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  useEffect(() => {
    if (!open) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open, onOpenChange]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50" data-testid="bottom-sheet">
      <div
        className="absolute inset-0 bg-black/60"
        data-testid="bottom-sheet-backdrop"
        onClick={handleBackdropClick}
      />
      <div
        className="absolute bottom-0 left-0 right-0 bg-[var(--color-bg-surface)] rounded-t-2xl flex flex-col overflow-hidden"
        style={{ height: `${height}vh` }}
        data-testid="bottom-sheet-container"
      >
        <div className="flex justify-center py-2 shrink-0">
          <div
            className="w-10 h-1 rounded-full bg-[var(--color-text-muted)]"
            data-testid="bottom-sheet-handle"
          />
        </div>
        {title && (
          <div className="px-4 pb-2 shrink-0">
            <h2 className="text-[14px] font-semibold text-[var(--color-text-primary)]">
              {title}
            </h2>
          </div>
        )}
        <div className="flex-1 overflow-y-auto px-4 pb-4">
          {children}
        </div>
      </div>
    </div>
  );
}

export function BottomSheet(props: BottomSheetProps) {
  const [isMobile, setIsMobile] = React.useState(() =>
    typeof window !== "undefined" ? window.innerWidth < breakpoints.tablet : false,
  );

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < breakpoints.tablet);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (isMobile) {
    return <SheetContent {...props} />;
  }

  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent aria-describedby={undefined}>
        {props.title && <DialogTitle>{props.title}</DialogTitle>}
        {props.children}
      </DialogContent>
    </Dialog>
  );
}
