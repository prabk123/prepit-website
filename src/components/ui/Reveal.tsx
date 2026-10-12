"use client";

import { useEffect, useRef, type ReactNode } from "react";

type RevealProps = {
  children: ReactNode;
  /** Stagger siblings, in ms. */
  delay?: number;
  className?: string;
};

/**
 * Fades its content up 16 px as it scrolls into view. Content is visible in
 * the server HTML; only blocks that start below the fold are hidden, and only
 * once the page is running, so nothing flashes and nothing stays hidden
 * without JavaScript. Does nothing under reduced motion.
 */
export default function Reveal({ children, delay, className }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (element.getBoundingClientRect().top < window.innerHeight) return;

    element.dataset.reveal = "pending";
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        element.dataset.reveal = "shown";
        observer.disconnect();
      },
      // Any overlap past the bottom tenth of the screen, so very tall blocks reveal too.
      { rootMargin: "0px 0px -10% 0px" },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`reveal ${className ?? ""}`}
      style={delay ? ({ "--reveal-delay": `${delay}ms` } as React.CSSProperties) : undefined}
    >
      {children}
    </div>
  );
}
