import type { ReactNode } from "react";

/**
 * Two columns from the smallest phone, so small tiles sit side by side
 * instead of each taking a screen (PRE-318); large and medium tiles take both.
 */
export function BentoGrid({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`grid grid-flow-dense grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 lg:gap-5 ${className ?? ""}`}
    >
      {children}
    </div>
  );
}

/**
 * Tiles stacked in one grid cell (both columns), for short tiles
 * that would leave a tall cell half empty beside the phone tiles.
 */
export function BentoStack({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={`col-span-2 flex flex-col gap-4 lg:gap-5 ${className ?? ""}`}>{children}</div>;
}

type BentoTileProps = {
  /** large: 2×2 on desktop. medium: 2 columns. small: 1 column, so two share a row on phones. */
  size?: "large" | "medium" | "small";
  /**
   * `stack`: text, then the visual under it. `row`: the visual beside the
   * text, for wide, short tiles (medium tiles and icon tiles).
   */
  layout?: "stack" | "row";
  /**
   * Where `row` starts: 1024 px for small visuals (icons), 1280 px for a
   * phone, so the text keeps a readable width beside it.
   */
  rowFrom?: "lg" | "xl";
  title: string;
  /** The one line under the title. */
  children: ReactNode;
  /** Optional visual (a device, a widget, an icon). */
  media?: ReactNode;
  /**
   * `end`: the visual sits on the tile's bottom edge, so a cropped phone runs
   * off it. `center`: centred in the space left (widgets, icons). `start`:
   * right under the text, for a tall tile whose visual is shorter than the
   * tiles beside it, so no gap opens above the visual (PRE-318).
   */
  mediaAlign?: "end" | "center" | "start";
  /** Less padding below 640 px, for small tiles that share a row on phones. */
  compact?: boolean;
  className?: string;
};

const rowClass = {
  lg: { tile: "lg:flex-row lg:items-center lg:gap-8", text: "lg:flex-1", media: "lg:shrink-0 lg:pt-0", end: "lg:self-end" },
  xl: { tile: "xl:flex-row xl:items-center xl:gap-8", text: "xl:flex-1", media: "xl:shrink-0 xl:pt-0", end: "xl:self-end" },
} as const;

const span = {
  large: "col-span-2 lg:row-span-2",
  medium: "col-span-2",
  small: "",
} as const;

export function BentoTile({
  size = "small",
  layout = "stack",
  rowFrom = "lg",
  title,
  children,
  media,
  mediaAlign = "end",
  compact = false,
  className,
}: BentoTileProps) {
  const row = layout === "row";
  const end = mediaAlign === "end";
  const r = rowClass[rowFrom];
  const mediaPlacement = row
    ? `pt-4 ${r.media} ${end ? r.end : ""}`
    : end
      ? "mt-auto pt-4"
      : mediaAlign === "start"
        ? "pt-4"
        : "flex-1 items-center pt-4";
  return (
    <article
      className={`flex min-w-0 flex-1 flex-col gap-3 overflow-hidden rounded-tile border border-line bg-surface ${
        compact ? "p-4 sm:p-6" : "p-6"
      } lg:p-8 ${
        row ? r.tile : ""
      } ${span[size]} ${className ?? ""}`}
    >
      <div className={`flex min-w-0 flex-col gap-3 ${row ? r.text : ""}`}>
        <h3 className="font-display text-card-title text-ink">{title}</h3>
        <p className="text-body text-ink-muted">{children}</p>
      </div>
      {media && (
        <div className={`flex justify-center ${mediaPlacement}`}>{media}</div>
      )}
    </article>
  );
}
