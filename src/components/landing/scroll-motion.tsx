"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { motion, useScroll, useTransform } from "motion/react";

type ScrollAnimationMode = "disabled" | "reduced" | "full";
const ScrollAnimationContext = createContext<ScrollAnimationMode>("disabled");
const reducedMotionQuery = "(prefers-reduced-motion: reduce)";

function subscribeToMotionPreference(onChange: () => void) {
  const preference = window.matchMedia(reducedMotionQuery);
  preference.addEventListener("change", onChange);
  return () => preference.removeEventListener("change", onChange);
}

function getScrollAnimationMode(): ScrollAnimationMode {
  if (typeof Element.prototype.animate !== "function") return "disabled";
  return window.matchMedia(reducedMotionQuery).matches ? "reduced" : "full";
}

// Keep the server markup static, then enable native bindings after hydration.
const serverAnimationMode = (): ScrollAnimationMode => "disabled";

type ScrollSceneName =
  | "hero"
  | "marquee"
  | "solutions"
  | "sectors"
  | "demos"
  | "gallery"
  | "principles"
  | "about"
  | "contact"
  | "footer";

const sceneTracks: Record<
  ScrollSceneName,
  {
    y: number[];
    scale: number[];
    opacity: number[];
  }
> = {
  hero: {
    y: [0, -24, -72],
    scale: [1, 0.98, 0.94],
    opacity: [1, 0.96, 0.76],
  },
  marquee: {
    y: [8, 0, -8],
    scale: [1, 1, 1],
    opacity: [1, 1, 1],
  },
  solutions: {
    y: [42, 0, -26],
    scale: [0.99, 1, 0.99],
    opacity: [1, 1, 1],
  },
  sectors: {
    y: [-24, 0, 28],
    scale: [0.99, 1, 0.99],
    opacity: [1, 1, 1],
  },
  demos: {
    y: [34, 0, -24],
    scale: [0.99, 1, 0.99],
    opacity: [1, 1, 1],
  },
  gallery: {
    y: [26, 0, -22],
    scale: [0.995, 1, 0.995],
    opacity: [1, 1, 1],
  },
  principles: {
    y: [20, 0, -18],
    scale: [0.995, 1, 0.995],
    opacity: [1, 1, 1],
  },
  about: {
    y: [22, 0, -14],
    scale: [0.995, 1, 1],
    opacity: [1, 1, 1],
  },
  contact: {
    y: [14, 0, -8],
    scale: [0.995, 1, 1],
    opacity: [1, 1, 1],
  },
  footer: {
    y: [8, 0, -4],
    scale: [1, 1, 1],
    opacity: [1, 1, 1],
  },
};

const sceneProgress = [0, 0.5, 1];

export function ScrollScene({
  children,
  scene,
}: {
  children: ReactNode;
  scene: ScrollSceneName;
}) {
  const target = useRef<HTMLDivElement>(null);
  const mode = useContext(ScrollAnimationContext);
  const canAnimate = mode !== "disabled";
  const { scrollYProgress } = useScroll({
    target,
    offset:
      scene === "hero"
        ? ["start start", "end start"]
        : ["start end", "end start"],
  });
  const track = sceneTracks[scene];
  const y = useTransform(scrollYProgress, sceneProgress, track.y);
  const gentleY = useTransform(
    scrollYProgress,
    sceneProgress,
    track.y.map((value) => value * 0.35),
  );
  const scale = useTransform(scrollYProgress, sceneProgress, track.scale);
  const opacity = useTransform(scrollYProgress, sceneProgress, track.opacity);
  return (
    <motion.div
      ref={target}
      className={`scroll-scene scroll-scene-${scene}`}
      style={{
        y: canAnimate ? (mode === "reduced" ? gentleY : y) : 0,
        scale: mode === "full" ? scale : 1,
        opacity: mode === "full" ? opacity : 1,
      }}
    >
      {children}
    </motion.div>
  );
}

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
  ".demo-sales-history",
  ".demo-reminder",
  ".demo-return-history",
].join(",");

export function ScrollMotion({
  children,
  selector = landingTargets,
}: {
  children: ReactNode;
  selector?: string;
}) {
  const root = useRef<HTMLDivElement>(null);
  const mode = useSyncExternalStore(
    subscribeToMotionPreference,
    getScrollAnimationMode,
    serverAnimationMode,
  );
  const { scrollYProgress } = useScroll({ trackContentSize: true });

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
          if (element.contains(document.activeElement)) continue;
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
                opacity: 0.6,
                transform: interactive
                  ? "none"
                  : heading
                    ? "translateY(12px)"
                    : "translateY(18px) scale(0.99)",
              },
              {
                opacity: 1,
                transform: interactive ? "none" : "translateY(0) scale(1)",
              },
            ],
            {
              id: "scroll-reveal",
              duration: 520,
              delay: Math.min(stagger++ * 60, 120),
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
    <ScrollAnimationContext value={mode}>
      <div ref={root} className="scroll-motion">
        <motion.div
          className="scroll-progress"
          style={{ scaleX: mode !== "disabled" ? scrollYProgress : 0 }}
          aria-hidden="true"
        />
        {children}
      </div>
    </ScrollAnimationContext>
  );
}
