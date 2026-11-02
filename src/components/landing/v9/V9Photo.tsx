import type { CSSProperties } from "react";

/**
 * A photo from public/landing/v9, as AVIF and WebP at the widths exported
 * (PRE-432; the export commands are in that PR). Lazy unless `priority`.
 */
export function V9Photo({
  name,
  widths,
  width,
  height,
  sizes,
  alt,
  className,
  style,
  priority,
}: {
  name: string;
  widths: number[];
  /** Intrinsic size of the largest file, so the box is reserved before it loads. */
  width: number;
  height: number;
  sizes: string;
  alt: string;
  className?: string;
  style?: CSSProperties;
  priority?: boolean;
}) {
  const set = (ext: string) => widths.map((w) => `/landing/v9/${name}-${w}.${ext} ${w}w`).join(", ");
  return (
    <picture>
      <source srcSet={set("avif")} sizes={sizes} type="image/avif" />
      <source srcSet={set("webp")} sizes={sizes} type="image/webp" />
      <img
        src={`/landing/v9/${name}-${widths[widths.length - 1]}.webp`}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : undefined}
        decoding="async"
        className={className}
        style={style}
      />
    </picture>
  );
}

/** A real app capture in public/landing/v9 (screen-*.webp), at its exported size. */
export function V9Screen({
  name,
  width,
  height,
  alt,
  className,
}: {
  name: string;
  width: number;
  height: number;
  alt: string;
  className?: string;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- a capture already exported at its display size
    <img
      src={`/landing/v9/screen-${name}.webp`}
      alt={alt}
      width={width}
      height={height}
      loading="lazy"
      decoding="async"
      className={`block h-auto w-full ${className ?? ""}`}
    />
  );
}
