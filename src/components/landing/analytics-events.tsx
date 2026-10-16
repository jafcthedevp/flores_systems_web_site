"use client";
import { useEffect } from "react";
import { track } from "@/lib/analytics";
export function AnalyticsEvents() {
  useEffect(() => {
    track("visit");
    const click = (event: MouseEvent) => {
      const target = (event.target as Element).closest("[data-analytics]");
      const name = target?.getAttribute("data-analytics");
      if (name === "demo_click" || name === "booking_click") track(name);
    };
    document.addEventListener("click", click);
    return () => document.removeEventListener("click", click);
  }, []);
  return null;
}
