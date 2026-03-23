import React from "react";
import { useBreakpoint } from "../../hooks/useBreakpoint.js";
import { BottomSheet } from "./bottom-sheet.js";
import { Dialog, DialogContent, DialogTitle } from "./dialog.js";

interface ResponsiveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  children: React.ReactNode;
  sheetHeight?: number;
}

export function ResponsiveDialog({ open, onOpenChange, title, children, sheetHeight = 85 }: ResponsiveDialogProps) {
  const breakpoint = useBreakpoint();

  if (breakpoint === "mobile") {
    return (
      <BottomSheet open={open} onOpenChange={onOpenChange} title={title} height={sheetHeight}>
        {children}
      </BottomSheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent aria-describedby={undefined}>
        {title && <DialogTitle>{title}</DialogTitle>}
        {children}
      </DialogContent>
    </Dialog>
  );
}
