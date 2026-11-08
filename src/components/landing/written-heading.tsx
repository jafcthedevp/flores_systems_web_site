"use client";
import {
  Children,
  cloneElement,
  isValidElement,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import styles from "./written-heading.module.css";

function characters(children: ReactNode): ReactNode {
  return Children.map(children, (child) => {
    if (typeof child === "string" || typeof child === "number") {
      return String(child)
        .split(/(\s+)/)
        .map((word, index) =>
          /^\s+$/.test(word) ? (
            word
          ) : (
            <span className={styles.word} data-written-word key={index}>
              {Array.from(word).map((letter, i) => (
                <span
                  data-written-character
                  className={styles.character}
                  key={i}
                >
                  {letter}
                </span>
              ))}
            </span>
          ),
        );
    }
    if (
      isValidElement<{ children?: ReactNode }>(child) &&
      child.props.children !== undefined
    )
      return cloneElement(child, {}, characters(child.props.children));
    return child;
  });
}
function accessibleText(children: ReactNode): string {
  return Children.toArray(children)
    .map((child) => {
      if (typeof child === "string" || typeof child === "number")
        return String(child);
      if (isValidElement<{ children?: ReactNode }>(child))
        return child.type === "br" ? " " : accessibleText(child.props.children);
      return "";
    })
    .join("");
}
export function WrittenHeading({
  children,
  as: Tag = "h2",
  className,
  id,
}: {
  children: ReactNode;
  as?: "h1" | "h2" | "h3";
  className?: string;
  id?: string;
}) {
  const root = useRef<HTMLHeadingElement>(null);
  const text = accessibleText(children).replace(/\s+/g, " ").trim();
  useEffect(() => {
    const element = root.current;
    if (!element || !window.IntersectionObserver) return;
    const animations: Animation[] = [];
    let visible = false;
    const clear = () => {
      animations.splice(0).forEach((animation) => animation.cancel());
    };
    const observer = new IntersectionObserver(
      (entries) => {
        const entered = entries.some(
          (entry) => entry.isIntersecting && entry.intersectionRatio >= 0.2,
        );
        if (!entered) {
          visible = false;
          clear();
          return;
        }
        if (visible) return;
        visible = true;
        clear();
        const words = [
          ...element.querySelectorAll<HTMLElement>("[data-written-word]"),
        ];
        words.forEach((word, index) =>
          animations.push(
            word.animate(
              [
                {
                  opacity: 0,
                  filter: "blur(8px)",
                  transform: "translateY(12px)",
                },
                { opacity: 1, filter: "blur(0px)", transform: "translateY(0)" },
              ],
              {
                id: "written-heading",
                duration: 700,
                delay: index * Math.min(80, 900 / Math.max(words.length, 1)),
                easing: "cubic-bezier(.16,1,.3,1)",
                fill: "backwards",
              },
            ),
          ),
        );
      },
      { threshold: 0.2, rootMargin: "0px 0px -8% 0px" },
    );
    observer.observe(element);
    return () => {
      observer.disconnect();
      clear();
    };
  }, [text]);
  return (
    <Tag
      ref={root}
      className={className}
      id={id}
      data-written-heading
      aria-label={text}
    >
      <span aria-hidden="true">{characters(children)}</span>
    </Tag>
  );
}
