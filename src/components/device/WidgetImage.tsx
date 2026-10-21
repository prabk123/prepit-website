import type { widgetCapture } from "@/lib/captures";

/** A Home Screen widget render (not a phone screen), with the widget's corner radius and shadow. */
export default function WidgetImage({
  capture,
  className,
}: {
  capture: ReturnType<typeof widgetCapture>;
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
        className={`h-auto w-full rounded-widget shadow-phone ${className ?? ""}`}
      />
    </picture>
  );
}
