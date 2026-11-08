"use client";
import { useEffect, useRef } from "react";
import styles from "./agentic.module.css";
export function GlassFilm() {
  const video = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const element = video.current;
    if (!element) return;
    // Set the DOM properties before play(), including on browsers that check
    // the muted property rather than the server-rendered attribute.
    element.muted = true;
    element.defaultMuted = true;
    let visible = true;
    const sync = () => {
      if (!visible || document.hidden) element.pause();
      else
        void element.play().catch(() => {
          // A subsequent canplay/pageshow event retries an interrupted start.
        });
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      sync();
    });
    observer.observe(element);
    document.addEventListener("visibilitychange", sync);
    // Retry when the first frame becomes playable if the initial request was
    // interrupted by hydration, loading, or a visibility change.
    element.addEventListener("canplay", sync);
    window.addEventListener("pageshow", sync);
    sync();
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", sync);
      element.removeEventListener("canplay", sync);
      window.removeEventListener("pageshow", sync);
      element.pause();
    };
  }, []);
  return (
    <video
      ref={video}
      className={styles.film}
      muted
      autoPlay
      loop
      playsInline
      preload="auto"
      poster="/agentic/hero-poster.jpg"
      aria-hidden="true"
    >
      <source src="/agentic/hero-loop.mp4" type="video/mp4" />
    </video>
  );
}
