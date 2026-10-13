export type Point = {
  title: string;
  detail: string;
  /** A signal or accent colour token for a small dot before the title, e.g. "var(--color-energy)". */
  accent?: string;
};

type PointListProps = {
  points: Point[];
  /**
   * `rows`: title left, detail right, ruled lines (lists beside a phone).
   * `stacked`: title over detail, ruled lines.
   * `columns`: side by side from 1024 px with a rule above, display titles
   * (the proof strip, the three frustrations, the three signals).
   */
  layout?: "rows" | "stacked" | "columns";
  /** Column count for `columns` from 1024 px. */
  columns?: 3 | 4;
  /** `large` sets column titles at title size (the proof strip). */
  titleSize?: "card" | "large";
  className?: string;
};

const columnClass = { 3: "lg:grid-cols-3", 4: "sm:grid-cols-2 lg:grid-cols-4" } as const;

function Dot({ color }: { color?: string }) {
  if (!color) return null;
  return <span aria-hidden className="mt-[0.45em] h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: color }} />;
}

/** The one list pattern for short points: rows, stacked or columns. */
export default function PointList({
  points,
  layout = "stacked",
  columns = 3,
  titleSize = "card",
  className,
}: PointListProps) {
  if (layout === "columns") {
    return (
      <ul className={`grid gap-x-10 gap-y-8 ${columnClass[columns]} ${className ?? ""}`}>
        {points.map((point) => (
          <li key={point.title} className="flex flex-col gap-2 border-t border-line pt-5">
            <p className="flex items-start gap-3">
              <Dot color={point.accent} />
              <span
                className={`font-display text-ink ${titleSize === "large" ? "text-title" : "text-card-title"}`}
              >
                {point.title}
              </span>
            </p>
            <p className="text-body text-ink-muted text-pretty">{point.detail}</p>
          </li>
        ))}
      </ul>
    );
  }

  if (layout === "rows") {
    return (
      <ul className={`flex flex-col border-b border-line-strong ${className ?? ""}`}>
        {points.map((point) => (
          <li
            key={point.title}
            className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-t border-line-strong py-3.5 text-body"
          >
            <span className="font-medium text-ink">{point.title}</span>
            <span className="text-ink-muted sm:text-right">{point.detail}</span>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <ul className={`flex flex-col border-b border-line ${className ?? ""}`}>
      {points.map((point) => (
        <li key={point.title} className="flex flex-col gap-1 border-t border-line py-4">
          <span className="text-lead font-medium text-ink">{point.title}</span>
          <span className="text-body text-ink-muted text-pretty">{point.detail}</span>
        </li>
      ))}
    </ul>
  );
}
