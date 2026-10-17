"use client";

import { useId, useState } from "react";
import DeviceFrame, { CAPTURE_HEIGHT, CAPTURE_WIDTH } from "@/components/device/DeviceFrame";
import { speaksUpPhoneMessages, type SpeaksUpPhoneMessage } from "@/content/nutritionistMessages";
import type { ChatCutout } from "@/lib/captures";
import { trackMessageSelected } from "@/lib/posthogAnalytics";

function Cutout({ part, kind, active }: { part: ChatCutout; kind: "message" | "highlight"; active: boolean }) {
  return (
    <picture>
      <source srcSet={part.avif} type="image/avif" />
      <source srcSet={part.webp} type="image/webp" />
      <img
        src={part.src}
        alt=""
        width={part.width}
        height={part.height}
        loading="lazy"
        fetchPriority={active ? undefined : "low"}
        decoding="async"
        className={`speaks-up-phone__cutout speaks-up-phone__cutout--${kind}`}
        style={{ left: `${part.left}%`, top: `${part.top}%`, width: `${part.widthPercent}%` }}
      />
    </picture>
  );
}

function Screen({ message, active }: { message: SpeaksUpPhoneMessage; active: boolean }) {
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
          loading="lazy"
          fetchPriority={active ? undefined : "low"}
          decoding="async"
        />
      </picture>
    </div>
  );
}

/**
 * The nutritionist's own messages in a phone (PRE-294): the real chat screen,
 * with the message and the part to look at cut from the same capture and
 * lifted out past the frame. A tag says why it was sent, and the buttons
 * under the phone switch between messages. Below 1024 px the phone's top,
 * which is empty chat, is cropped off and faded so the band stays short.
 */
export default function SpeaksUpPhone() {
  const [index, setIndex] = useState(0);
  const captionId = useId();
  const current = speaksUpPhoneMessages[index];

  return (
    <figure className="flex w-full min-w-0 flex-col items-center gap-4 lg:gap-6" aria-labelledby={captionId}>
      <div className="speaks-up-phone [--device-w:216px] sm:[--device-w:240px] lg:[--device-w:300px]">
        <DeviceFrame>
          {speaksUpPhoneMessages.map((message, i) => (
            <Screen key={message.id} message={message} active={i === index} />
          ))}
        </DeviceFrame>
        {speaksUpPhoneMessages.map((message, i) => (
          <div
            key={message.id}
            aria-hidden
            className="speaks-up-phone__pop"
            data-active={i === index || undefined}
          >
            <Cutout part={message.message} kind="message" active={i === index} />
            <Cutout part={message.highlight} kind="highlight" active={i === index} />
            <p
              className="speaks-up-phone__reason"
              style={{ top: `calc(${message.message.top}% - 14px)` }}
            >
              {message.reason}
            </p>
          </div>
        ))}
      </div>
      <div role="group" aria-label="Messages your nutritionist sends on its own" className="flex flex-wrap justify-center gap-2">
        {speaksUpPhoneMessages.map((message, i) => (
          <button
            key={message.id}
            type="button"
            aria-pressed={i === index}
            onClick={() => {
              if (i === index) return;
              setIndex(i);
              trackMessageSelected(message.id);
            }}
            className="min-h-11 rounded-control border px-4 text-small font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus aria-pressed:border-primary aria-pressed:bg-primary aria-pressed:text-on-primary border-line-strong bg-surface text-ink hover:border-ink-faint"
          >
            {message.label}
          </button>
        ))}
      </div>
      <figcaption id={captionId} aria-live="polite" className="text-center text-small text-ink-faint">
        {current.caption}. Real messages from the app.
      </figcaption>
    </figure>
  );
}
