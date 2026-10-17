"use client";

import { useEffect, useRef, type ReactNode } from "react";

const landingTargets = [
  ".section-heading",
  ".solution",
  ".sector",
  ".demo-links > article",
  ".motion-intro",
  ".motion-demo",
  ".principles-top",
  ".principles-grid > article",
  ".about-main",
  ".about-details",
  ".process",
  ".contact-copy",
  ".form-panel",
].join(",");

export const demoScrollTargets = [
  ".demo-products > article",
  ".demo-panel",
  ".demo-appointments > article",
  ".demo-receipt",
  ".demo-pet-record",
  ".demo-orders > h3",
].join(",");

export function ScrollMotion({
  children,
  selector = landingTargets,
}: {
  children: ReactNode;
  selector?: string;
}) {
  const root = useRef<HTMLDivElement>(null);
  const progress = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const bar = progress.current;
    if (!bar) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const distance =
        document.documentElement.scrollHeight - window.innerHeight;
      const fraction =
        distance > 0 ? Math.min(1, Math.max(0, window.scrollY / distance)) : 0;
      bar.style.transform = `scaleX(${fraction})`;
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    const resize =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(schedule);
    resize?.observe(document.body);
    update();
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      resize?.disconnect();
      cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    const container = root.current;
    if (!container || typeof IntersectionObserver === "undefined") return;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const observed = new WeakSet<Element>();
    const active = new Map<HTMLElement, Animation>();
    const observer = new IntersectionObserver(
      (entries) => {
        let stagger = 0;
        for (const entry of entries) {
          if (!entry.isIntersecting || preference.matches) continue;
          observer.unobserve(entry.target);
          const element = entry.target as HTMLElement;
          if (typeof element.animate !== "function") continue;
          const heading = element.matches(
            ".section-heading, .principles-top, .about-main, .motion-intro, h3",
          );
          // A form or action must stay under the pointer while it gains focus.
          const interactive = element.querySelector(
            "button, a, input, select, textarea",
          );
          const animation = element.animate(
            [
              {
                opacity: 0.2,
                transform: interactive
                  ? "none"
                  : heading
                    ? "translateY(28px)"
                    : "translateY(36px) scale(0.975)",
              },
              {
                opacity: 1,
                transform: interactive ? "none" : "translateY(0) scale(1)",
              },
            ],
            {
              id: "scroll-reveal",
              duration: 760,
              delay: Math.min(stagger++ * 85, 170),
              easing: "cubic-bezier(0.16, 1, 0.3, 1)",
              fill: "backwards",
            },
          );
          active.set(element, animation);
          void animation.finished.then(
            () => active.delete(element),
            () => active.delete(element),
          );
        }
      },
      { threshold: 0, rootMargin: "0px 0px -40px 0px" },
    );

    const discover = (node: Element) => {
      if (preference.matches) return;
      const targets = [
        ...(node.matches(selector) ? [node] : []),
        ...node.querySelectorAll(selector),
      ];
      for (const element of targets) {
        if (observed.has(element)) continue;
        observed.add(element);
        observer.observe(element);
      }
    };
    discover(container);
    const mutations = new MutationObserver((records) => {
      for (const record of records) {
        for (const node of record.removedNodes) {
          if (!(node instanceof Element)) continue;
          for (const [element, animation] of active) {
            if (node === element || node.contains(element)) {
              animation.cancel();
              active.delete(element);
            }
          }
          // Removed cards may be reinserted by filters; release the observer now.
          if (node.matches(selector)) {
            observer.unobserve(node);
            observed.delete(node);
          }
          node.querySelectorAll(selector).forEach((element) => {
            observer.unobserve(element);
            observed.delete(element);
          });
        }
        for (const node of record.addedNodes)
          if (node instanceof Element) discover(node);
      }
    });
    mutations.observe(container, { childList: true, subtree: true });
    const changePreference = () => {
      if (preference.matches) {
        observer.disconnect();
        active.forEach((animation) => animation.cancel());
        active.clear();
      } else {
        // Also register content inserted while reduced motion was enabled.
        container.querySelectorAll(selector).forEach((element) => {
          observed.delete(element);
        });
        discover(container);
      }
    };
    const focus = (event: FocusEvent) => {
      if (!(event.target instanceof Node)) return;
      for (const [element, animation] of active)
        if (element.contains(event.target)) animation.cancel();
    };
    preference.addEventListener("change", changePreference);
    container.addEventListener("focusin", focus);
    return () => {
      observer.disconnect();
      mutations.disconnect();
      active.forEach((animation) => animation.cancel());
      preference.removeEventListener("change", changePreference);
      container.removeEventListener("focusin", focus);
    };
  }, [selector]);

  return (
    <div ref={root} className="scroll-motion">
      <div ref={progress} className="scroll-progress" aria-hidden="true" />
      {children}
    </div>
  );
}
