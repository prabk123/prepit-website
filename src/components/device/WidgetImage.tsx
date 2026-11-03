import type { widgetCapture } from "@/lib/captures";

/** A Home Screen widget render (not a phone screen), with the widget's corner radius and shadow. */
export default function WidgetImage({
  capture,
  shadow = "phone",
  className,
}: {
  capture: ReturnType<typeof widgetCapture>;
  /** `phone` lifts it like a phone screen; `card` matches the v9 cards beside it on cream. */
  shadow?: "phone" | "card";
  className?: string;
}) {
  return (
    <picture>
      {capture.avif && <source srcSet={capture.avif} type="image/avif" />}
      <source srcSet={capture.webp} type="image/webp" />
      <img
        src={capture.src}
        alt={capture.alt}
        width={capture.width}
        height={capture.height}
        loading="lazy"
        decoding="async"
        className={`h-auto w-full rounded-widget ${shadow === "card" ? "shadow-[var(--shadow-v9-card)]" : "shadow-phone"} ${className ?? ""}`}
      />
    </picture>
  );
}
