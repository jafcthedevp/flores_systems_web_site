"use client";

import { useEffect } from "react";
import styles from "./heading-light.module.css";

/** Section headings receive a light pass when they enter the viewport. */
export function HeadingLight() {
  useEffect(() => {
    if (
      typeof IntersectionObserver === "undefined" ||
      typeof Element.prototype.animate !== "function"
    )
      return;

    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const contrast = window.matchMedia("(forced-colors: active)");
    const headings = document.querySelectorAll<HTMLElement>(
      "#contenido h2",
    );
    const active = new Map<HTMLElement, Animation>();
    const restore = (heading: HTMLElement) => {
      heading.classList.remove(styles.light);
      heading.style.removeProperty("--heading-ink");
      heading.style.removeProperty("--heading-accent");
      active.delete(heading);
    };
    const stop = (heading: HTMLElement) => {
      active.get(heading)?.cancel();
      restore(heading);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        if (preference.matches || contrast.matches) return;
        for (const entry of entries) {
          const heading = entry.target as HTMLElement;
          if (!entry.isIntersecting || entry.intersectionRatio < 0.3) {
            stop(heading);
            continue;
          }
          if (active.has(heading)) continue;
          const ink = getComputedStyle(heading).color;
          const channels = ink
            .match(/[\d.]+/g)
            ?.slice(0, 3)
            .map(Number) || [0, 0, 0];
          const lightText =
            channels.reduce((total, channel) => total + channel, 0) > 480;
          heading.style.setProperty("--heading-ink", ink);
          heading.style.setProperty(
            "--heading-accent",
            lightText ? "#71d5ff" : "#125ef3",
          );
          heading.classList.add(styles.light);
          const animation = heading.animate(
            [
              { backgroundPosition: "150% 0", offset: 0 },
              { backgroundPosition: "-50% 0", offset: 1 },
            ],
            {
              id: "heading-light",
              delay: 560,
              duration: 2800,
              iterations: 1,
              easing: "linear",
            },
          );
          active.set(heading, animation);
          void animation.finished.then(
            () => {
              if (active.get(heading) === animation) restore(heading);
            },
            () => {
              if (active.get(heading) === animation) restore(heading);
            },
          );
        }
      },
      { threshold: 0.3, rootMargin: "-85px 0px -12% 0px" },
    );

    const sync = () => {
      observer.disconnect();
      if (preference.matches || contrast.matches) {
        for (const heading of active.keys()) stop(heading);
      } else {
        for (const heading of headings) observer.observe(heading);
      }
    };
    preference.addEventListener("change", sync);
    contrast.addEventListener("change", sync);
    sync();
    return () => {
      observer.disconnect();
      for (const heading of active.keys()) stop(heading);
      preference.removeEventListener("change", sync);
      contrast.removeEventListener("change", sync);
    };
  }, []);

  return null;
}
