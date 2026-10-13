import type { ReactNode } from "react";

export type SectionPhoto = {
  /** Fallback file, for browsers that take neither source below. */
  src: string;
  /**
   * AVIF and WebP sources: one file, or a srcset of widths
   * ("/a-800w.webp 800w, /a-1600w.webp 1600w") read with `sizes`.
   */
  avif?: string;
  webp?: string;
  /** How wide the photo shows, for picking from a width srcset. Default "100vw". */
  sizes?: string;
  /** Intrinsic size, so the browser can pick and decode it without guessing. */
  width: number;
  height: number;
  /** Background photos are decorative unless they carry meaning. */
  alt?: string;
  /** CSS object-position, for keeping the subject in frame. */
  position?: string;
  /** Load eagerly at high priority, for a photo section at the top of a page. */
  priority?: boolean;
};

type SectionProps = {
  id?: string;
  /**
   * `page`: the warm near-black page. `surface`: one step lighter, to set a
   * section apart. `photo`: a full-bleed lifestyle photo under a dark gradient.
   */
  tone?: "page" | "surface" | "photo";
  photo?: SectionPhoto;
  /** id of the heading that names this section, for screen readers. */
  labelledBy?: string;
  /**
   * Fixed name sent with `home_section_viewed` when the section reaches the
   * middle of the screen (needs <SectionViewTracker> on the page).
   */
  analyticsName?: string;
  className?: string;
  children: ReactNode;
};

/** The one section wrapper: tone, page gutter, 1200 px column and section spacing. */
export default function Section({
  id,
  tone = "page",
  photo,
  labelledBy,
  analyticsName,
  className,
  children,
}: SectionProps) {
  const background = tone === "surface" ? "bg-surface" : "bg-page";

  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      data-section-name={analyticsName}
      className={`relative isolate w-full overflow-hidden ${background} text-ink ${className ?? ""}`}
    >
      {tone === "photo" && photo && (
        <>
          <picture>
            {photo.avif && <source srcSet={photo.avif} sizes={photo.sizes ?? "100vw"} type="image/avif" />}
            {photo.webp && <source srcSet={photo.webp} sizes={photo.sizes ?? "100vw"} type="image/webp" />}
            <img
              src={photo.src}
              alt={photo.alt ?? ""}
              width={photo.width}
              height={photo.height}
              loading={photo.priority ? "eager" : "lazy"}
              fetchPriority={photo.priority ? "high" : undefined}
              decoding="async"
              className="absolute inset-0 -z-20 h-full w-full object-cover"
              style={{ objectPosition: photo.position }}
            />
          </picture>
          <div aria-hidden className="section-photo-scrim absolute inset-0 -z-10" />
        </>
      )}
      <div className="mx-auto w-full max-w-content px-gutter py-section">{children}</div>
    </section>
  );
}
