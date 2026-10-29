"use client";

import { useEffect, useState, type CSSProperties } from "react";

export function ResponseInteraction() {
  const [phase, setPhase] = useState<"idle" | "loading" | "complete">("idle");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (phase !== "loading") return;
    const started = performance.now();
    const timer = window.setInterval(() => {
      const next = Math.min(
        100,
        Math.round((performance.now() - started) / 24),
      );
      setProgress(next);
      if (next === 100) {
        window.clearInterval(timer);
        setPhase("complete");
      }
    }, 60);
    return () => window.clearInterval(timer);
  }, [phase]);

  return (
    <div
      className="demo-stage response-stage response-interactive"
      data-phase={phase}
      style={{ "--response-progress": `${progress}%` } as CSSProperties}
    >
      <div className="response-ring" aria-hidden="true">
        <svg viewBox="0 0 240 240" fill="none">
          <circle className="response-ring-track" cx="120" cy="120" r="110" />
          <circle
            className="response-ring-fill"
            cx="120"
            cy="120"
            r="110"
            pathLength="100"
            strokeDasharray="100"
            strokeDashoffset={100 - progress}
          />
        </svg>
      </div>
      <span className="response-label">Una respuesta clara a cada acción</span>
      <span className="response-percentage" aria-hidden="true">
        {phase === "idle" ? "¿Lo probamos?" : `${progress}%`}
      </span>
      <button
        className="try-button"
        type="button"
        disabled={phase === "loading"}
        aria-busy={phase === "loading"}
        onClick={() => {
          setProgress(0);
          setPhase("loading");
        }}
      >
        {phase === "loading"
          ? "Procesando"
          : phase === "complete"
            ? "Probar de nuevo"
            : "Probar interacción"}
        <span className="response-button-icon" aria-hidden="true">
          {phase === "loading" ? "" : phase === "complete" ? "✓" : "↗"}
        </span>
      </button>
      <span className="response-signal" role="status" aria-live="polite">
        {phase === "loading"
          ? "Preparando la experiencia…"
          : phase === "complete"
            ? "Acción confirmada"
            : "Toca el botón y sigue el círculo"}
      </span>
      <div
        className="response-loading-strip"
        role={phase === "loading" ? "progressbar" : undefined}
        aria-label={
          phase === "loading" ? "Progreso de la interacción" : undefined
        }
        aria-valuemin={phase === "loading" ? 0 : undefined}
        aria-valuemax={phase === "loading" ? 100 : undefined}
        aria-valuenow={phase === "loading" ? progress : undefined}
      >
        <span />
      </div>
    </div>
  );
}
