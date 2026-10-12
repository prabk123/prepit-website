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

type BentoTileProps = {
  /** large: 2×2 on desktop. medium: 2 columns. small: 1 column. */
  size?: "large" | "medium" | "small";
  title: string;
  /** The one line under the title. */
  children: ReactNode;
  /** Optional visual, shown under the text (a device, a widget, an icon). */
  media?: ReactNode;
  className?: string;
};

const span = {
  large: "sm:col-span-2 lg:row-span-2",
  medium: "sm:col-span-2",
  small: "",
} as const;

export function BentoTile({ size = "small", title, children, media, className }: BentoTileProps) {
  return (
    <article
      className={`flex min-w-0 flex-col gap-3 overflow-hidden rounded-tile border border-line bg-surface p-6 lg:p-8 ${span[size]} ${className ?? ""}`}
    >
      <h3 className="font-display text-card-title text-ink">{title}</h3>
      <p className="text-body text-ink-muted">{children}</p>
      {media && <div className="mt-auto flex justify-center pt-4">{media}</div>}
    </article>
  );
}
