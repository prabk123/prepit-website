"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeToReducedMotion(onChange: () => void) {
  const query = window.matchMedia(REDUCED_MOTION_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

function prefersReducedMotion() {
  return window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

export type LoopVideoProps = {
  /** H.264 MP4, the source every browser can play. */
  mp4: string;
  /** VP9 or AV1 WebM, offered first because it is usually smaller. */
  webm?: string;
  /** Shown before the first frame, and instead of the video under reduced motion. */
  poster: string;
  /** Intrinsic size of the video, so the box is reserved before it loads. */
  width: number;
  height: number;
  /** Describes what the clip shows. Empty string for a purely decorative clip. */
  label: string;
  className?: string;
};

/**
 * A muted, looping clip that plays only while it is on screen. Under
 * `prefers-reduced-motion` it renders the poster as a still image instead.
 */
export default function LoopVideo({
  mp4,
  webm,
  poster,
  width,
  height,
  label,
  className,
}: LoopVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const reducedMotion = useSyncExternalStore(
    subscribeToReducedMotion,
    prefersReducedMotion,
    () => false,
  );

  useEffect(() => {
    const video = videoRef.current;
    if (!video || reducedMotion) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Autoplay can still be refused (Low Power Mode, data saver); the
          // poster stays visible, so there is nothing to recover.
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
      { threshold: 0.25 },
    );
    observer.observe(video);

    return () => {
      observer.disconnect();
      video.pause();
    };
  }, [reducedMotion]);

  const a11y = label
    ? { role: "img", "aria-label": label }
    : { "aria-hidden": true as const };

  if (reducedMotion) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- poster is already sized and optimised
      <img
        src={poster}
        width={width}
        height={height}
        alt={label}
        className={className}
        decoding="async"
      />
    );
  }

  return (
    <video
      ref={videoRef}
      width={width}
      height={height}
      poster={poster}
      className={className}
      muted
      loop
      playsInline
      preload="metadata"
      disablePictureInPicture
      disableRemotePlayback
      {...a11y}
    >
      {webm && <source src={webm} type="video/webm" />}
      <source src={mp4} type="video/mp4" />
    </video>
  );
}
