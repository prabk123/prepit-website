import type { CSSProperties } from "react";
import type { SectionPhoto } from "@/components/ui/Section";

type BandPhotoProps = {
  photo: SectionPhoto;
  /** CSS object-position from 1024 px, keeping the subject clear of the text. */
  position?: string;
  /** Below 1024 px: a strip above the band's text, or no photo. */
  phone?: "strip" | "none";
  /**
   * Where the text sits, so the photo fades out there: `start` for a heading
   * and points on the left (it also fades out above the points), `centre` for
   * a centred call to action.
   */
  text?: "start" | "centre";
};

function Picture({ photo, sizes, className, style }: { photo: SectionPhoto; sizes: string; className: string; style?: CSSProperties }) {
  return (
    <picture>
      {photo.avif && <source srcSet={photo.avif} sizes={sizes} type="image/avif" />}
      {photo.webp && <source srcSet={photo.webp} sizes={sizes} type="image/webp" />}
      <img
        src={photo.src}
        alt=""
        width={photo.width}
        height={photo.height}
        loading="lazy"
        decoding="async"
        className={className}
        style={style}
      />
    </picture>
  );
}

/**
 * A no-screen photo for a dark band (PRE-282). From 1024 px it sits in the
 * band's top right behind the heading, fading out towards the text and before
 * the points under it (`.band-photo`), or fills a centred band and fades out
 * behind its centre (`.band-photo--centre`); below
 * that it is an optional strip above the text, so text never sits on it.
 * Decorative: the band's heading carries the meaning.
 */
export default function BandPhoto({
  photo,
  position = "right center",
  phone = "strip",
  text = "start",
}: BandPhotoProps) {
  return (
    <>
      <div
        aria-hidden
        className={`pointer-events-none absolute -z-10 max-lg:hidden ${
          text === "centre" ? "band-photo--centre inset-0" : "band-photo right-0 top-0 h-[460px] w-[60%]"
        }`}
      >
        <Picture
          photo={photo}
          sizes={text === "centre" ? "100vw" : "60vw"}
          className={`h-full w-full object-cover ${text === "centre" ? "" : "band-photo__img"}`}
          style={{ objectPosition: position }}
        />
      </div>
      {phone === "strip" && (
        <div aria-hidden className="mb-stack overflow-hidden rounded-card lg:hidden">
          <Picture photo={photo} sizes="(min-width: 768px) 90vw, 100vw" className="aspect-[16/9] h-auto w-full object-cover" />
        </div>
      )}
    </>
  );
}
