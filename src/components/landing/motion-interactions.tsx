"use client";
import { useEffect, useRef } from "react";
export function MotionInteractions({
  children,
}: {
  children: React.ReactNode;
}) {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const container = root.current;
    if (!container) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const play = (demo: Element) => {
      if (reduced.matches) return;
      demo.classList.remove("is-playing");
      // Reinicia la animación al pulsar «Repetir».
      void (demo as HTMLElement).offsetWidth;
      demo.classList.add("is-playing");
    };
    const demos = container.querySelectorAll(".motion-demo[data-demo]");
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            play(entry.target);
            observer.unobserve(entry.target);
          }
        }),
      { threshold: 0.35 },
    );
    demos.forEach((demo) => observer.observe(demo));
    const click = (event: MouseEvent) => {
      const target = event.target as Element;
      const replay = target.closest("[data-replay]");
      if (replay) {
        const demo = replay.closest(".motion-demo");
        if (demo) play(demo);
      }
      const button = target.closest(".try-button");
      if (button) {
        const pressed = button.getAttribute("aria-pressed") !== "true";
        button.setAttribute("aria-pressed", String(pressed));
        if (button.firstChild)
          button.firstChild.textContent = pressed
            ? "Listo "
            : "Probar interacción ";
        const signal = container.querySelector(".response-signal");
        if (signal)
          signal.textContent = pressed ? "Acción confirmada" : "Toca el botón";
      }
    };
    container.addEventListener("click", click);
    return () => {
      observer.disconnect();
      container.removeEventListener("click", click);
    };
  }, []);
  return <div ref={root}>{children}</div>;
}
