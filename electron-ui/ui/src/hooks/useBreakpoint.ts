import { useState, useEffect } from "react";
import { breakpoints } from "../design-tokens.js";

export type Breakpoint = "mobile" | "tablet" | "desktop";

function getBreakpoint(width: number): Breakpoint {
  if (width < breakpoints.mobile) return "mobile";
  if (width < breakpoints.tablet) return "tablet";
  return "desktop";
}

export function useBreakpoint(): Breakpoint {
  const [bp, setBp] = useState<Breakpoint>(() =>
    typeof window !== "undefined" ? getBreakpoint(window.innerWidth) : "desktop",
  );

  useEffect(() => {
    const handleResize = () => setBp(getBreakpoint(window.innerWidth));
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return bp;
}
