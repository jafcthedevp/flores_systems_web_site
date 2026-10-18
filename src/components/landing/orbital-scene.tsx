"use client";
import { useEffect, useRef } from "react";
import { ORBITS, orbitPath, orbitPosition, orbitRadii } from "./orbit-geometry";

export function OrbitalScene({ children }: { children: React.ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const nodes = useRef<(HTMLSpanElement | null)[]>([]);
  const back = useRef<SVGSVGElement>(null);
  const front = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const scene = root.current;
    if (!scene) return;
    let width = scene.clientWidth,
      height = scene.clientHeight;
    let radius = orbitRadii(width, height);
    let frame = 0,
      visible = true;
    let pointerX = 0,
      pointerY = 0,
      cameraX = 0,
      cameraY = 0;
    let previousTime = performance.now();
    let elapsed = 0;
    const motionPreference = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );
    const resize = () => {
      width = scene.clientWidth;
      height = scene.clientHeight;
      radius = orbitRadii(width, height);
      for (const [svg, frontOnly] of [
        [back.current, false],
        [front.current, true],
      ] as const) {
        svg?.setAttribute("viewBox", `0 0 ${width} ${height}`);
        svg
          ?.querySelectorAll("path")
          .forEach((path, index) =>
            path.setAttribute("d", orbitPath(index, width, height, frontOnly)),
          );
      }
    };
    const paint = () => {
      const intensity = motionPreference.matches ? 0.35 : 1;
      cameraX += (pointerX * intensity - cameraX) * 0.045;
      cameraY += (pointerY * intensity - cameraY) * 0.045;
      scene.style.setProperty("--parallax-x", `${(cameraX * 7).toFixed(2)}px`);
      scene.style.setProperty("--parallax-y", `${(cameraY * 5).toFixed(2)}px`);
      for (let index = 0; index < ORBITS.length; index++) {
        const node = nodes.current[index];
        if (!node) continue;
        const point = orbitPosition(index, elapsed, cameraX, cameraY);
        node.style.transform = `translate3d(${(point.x * radius.x).toFixed(2)}px, ${(point.y * radius.y).toFixed(2)}px, 0) translate(-50%, -50%) scale(${point.scale.toFixed(4)})`;
        node.style.zIndex = String(point.layer);
        node.style.opacity = String(point.opacity);
        node.style.setProperty("--orbit-depth", point.depth.toFixed(4));
      }
    };
    const tick = (now: number) => {
      const speed = motionPreference.matches ? 0.35 : 1;
      elapsed += (Math.min(now - previousTime, 64) / 1000) * speed;
      previousTime = now;
      paint();
      frame = requestAnimationFrame(tick);
    };
    const sync = () => {
      cancelAnimationFrame(frame);
      previousTime = performance.now();
      paint();
      if (visible && !document.hidden) frame = requestAnimationFrame(tick);
    };
    const move = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      const box = scene.getBoundingClientRect();
      pointerX = Math.max(
        -1,
        Math.min(1, ((event.clientX - box.left) / box.width) * 2 - 1),
      );
      pointerY = Math.max(
        -1,
        Math.min(1, ((event.clientY - box.top) / box.height) * 2 - 1),
      );
    };
    const leave = () => {
      pointerX = 0;
      pointerY = 0;
    };
    resize();
    nodes.current.forEach((node) => {
      if (node) {
        node.style.left = "50%";
        node.style.top = "50%";
      }
    });
    const sizeObserver = new ResizeObserver(resize);
    sizeObserver.observe(scene);
    const visibilityObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      sync();
    });
    visibilityObserver.observe(scene);
    scene.addEventListener("pointermove", move, { passive: true });
    scene.addEventListener("pointerleave", leave);
    document.addEventListener("visibilitychange", sync);
    motionPreference.addEventListener("change", sync);
    sync();
    return () => {
      cancelAnimationFrame(frame);
      sizeObserver.disconnect();
      visibilityObserver.disconnect();
      scene.removeEventListener("pointermove", move);
      scene.removeEventListener("pointerleave", leave);
      document.removeEventListener("visibilitychange", sync);
      motionPreference.removeEventListener("change", sync);
    };
  }, []);

  return (
    <div
      ref={root}
      className="hero-visual hero-orbits orbital-scene"
      role="img"
      aria-label="Flor azul rodeada de tres mensajes en órbitas tridimensionales"
    >
      <div className="hero-gridline" aria-hidden="true" />
      <svg
        ref={back}
        className="orbital-paths orbital-paths-back"
        viewBox="0 0 600 650"
        aria-hidden="true"
      >
        {ORBITS.map((orbit, index) => (
          <path
            key={orbit.text}
            d={orbitPath(index, 600, 650)}
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </svg>
      <div className="orbital-core">{children}</div>
      <svg
        ref={front}
        className="orbital-paths orbital-paths-front"
        viewBox="0 0 600 650"
        aria-hidden="true"
      >
        {ORBITS.map((orbit, index) => (
          <path
            key={orbit.text}
            d={orbitPath(index, 600, 650, true)}
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </svg>
      {ORBITS.map((orbit, index) => {
        const point = orbitPosition(index, 0);
        return (
          <span
            key={orbit.text}
            ref={(node) => {
              nodes.current[index] = node;
            }}
            className={`visual-caption orbital-message visual-caption-${["top", "bottom", "third"][index]}`}
            style={{
              left: `${50 + point.x * 25}%`,
              top: `${50 + point.y * 35}%`,
              transform: `translate(-50%, -50%) scale(${point.scale})`,
              zIndex: point.layer,
            }}
          >
            <span className="orbital-spark" aria-hidden="true" />
            {orbit.text}
          </span>
        );
      })}
    </div>
  );
}
