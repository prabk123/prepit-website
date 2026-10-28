"use client";

import { useEffect, useId, useRef, useState, type CSSProperties } from "react";
import DeviceFrame, { CAPTURE_HEIGHT, CAPTURE_WIDTH } from "@/components/device/DeviceFrame";
import { speaksUpPhoneMessages, type SpeaksUpPhoneMessage } from "@/content/nutritionistMessages";
import type { ChatCutout } from "@/lib/captures";
import { trackMessageSelected } from "@/lib/posthogAnalytics";

type Loading = "lazy" | "eager";

function Cutout({
  part,
  kind,
  active,
  loading,
}: {
  part: ChatCutout;
  kind: "message" | "highlight";
  active: boolean;
  loading: Loading;
}) {
  return (
    <picture>
      <source srcSet={part.avif} type="image/avif" />
      <source srcSet={part.webp} type="image/webp" />
      <img
        src={part.src}
        alt=""
        width={part.width}
        height={part.height}
        loading={loading}
        fetchPriority={active ? undefined : "low"}
        decoding="async"
        className={`speaks-up-phone__cutout speaks-up-phone__cutout--${kind}`}
        style={{
          left: `${part.left}%`,
          top: `${part.top}%`,
          width: `${part.widthPercent}%`,
        }}
      />
    </picture>
  );
}

function Screen({ message, active, loading }: { message: SpeaksUpPhoneMessage; active: boolean; loading: Loading }) {
  const { screen } = message;
  return (
    <div className="speaks-up-phone__screen" data-active={active || undefined} aria-hidden={!active}>
      <picture>
        <source srcSet={screen.avif} type="image/avif" />
        <source srcSet={screen.webp} type="image/webp" />
        <img
          src={screen.src}
          alt={active ? screen.alt : ""}
          width={CAPTURE_WIDTH}
          height={CAPTURE_HEIGHT}
          loading={loading}
          fetchPriority={active ? undefined : "low"}
          decoding="async"
        />
      </picture>
    </div>
  );
}

/** How long each message stays up while the phone plays through them. */
const AUTOPLAY_MS = 6000;

/**
 * Plays through the messages while the phone is on screen, as if each had
 * just arrived (website motion experiment). It stops for good once someone
 * picks a message, pauses while focus is on its buttons or the tab is
 * hidden, and never runs under reduced motion or `?motion=off`.
 */
function useAutoplay(enabled: boolean, count: number, advance: () => void) {
  const ref = useRef<HTMLElement>(null);
  const [playing, setPlaying] = useState(false);
  const [stopped, setStopped] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!enabled || stopped || count < 2 || !el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (new URLSearchParams(window.location.search).get("motion") === "off") return;

    let inView = false;
    let held = false;
    const sync = () => setPlaying(inView && !held && document.visibilityState === "visible");
    const observer = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
        sync();
      },
      { threshold: 0.5 },
    );
    observer.observe(el);
    const hold = () => {
      held = true;
      sync();
    };
    const release = (event: FocusEvent) => {
      if (el.contains(event.relatedTarget as Node | null)) return;
      held = false;
      sync();
    };
    el.addEventListener("focusin", hold);
    el.addEventListener("focusout", release);
    document.addEventListener("visibilitychange", sync);
    return () => {
      observer.disconnect();
      el.removeEventListener("focusin", hold);
      el.removeEventListener("focusout", release);
      document.removeEventListener("visibilitychange", sync);
      setPlaying(false);
    };
  }, [enabled, stopped, count]);

  const advanceRef = useRef(advance);
  useEffect(() => {
    advanceRef.current = advance;
  });
  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => advanceRef.current(), AUTOPLAY_MS);
    return () => window.clearInterval(timer);
  }, [playing]);

  return { ref, playing: playing && !stopped, stop: () => setStopped(true) };
}

/**
 * The nutritionist's own messages in a phone (PRE-294): the real chat screen,
 * with the message and the part to look at cut from the same capture and
 * lifted out past the frame. A tag says why it was sent, and the buttons
 * under the phone switch between messages (none with one message). The
 * phone's top, which is empty chat, is cropped off and faded: by
 * `--speaks-up-crop`, which `className` can set along with `--device-w`.
 */
export default function SpeaksUpPhone({
  messages = speaksUpPhoneMessages,
  className = "[--device-w:216px] sm:[--device-w:240px] lg:[--device-w:300px]",
  loading = "lazy",
  autoplay = false,
}: {
  messages?: readonly SpeaksUpPhoneMessage[];
  className?: string;
  /** `eager` for a phone in the first screen, such as the hero's. */
  loading?: Loading;
  /** Play through the messages on their own while the phone is on screen. */
  autoplay?: boolean;
}) {
  const [index, setIndex] = useState(0);
  // Counts arrivals, so the phone's buzz restarts on each one.
  const [arrivals, setArrivals] = useState(0);
  const captionId = useId();
  const current = messages[index];
  const show = (i: number) => {
    setIndex(i);
    setArrivals((n) => n + 1);
  };
  const { ref, playing, stop } = useAutoplay(autoplay, messages.length, () => show((index + 1) % messages.length));

  return (
    <figure
      ref={ref}
      className="flex w-full min-w-0 flex-col items-center gap-4 lg:gap-6"
      aria-labelledby={captionId}
      data-playing={playing || undefined}
      // On the homepage the phone swings up into view (src/app/motion.css).
      data-reveal={autoplay ? "phone" : undefined}
      style={{ "--speaks-up-autoplay": `${AUTOPLAY_MS}ms` } as CSSProperties}
    >
      <div
        className={`speaks-up-phone ${className}`}
        data-buzz={arrivals === 0 ? undefined : arrivals % 2 ? "a" : "b"}
        style={{ "--speaks-up-crop-extra": current.cropExtra } as CSSProperties}
      >
        <DeviceFrame>
          {messages.map((message, i) => (
            <Screen key={message.id} message={message} active={i === index} loading={loading} />
          ))}
        </DeviceFrame>
        {messages.map((message, i) => (
          <div key={message.id} aria-hidden className="speaks-up-phone__pop" data-active={i === index || undefined}>
            <Cutout part={message.message} kind="message" active={i === index} loading={loading} />
            <Cutout part={message.highlight} kind="highlight" active={i === index} loading={loading} />
            <p
              className="speaks-up-phone__reason"
              style={{
                top: `calc(${message.message.top}% - var(--speaks-up-pop-lift, 0) * ${message.message.heightPercent}% - var(--speaks-up-reason-gap, 14px))`,
              }}
            >
              {message.reason}
            </p>
          </div>
        ))}
      </div>
      {messages.length > 1 && (
        <div
          role="group"
          aria-label="Messages your nutritionist sends on its own"
          className="flex flex-wrap justify-center gap-2"
        >
          {messages.map((message, i) => (
            <button
              key={message.id}
              type="button"
              aria-pressed={i === index}
              onClick={() => {
                stop();
                if (i === index) return;
                show(i);
                trackMessageSelected(message.id);
              }}
              className="speaks-up-phone__pick relative overflow-hidden min-h-11 rounded-control border px-4 text-small font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus aria-pressed:border-primary aria-pressed:bg-primary aria-pressed:text-on-primary border-line-strong bg-surface text-ink hover:border-ink-faint"
            >
              {message.label}
            </button>
          ))}
        </div>
      )}
      <figcaption id={captionId} aria-live={playing ? "off" : "polite"} className="text-center text-small text-ink-faint">
        {current.caption}. {messages.length > 1 ? "Real messages from the app." : "A real message from the app."}
      </figcaption>
    </figure>
  );
}
