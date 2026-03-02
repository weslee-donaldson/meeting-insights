import React from "react";
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";
import { cn } from "../../lib/utils.js";

interface ScrollAreaProps extends React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root> {
  maxHeight?: number;
}

export function ScrollArea({ children, className, maxHeight, style, ...props }: ScrollAreaProps) {
  const rootStyle = maxHeight ? { ...style, maxHeight: `${maxHeight}px` } : style;
  return (
    <ScrollAreaPrimitive.Root className={cn("relative overflow-hidden", className)} style={rootStyle} {...props}>
      <ScrollAreaPrimitive.Viewport className="h-full w-full rounded-[inherit]" style={maxHeight ? { maxHeight: `${maxHeight}px` } : undefined}>
        {children}
      </ScrollAreaPrimitive.Viewport>
      <ScrollBar />
      <ScrollAreaPrimitive.Corner />
    </ScrollAreaPrimitive.Root>
  );
}

function ScrollBar({ className, orientation = "vertical", ...props }: React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Scrollbar> & { orientation?: "vertical" | "horizontal" }) {
  return (
    <ScrollAreaPrimitive.Scrollbar
      orientation={orientation}
      className={cn(
        "flex touch-none select-none transition-colors",
        orientation === "vertical" && "h-full w-2.5 border-l border-l-transparent p-px",
        orientation === "horizontal" && "h-2.5 flex-col border-t border-t-transparent p-px",
        className,
      )}
      {...props}
    >
      <ScrollAreaPrimitive.Thumb className="relative flex-1 rounded-full bg-border" />
    </ScrollAreaPrimitive.Scrollbar>
  );
}
