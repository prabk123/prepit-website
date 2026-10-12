type RatingProps = {
  /**
   * Average App Store rating, 0 to 5. "placeholder" shows empty stars and a
   * visible [RATING] until the real figure is known; never invent one.
   */
  value: number | "placeholder";
  /** Number of ratings, when it is worth showing. */
  count?: number;
  /** Text after the number, e.g. "on the App Store". */
  suffix?: string;
  className?: string;
};

function Star({ fill }: { fill: number }) {
  return (
    <span className="relative inline-block h-4 w-4" aria-hidden>
      <svg viewBox="0 0 16 16" className="absolute inset-0 h-4 w-4 text-line-strong">
        <path d="M8 1.2l2.1 4.3 4.7.7-3.4 3.3.8 4.7L8 12l-4.2 2.2.8-4.7L1.2 6.2l4.7-.7z" fill="currentColor" />
      </svg>
      <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
        <svg viewBox="0 0 16 16" className="h-4 w-4 text-energy">
          <path d="M8 1.2l2.1 4.3 4.7.7-3.4 3.3.8 4.7L8 12l-4.2 2.2.8-4.7L1.2 6.2l4.7-.7z" fill="currentColor" />
        </svg>
      </span>
    </span>
  );
}

/** Stars plus "4.8 on the App Store". Read out as one sentence. */
export default function Rating({ value, count, suffix = "on the App Store", className }: RatingProps) {
  const isPlaceholder = value === "placeholder";
  const rounded = isPlaceholder ? 0 : Math.round(value * 10) / 10;
  const shown = isPlaceholder ? "[RATING]" : rounded;
  const countText = count ? ` from ${count.toLocaleString("en-US")} ratings` : "";
  const spoken = isPlaceholder
    ? `Rating placeholder ${suffix}`
    : `Rated ${rounded} out of 5${countText} ${suffix}`;

  return (
    <span className={`inline-flex items-center gap-2 ${className ?? ""}`}>
      <span className="flex gap-0.5">
        {[0, 1, 2, 3, 4].map((index) => (
          <Star key={index} fill={Math.min(1, Math.max(0, rounded - index))} />
        ))}
      </span>
      <span className="sr-only">{spoken}</span>
      <span aria-hidden className="tabular-nums">
        {shown}
        {countText} {suffix}
      </span>
    </span>
  );
}
