import type { ReactNode } from "react";

export function BentoGrid({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`grid grid-flow-dense grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5 ${className ?? ""}`}
    >
      {children}
    </div>
  );
}

/**
 * Tiles stacked in one grid cell (two columns from 640 px), for short tiles
 * that would leave a tall cell half empty beside the phone tiles.
 */
export function BentoStack({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={`flex flex-col gap-4 sm:col-span-2 lg:gap-5 ${className ?? ""}`}>{children}</div>;
}

type BentoTileProps = {
  /** large: 2×2 on desktop. medium: 2 columns. small: 1 column. */
  size?: "large" | "medium" | "small";
  /**
   * `stack`: text, then the visual under it. `row`: the visual beside the
   * text from 1024 px, for wide, short tiles (medium tiles and icon tiles).
   */
  layout?: "stack" | "row";
  title: string;
  /** The one line under the title. */
  children: ReactNode;
  /** Optional visual (a device, a widget, an icon). */
  media?: ReactNode;
  /**
   * `end`: the visual sits on the tile's bottom edge, so a cropped phone runs
   * off it. `center`: centred in the space left (widgets, icons).
   */
  mediaAlign?: "end" | "center";
  className?: string;
};

const span = {
  large: "sm:col-span-2 lg:row-span-2",
  medium: "sm:col-span-2",
  small: "",
} as const;

export function BentoTile({
  size = "small",
  layout = "stack",
  title,
  children,
  media,
  mediaAlign = "end",
  className,
}: BentoTileProps) {
  const row = layout === "row";
  const end = mediaAlign === "end";
  const mediaPlacement = row
    ? `pt-4 lg:shrink-0 lg:pt-0 ${end ? "lg:self-end" : ""}`
    : end
      ? "mt-auto pt-4"
      : "flex-1 items-center pt-4";
  return (
    <article
      className={`flex min-w-0 flex-1 flex-col gap-3 overflow-hidden rounded-tile border border-line bg-surface p-6 lg:p-8 ${
        row ? "lg:flex-row lg:items-center lg:gap-8" : ""
      } ${span[size]} ${className ?? ""}`}
    >
      <div className="flex min-w-0 flex-col gap-3 lg:flex-1">
        <h3 className="font-display text-card-title text-ink">{title}</h3>
        <p className="text-body text-ink-muted">{children}</p>
      </div>
      {media && (
        <div className={`flex justify-center ${mediaPlacement}`}>{media}</div>
      )}
    </article>
  );
}
