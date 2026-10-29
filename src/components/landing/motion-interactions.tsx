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
    return () => {
      observer?.disconnect();
    };
  }, []);
  return <div ref={root}>{children}</div>;
}
