"use client";

import { Children, type ReactNode, useEffect, useRef, useState } from "react";

type SwipeRowProps = {
  /** Read out for the scrolling list, e.g. "Messages your nutritionist sends". */
  label: string;
  children: ReactNode;
  /**
   * From 1024 px: `stack` lays the items one under another, `row` side by
   * side, `scroll` keeps the swipe inside its column. Below 1024 px they are
   * always one row you swipe.
   */
  desktop?: "stack" | "row" | "scroll";
  /** Width of each item on phones; the next one peeks in so it reads as swipeable. */
  itemClassName?: string;
  className?: string;
};

/**
 * A row you swipe sideways on phones, so several examples take one screen
 * instead of a stack (PRE-284). The row runs to the screen edges and snaps
 * to each item; from 1024 px it becomes a stack or a plain row. It is a
 * keyboard tab stop only while it actually scrolls.
 */
export default function SwipeRow({
  label,
  children,
  desktop = "row",
  itemClassName = "w-[82%] max-w-[360px]",
  className,
}: SwipeRowProps) {
  const ref = useRef<HTMLUListElement>(null);
  const [scrolls, setScrolls] = useState(false);
  useEffect(() => {
    const list = ref.current;
    if (!list) return;
    const check = () => setScrolls(list.scrollWidth > list.clientWidth + 1);
    const observer = new ResizeObserver(check);
    observer.observe(list);
    return () => observer.disconnect();
  }, []);
  const scroll = desktop === "scroll";
  const desktopList = scroll
    ? "lg:mx-0 lg:scroll-px-0 lg:px-0"
    : `lg:mx-0 lg:snap-none lg:overflow-visible lg:px-0 lg:pb-0 ${desktop === "stack" ? "lg:flex-col" : "lg:justify-center"}`;
  const desktopItem = scroll ? "" : "lg:w-auto lg:max-w-none lg:shrink";
  return (
    <ul
      ref={ref}
      aria-label={label}
      tabIndex={scrolls ? 0 : undefined}
      className={`swipe-row -mx-gutter flex snap-x snap-mandatory scroll-px-gutter gap-4 overflow-x-auto px-gutter pb-2 ${desktopList} ${
        className ?? ""
      }`}
    >
      {Children.toArray(children).map((child, index) => (
        <li key={index} className={`flex shrink-0 snap-start ${desktopItem} ${itemClassName}`}>
          {child}
        </li>
      ))}
    </ul>
  );
}
