"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { trackVideoPlayed } from "@/lib/posthogAnalytics";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeToReducedMotion(onChange: () => void) {
  const query = window.matchMedia(REDUCED_MOTION_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

function prefersReducedMotion() {
  return window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

type ToggleState = { playing: boolean; toggle: () => void };

/**
 * Lets a frame (DeviceFrame) draw the clip's pause/play button outside the
 * screen, so it never sits on top of the app's own controls in a recording.
 * Inside a scope, LoopVideo hands its state up and <LoopVideoToggle> draws
 * the button wherever the frame puts it.
 */
const ToggleScopeContext = createContext<((state: ToggleState) => void) | null>(null);
const ToggleStateContext = createContext<ToggleState | null>(null);

export function LoopVideoToggleScope({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ToggleState | null>(null);
  return (
    <ToggleScopeContext.Provider value={setState}>
      <ToggleStateContext.Provider value={state}>{children}</ToggleStateContext.Provider>
    </ToggleScopeContext.Provider>
  );
}

function ToggleButton({ playing, toggle, className }: ToggleState & { className: string }) {
  return (
    <button
      type="button"
      className={className}
      aria-label={playing ? "Pause video" : "Play video"}
      onClick={toggle}
    >
      {playing ? (
        <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden>
          <rect x="3" y="2" width="3.5" height="12" rx="1" fill="currentColor" />
          <rect x="9.5" y="2" width="3.5" height="12" rx="1" fill="currentColor" />
        </svg>
      ) : (
        <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden>
          <path d="M4 2.6v10.8a1 1 0 0 0 1.5.86l9-5.4a1 1 0 0 0 0-1.72l-9-5.4A1 1 0 0 0 4 2.6Z" fill="currentColor" />
        </svg>
      )}
    </button>
  );
}

/** The pause/play button of the LoopVideo in the same scope, drawn outside it. */
export function LoopVideoToggle() {
  const state = useContext(ToggleStateContext);
  // Until the clip hydrates, hold the button's space so nothing below shifts.
  if (!state) {
    return <span aria-hidden className="loop-video__toggle loop-video__toggle--outside invisible" />;
  }
  return <ToggleButton {...state} className="loop-video__toggle loop-video__toggle--outside" />;
}

export type LoopVideoProps = {
  /** H.264 MP4, the source every browser can play. */
  mp4: string;
  /** VP9 or AV1 WebM, offered first because it is usually smaller. */
  webm?: string;
  /** Shown before the first frame, and as the still under reduced motion. */
  poster: string;
  /** Intrinsic size of the video, so the box is reserved before it loads. */
  width: number;
  height: number;
  /** Describes what the clip shows. Empty string for a purely decorative clip. */
  label: string;
  /**
   * Fixed name sent with `website_video_played` the first time the clip plays,
   * e.g. "03-log-typed". Leave unset to send nothing.
   */
  analyticsId?: string;
  /**
   * Above the fold: render the poster with the page instead of lazily, since
   * it is likely the largest paint. Pair with a preload of the poster.
   */
  priority?: boolean;
  className?: string;
};

/**
 * A muted, looping clip that plays only while it is on screen, with a
 * pause/play button (WCAG 2.2.2). Under `prefers-reduced-motion` it stays on
 * the poster until the visitor presses play. The poster loads only as the clip
 * nears the viewport, and the video itself only when it first plays.
 */
export default function LoopVideo({
  mp4,
  webm,
  poster,
  width,
  height,
  label,
  analyticsId,
  priority,
  className,
}: LoopVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  // The visitor's own choice from the button; null until they press it.
  const choiceRef = useRef<"play" | "pause" | null>(null);
  const trackedRef = useRef(false);
  const [playing, setPlaying] = useState(false);
  const [nearView, setNearView] = useState(false);
  const reducedMotion = useSyncExternalStore(
    subscribeToReducedMotion,
    prefersReducedMotion,
    () => false,
  );

  // Lazy-load the poster: attach it once the clip is within ~1.5 screens.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setNearView(true);
          observer.disconnect();
        }
      },
      { rootMargin: "150% 0px" },
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const shouldPlay = () =>
      choiceRef.current === "play" ||
      (choiceRef.current === null && !reducedMotion);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && shouldPlay()) {
          // Autoplay can still be refused (Low Power Mode, data saver); the
          // poster stays visible and the button offers play.
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

  const toggle = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      choiceRef.current = "play";
      video.play().catch(() => {});
    } else {
      choiceRef.current = "pause";
      video.pause();
    }
  };

  // In a frame's scope, the frame draws the button (see LoopVideoToggleScope).
  const setScopeState = useContext(ToggleScopeContext);
  useEffect(() => {
    setScopeState?.({ playing, toggle });
    // toggle reads only refs, so a new one each render behaves the same.
  }, [setScopeState, playing]);

  return (
    <div
      className={`loop-video ${className ?? ""}`}
      {...(label ? { role: "group", "aria-label": label } : {})}
    >
      <video
        ref={videoRef}
        width={width}
        height={height}
        poster={priority || nearView ? poster : undefined}
        muted
        loop
        playsInline
        preload="none"
        disablePictureInPicture
        disableRemotePlayback
        aria-hidden
        onPlay={() => {
          setPlaying(true);
          if (analyticsId && !trackedRef.current) {
            trackedRef.current = true;
            trackVideoPlayed(analyticsId, choiceRef.current === "play" ? "button" : "auto");
          }
        }}
        onPause={() => setPlaying(false)}
      >
        {webm && <source src={webm} type="video/webm" />}
        <source src={mp4} type="video/mp4" />
      </video>
      {!setScopeState && (
        <ToggleButton playing={playing} toggle={toggle} className="loop-video__toggle" />
      )}
    </div>
  );
}
