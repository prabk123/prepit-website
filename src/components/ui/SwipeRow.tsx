import { Children, type ReactNode } from "react";

type SwipeRowProps = {
  /** Read out for the scrolling list, e.g. "Messages your nutritionist sends". */
  label: string;
  children: ReactNode;
  /**
   * From 1024 px: `stack` lays the items one under another, `row` side by
   * side. Below 1024 px they are always one row you swipe.
   */
  desktop?: "stack" | "row";
  /** Width of each item on phones; the next one peeks in so it reads as swipeable. */
  itemClassName?: string;
  className?: string;
};

/**
 * A row you swipe sideways on phones, so several examples take one screen
 * instead of a stack (PRE-284). The row runs to the screen edges and snaps
 * to each item; from 1024 px it becomes a stack or a plain row.
 */
export default function SwipeRow({
  label,
  children,
  desktop = "row",
  itemClassName = "w-[82%] max-w-[360px]",
  className,
}: SwipeRowProps) {
  const desktopList = desktop === "stack" ? "lg:flex-col" : "lg:justify-center";
  return (
    <ul
      aria-label={label}
      tabIndex={0}
      className={`swipe-row -mx-gutter flex snap-x snap-mandatory scroll-px-gutter gap-4 overflow-x-auto px-gutter pb-2 lg:mx-0 lg:snap-none lg:overflow-visible lg:px-0 lg:pb-0 ${desktopList} ${
        className ?? ""
      }`}
    >
      {Children.toArray(children).map((child, index) => (
        <li key={index} className={`flex shrink-0 snap-start lg:w-auto lg:max-w-none lg:shrink ${itemClassName}`}>
          {child}
        </li>
      ))}
    </ul>
  );
}
