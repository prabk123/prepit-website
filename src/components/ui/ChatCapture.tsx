import type { chatCrop } from "@/lib/captures";

type ChatCaptureProps = {
  capture: ReturnType<typeof chatCrop>;
  /** Under the message, e.g. when it was sent. */
  caption?: string;
  priority?: boolean;
  /** Fade the bottom out, for a crop that stops inside a card. */
  fade?: boolean;
  className?: string;
};

/**
 * A real message from the app's Nutritionist chat, cropped from a capture
 * (PRE-283): the bubble and its reply rows exactly as the app draws them, on
 * the chat's own light grey, so the site never redraws app UI.
 */
export default function ChatCapture({ capture, caption, priority, fade, className }: ChatCaptureProps) {
  return (
    <figure className={`flex w-full min-w-0 flex-col gap-3 ${className ?? ""}`}>
      <div
        className={`overflow-hidden rounded-card border border-line bg-[#f4f4f5] ${
          fade ? "[mask-image:linear-gradient(to_bottom,black_75%,transparent)]" : ""
        }`}
      >
        <picture>
          <source srcSet={capture.avif} type="image/avif" />
          <source srcSet={capture.webp} type="image/webp" />
          <img
            src={capture.src}
            alt={capture.alt}
            width={capture.width}
            height={capture.height}
            loading={priority ? "eager" : "lazy"}
            decoding="async"
            className="block h-auto w-full"
          />
        </picture>
      </div>
      {caption && <figcaption className="text-small text-ink-faint">{caption}</figcaption>}
    </figure>
  );
}
