"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import type { SectionPhoto } from "@/components/ui/Section";

export type PhotoAnnotation = {
  /** Where the ring sits on the food, in % of the photo box from the left. */
  x: number;
  /** Where the ring sits on the food, in % of the photo box from the top. */
  y: number;
  /** Which side of the ring the label sits on. */
  side: "left" | "right";
  /** Leader line length in px (default 72). */
  length?: number;
  /**
   * The amber figure, e.g. "34 g protein". Must come from a real logged meal
   * (a PRE-198 capture or a real log), never made up.
   */
  value: string;
  /** What it is, e.g. "Protein overnight oats". */
  label: string;
};

type AnnotatedPhotoProps = {
  photo: SectionPhoto;
  /** Three to five, placed clear of text and phones. Shown from 1024 px only. */
  annotations?: PhotoAnnotation[];
  /**
   * Set while the photo is a stand-in: shows a visible "placeholder" chip with
   * this description, so nobody mistakes it for the final image.
   */
  placeholder?: string;
  /** Fade the photo into the page at its top and bottom edges. */
  fadeEdges?: boolean;
  /** Size and position the box, e.g. an aspect ratio or `absolute inset-0`. */
  className?: string;
  /** Overlays on top of the photo, e.g. a phone. */
  children?: ReactNode;
};

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

/**
 * A lifestyle photo labelled the way PrepIt reads a plate (design D3): an
 * amber ring on the food, a thin leader line and a dark glass label. On first
 * view the labels draw in one after another (line, then label). With reduced
 * motion, or before JavaScript runs, they are simply shown.
 */
export default function AnnotatedPhoto({
  photo,
  annotations = [],
  placeholder,
  fadeEdges,
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

  return (
    <div
      ref={ref}
      className={`annotated-photo relative overflow-hidden ${className ?? ""}`}
      data-annotations="static"
    >
      <picture>
        {photo.avif && <source srcSet={photo.avif} type="image/avif" />}
        {photo.webp && <source srcSet={photo.webp} type="image/webp" />}
        <img
          src={photo.src}
          alt={photo.alt ?? ""}
          width={photo.width}
          height={photo.height}
          loading={photo.priority ? "eager" : "lazy"}
          fetchPriority={photo.priority ? "high" : undefined}
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover"
          style={{ objectPosition: photo.position }}
        />
      </picture>
      {fadeEdges && <div aria-hidden className="annotated-photo__fade absolute inset-0" />}
      {annotations.length > 0 && (
        <ul className="hidden lg:block" aria-label="What PrepIt reads on this plate">
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
      {children}
      {placeholder && (
        <p className="absolute bottom-4 left-4 z-10 rounded-control border border-dashed border-line-strong bg-overlay-strong px-3 py-1.5 text-small text-ink-secondary">
          Placeholder photo: {placeholder}
        </p>
      )}
    </div>
  );
}
