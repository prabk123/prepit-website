"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { ICON } from "@/components/ui/LongLogo";

/*
 * One of the app's components floating on a lifestyle photo, beside the
 * person rather than on a phone (website motion experiment, after Whoop's
 * site). It sits at a point on the photo, given in % of the photo, and rises
 * in once the photo is in view. Under reduced motion it is simply there.
 */
export default function PhotoGlance({
  x,
  y,
  phoneX = x,
  phoneY = y,
  children,
}: {
  /** Left edge, in % of the 16:9 photo (or the only photo). */
  x: number;
  /** Top edge, in % of the 16:9 photo (or the only photo). */
  y: number;
  /** Left edge on the 4:5 phone crop, when it has one. */
  phoneX?: number;
  /** Top edge on the 4:5 phone crop, when it has one. */
  phoneY?: number;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    el.dataset.glance = "armed";
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        el.dataset.glance = "shown";
        observer.disconnect();
      },
      { threshold: 0.6 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden
      className="photo-glance"
      data-glance="static"
      style={{ "--gx": `${x}%`, "--gy": `${y}%`, "--gx-phone": `${phoneX}%`, "--gy-phone": `${phoneY}%` } as CSSProperties}
    >
      {children}
    </div>
  );
}

/** An iOS notification from PrepIt, in clear glass, as on the lock screen. */
export function GlanceNotification({ text, time = "now" }: { text: string; time?: string }) {
  return (
    <div className="glance-note">
      <span className="glance-note__icon">
        <svg viewBox="0 0 256 256" width="34" height="34" aria-hidden>
          <path fillRule="evenodd" clipRule="evenodd" d={ICON} fill="currentColor" />
        </svg>
      </span>
      <span className="glance-note__body">
        <span className="glance-note__top">
          <b>PrepIt</b>
          <span>{time}</span>
        </span>
        <span className="glance-note__text">{text}</span>
      </span>
    </div>
  );
}

/** Energy, Satiety and Mood, as the card at the top of Home. */
export function GlanceRings({ rings }: { rings: { label: string; score: number }[] }) {
  return (
    <div className="glance-rings">
      {rings.map((ring) => (
        <span key={ring.label} className="glance-ring">
          <span className="glance-ring__dial">
            <svg viewBox="0 0 64 64" width="64" height="64" aria-hidden>
              <circle cx="32" cy="32" r="27" fill="none" stroke="#40e300" strokeOpacity="0.16" strokeWidth="7" />
              <circle
                className="glance-ring__arc"
                cx="32"
                cy="32"
                r="27"
                fill="none"
                stroke="#40e300"
                strokeWidth="7"
                strokeLinecap="round"
                pathLength={100}
                strokeDasharray="100"
                style={{ "--score": ring.score } as CSSProperties}
                transform="rotate(-90 32 32)"
              />
            </svg>
            <b>{ring.score}</b>
          </span>
          <span className="glance-ring__label">{ring.label}</span>
        </span>
      ))}
    </div>
  );
}
