"use client";
import { useState } from "react";
export function MotionToggle({ children }: { children: React.ReactNode }) {
  const [paused, setPaused] = useState(false);
  return (
    <div className="motion-surface" data-paused={paused}>
      {children}
      <div className="motion-toggle-wrap wrap">
        <button
          className="motion-toggle"
          type="button"
          aria-pressed={paused}
          onClick={() => setPaused((value) => !value)}
        >
          {paused ? "Reanudar movimiento" : "Pausar movimiento"}
        </button>
      </div>
    </div>
  );
}
