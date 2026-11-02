"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";

/**
 * Fades its content up once, as it first scrolls into view, then holds
 * (landing-v9.css). It renders shown: only after hydration, and only when it
 * starts below the fold and motion is allowed, is it marked waiting. So the
 * page reads the same without JavaScript or under reduced motion.
 */
export default function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  /** Milliseconds after it arrives, for a short stagger between pieces of one section. */
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !("IntersectionObserver" in window)) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (el.getBoundingClientRect().top < window.innerHeight) return;

    el.dataset.state = "waiting";
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        el.dataset.state = "shown";
        observer.disconnect();
      },
      { rootMargin: "0px 0px -12% 0px" },
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      el.dataset.state = "shown";
    };
  }, []);

  return (
    <div
      ref={ref}
      data-state="shown"
      className={`v9-reveal ${className ?? ""}`}
      style={delay ? ({ "--v9-delay": `${delay}ms` } as CSSProperties) : undefined}
    >
      {children}
    </div>
  );
}
