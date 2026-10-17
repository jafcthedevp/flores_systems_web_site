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
    const demos = container.querySelectorAll(".motion-demo[data-demo]");
    const observer =
      typeof IntersectionObserver === "undefined"
        ? null
        : new IntersectionObserver(
            (entries) =>
              entries.forEach((entry) => {
                if (entry.isIntersecting) {
                  entry.target.classList.add("is-playing");
                } else {
                  entry.target.classList.remove("is-playing");
                }
              }),
            { threshold: 0.2 },
          );
    demos.forEach((demo) =>
      observer ? observer.observe(demo) : demo.classList.add("is-playing"),
    );
    const click = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
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
      observer?.disconnect();
      container.removeEventListener("click", click);
    };
  }, []);
  return <div ref={root}>{children}</div>;
}
