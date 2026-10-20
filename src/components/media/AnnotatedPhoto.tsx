"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import type { SectionPhoto } from "@/components/ui/Section";

export type PhotoAnnotation = {
  /** Where the ring sits on the food, in % of the whole photo from the left. */
  x: number;
  /** Where the ring sits on the food, in % of the whole photo from the top. */
  y: number;
  /** Which side of the ring the label sits on. */
  side: "left" | "right";
  /** Leader line length in px (default 72). */
  length?: number;
  /**
   * The highlighted figure, e.g. "34 g protein". Must come from a real logged meal
   * (a PRE-198 capture or a real log), never made up.
   */
  value: string;
  /** What it is, e.g. "Protein overnight oats". */
  label: string;
};

type AnnotatedPhotoProps = {
  /** The photo from 1024 px, and below it too unless `phonePhoto` is set. Its alt is used at every size. */
  photo: SectionPhoto;
  /** A crop for screens below 1024 px. Phones then load only this file. */
  phonePhoto?: SectionPhoto;
  /** Three to five, placed clear of text and phones. Shown from 1024 px only. */
  annotations?: PhotoAnnotation[];
  /**
   * Show the labels from 1280 px instead, for a layout where the photo is
   * cropped enough at 1024 px that they would meet the text.
   */
  annotationsFromXl?: boolean;
  /** Fade the photo into the page at its top and bottom edges. */
  fadeEdges?: boolean;
  /**
   * Below 1024 px, show the photo as a strip at the top and let the children
   * follow underneath it (D3's phone layout), instead of setting them over it.
   * The strip height is `--photo-strip-h`.
   */
  stackOnPhones?: boolean;
  /**
   * With `stackOnPhones`, put the strip at the bottom instead, so the
   * children come first and the photo follows them.
   */
  stripLastOnPhones?: boolean;
  /** Size and position the box, e.g. an aspect ratio or `absolute inset-0`. */
  className?: string;
  /** Overlays on top of the photo, e.g. a heading. */
  children?: ReactNode;
};

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
const DESKTOP_MEDIA = "(min-width: 1024px)";

/** "70% 40%" as fractions, for placing the cropped photo the way object-position would. */
function focus(position = "50% 50%") {
  const [x = 50, y = 50] = position.split(/\s+/).map((part) => parseFloat(part));
  return { x: x / 100, y: y / 100 };
}

function Sources({ photo, media }: { photo: SectionPhoto; media?: string }) {
  return (
    <>
      {photo.avif && <source media={media} srcSet={photo.avif} sizes={photo.sizes ?? "100vw"} type="image/avif" />}
      {photo.webp && <source media={media} srcSet={photo.webp} sizes={photo.sizes ?? "100vw"} type="image/webp" />}
    </>
  );
}

/**
 * A lifestyle photo labelled the way PrepIt reads a plate (design D3): an
 * orange ring on the food, a thin leader line and a white glass label. On first
 * view the labels draw in one after another (line, then label). With reduced
 * motion, or before JavaScript runs, they are simply shown.
 *
 * The photo is cropped like `object-fit: cover` by sizing a layer in container
 * units, and the labels sit on that layer, so they stay on the food at any
 * box size.
 */
export default function AnnotatedPhoto({
  photo,
  phonePhoto,
  annotations = [],
  annotationsFromXl,
  fadeEdges,
  stackOnPhones,
  stripLastOnPhones,
  className,
  children,
}: AnnotatedPhotoProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || annotations.length === 0) return;
    if (window.matchMedia(REDUCED_MOTION_QUERY).matches) return;

    // data-annotations: "static" shows labels as is (server HTML, reduced
    // motion), "armed" hides them until in view, "shown" draws them in. Set
    // on the DOM directly so the photo never re-renders for it.
    el.dataset.annotations = "armed";
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.dataset.annotations = "shown";
          observer.disconnect();
        }
      },
      { threshold: 0.35 },
    );
    const frame = requestAnimationFrame(() => observer.observe(el));
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [annotations.length]);

  const phone = phonePhoto ?? photo;
  const desktopFocus = focus(photo.position);
  const phoneFocus = focus(phone.position);
  const layerVars = {
    "--photo-ar": photo.width / photo.height,
    "--photo-x": desktopFocus.x,
    "--photo-y": desktopFocus.y,
    "--photo-ar-phone": phone.width / phone.height,
    "--photo-x-phone": phoneFocus.x,
    "--photo-y-phone": phoneFocus.y,
  } as CSSProperties;

  return (
    <div
      ref={ref}
      className={`annotated-photo relative overflow-hidden ${
        stackOnPhones ? "[--photo-strip-h:min(125vw,560px)]" : ""
      } ${className ?? ""}`}
      data-annotations="static"
    >
      <div
        className={`annotated-photo__media ${stackOnPhones
            ? `${stripLastOnPhones ? "max-lg:top-auto" : "max-lg:bottom-auto"} max-lg:h-[var(--photo-strip-h)]`
            : ""}`}
        style={layerVars}
      >
        <div className="annotated-photo__layer">
          <picture>
            {phonePhoto && <Sources photo={photo} media={DESKTOP_MEDIA} />}
            <Sources photo={phone} />
            <img
              src={phone.src}
              alt={photo.alt ?? ""}
              width={phone.width}
              height={phone.height}
              loading={photo.priority ? "eager" : "lazy"}
              fetchPriority={photo.priority ? "high" : undefined}
              decoding="async"
            />
          </picture>
          {annotations.length > 0 && (
            <ul
              className={`hidden ${annotationsFromXl ? "xl:block" : "lg:block"}`}
              aria-label="What PrepIt reads on this plate"
            >
              {annotations.map((note, index) => (
                <li
                  key={`${note.value}-${note.label}`}
                  className="photo-annotation"
                  data-side={note.side}
                  style={
                    {
                      left: `${note.x}%`,
                      top: `${note.y}%`,
                      "--annotation-length": `${note.length ?? 72}px`,
                      "--annotation-index": index,
                    } as CSSProperties
                  }
                >
                  <span aria-hidden className="photo-annotation__ring" />
                  <span aria-hidden className="photo-annotation__line" />
                  <span className="photo-annotation__label">
                    <b>{note.value}</b> {note.label}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
        {fadeEdges && <div aria-hidden className="annotated-photo__fade absolute inset-0" />}
      </div>
      {children}
    </div>
  );
}
