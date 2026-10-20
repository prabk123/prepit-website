import type { ReactNode } from "react";
import AnnotatedPhoto, { type PhotoAnnotation } from "@/components/media/AnnotatedPhoto";
import type { SectionPhoto } from "@/components/ui/Section";

type PhotoBandProps = {
  id?: string;
  labelledBy?: string;
  /** Fixed name sent with `home_section_viewed`. */
  analyticsName?: string;
  photo: SectionPhoto;
  /** A crop for screens below 1024 px (around the phone in the photo). */
  phonePhoto?: SectionPhoto;
  /**
   * Leave the photo out below 1024 px, so the band opens on its text and
   * phones. For a band right after a photo that shows much the same thing.
   */
  photoFromLg?: boolean;
  annotations?: PhotoAnnotation[];
  /**
   * Side the text sits on, clear of the photo's subject. `end` puts it top
   * right, for photos whose subject is on the left and low.
   */
  textSide?: "start" | "end";
  /** Headline, line and points, set light over the dark gradient from 1024 px (on the page below it). */
  children: ReactNode;
  /**
   * Phones under the photo, on the side away from the text. They don't
   * overlap it, so the phone in the photo stays clear.
   */
  media?: ReactNode;
  /**
   * For an `end` photo that is bright behind the text: a stronger scrim that
   * sits only behind the text block, instead of the soft top-right one.
   */
  scrimBehindText?: boolean;
  /**
   * For an `end` photo that is bright and plain behind the text (a white
   * wall): the text keeps the page's dark ink on a soft light wash, with no
   * dark scrim. Overrides `scrimBehindText`.
   */
  textOnBrightPhoto?: boolean;
  /**
   * Points and a link set beside `media` under the photo, on the text's side,
   * so the phones don't float next to an empty column. Keeps the text on the
   * photo to a headline and one line.
   */
  aside?: ReactNode;
  /**
   * `center` (default) centres the aside against the media; `start` tops it
   * and keeps it in view from 1024 px, for media much taller than the text.
   */
  asideAlign?: "center" | "start";
  /**
   * Side the phones under the photo take from 1024 px, with `aside` on the
   * other. Defaults to the side away from the text; `start` puts them on the
   * left so a band that follows a text-left section still alternates.
   */
  mediaSide?: "start" | "end";
};

/**
 * D3's full-bleed photo section: an annotated lifestyle photo with the text on
 * a dark gradient at one side, and phones under it beside any points. Below
 * 1024 px the photo is a strip on top, with the text, points and phones under
 * it.
 */
export default function PhotoBand({
  id,
  labelledBy,
  analyticsName,
  photo,
  phonePhoto,
  photoFromLg = false,
  annotations,
  textSide = "start",
  children,
  media,
  scrimBehindText = false,
  textOnBrightPhoto = false,
  aside,
  asideAlign = "center",
  mediaSide,
}: PhotoBandProps) {
  const end = textSide === "end";
  const mediaFirst = (mediaSide ?? (end ? "start" : "end")) === "start";
  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      data-section-name={analyticsName}
      className="relative isolate w-full overflow-hidden bg-page pt-section text-ink"
    >
      <AnnotatedPhoto
        photo={photo}
        phonePhoto={phonePhoto}
        annotations={annotations}
        annotationsFromXl={end}
        fadeEdges
        stackOnPhones
        hideOnPhones={photoFromLg}
        className="w-full lg:aspect-[1376/768] lg:max-h-[860px] lg:min-h-[640px]"
      >
        {!scrimBehindText && !textOnBrightPhoto && (
          <div
            aria-hidden
            className={`${end ? "photo-band-scrim-end" : "photo-band-scrim"} absolute inset-0 z-[1] max-lg:hidden`}
          />
        )}
        {/* From 1024 px the text sits on the dark photo, so it takes the dark
            tokens there; below that it sits on the page under the photo. */}
        <div
          className={`${textOnBrightPhoto ? "" : "theme-dark-lg "}relative z-[3] mx-auto flex h-full w-full max-w-content px-gutter pt-[calc(var(--photo-strip-h)+1.5rem)] ${
            end ? "lg:items-start lg:justify-end lg:pt-16" : "items-center lg:py-16"
          }`}
        >
          <div className="relative flex max-w-[460px] flex-col gap-8">
            {/* Dark only behind the text, however tall it wraps, so the food around it stays lit. */}
            {textOnBrightPhoto && (
              <div
                aria-hidden
                className="photo-band-wash-text pointer-events-none absolute -inset-x-[30%] -inset-y-[20%] -z-10 max-lg:hidden"
              />
            )}
            {scrimBehindText && !textOnBrightPhoto && (
              <div
                aria-hidden
                className="photo-band-scrim-text pointer-events-none absolute -inset-x-[40%] -inset-y-[24%] -z-10 max-lg:hidden"
              />
            )}
            {children}
          </div>
        </div>
      </AnnotatedPhoto>
      {media && aside && (
        <div
          className={`relative z-[4] mx-auto mt-10 grid w-full max-w-content grid-cols-[minmax(0,1fr)] gap-stack px-gutter lg:grid-cols-2 lg:gap-x-12 ${
            asideAlign === "start" ? "items-start" : "items-center"
          }`}
        >
          <div
            className={`flex w-full max-w-[460px] flex-col gap-8 ${mediaFirst ? "lg:order-2" : ""} ${end ? "lg:justify-self-end" : ""} ${
              asideAlign === "start" ? "lg:sticky lg:top-28" : ""
            }`}
          >
            {aside}
          </div>
          <div className={`flex min-w-0 justify-center ${mediaFirst ? "lg:order-1" : ""}`}>{media}</div>
        </div>
      )}
      {media && !aside && (
        <div
          className={`relative z-[4] mx-auto mt-10 flex w-full max-w-content justify-center px-gutter ${
            end ? "" : "lg:justify-end"
          }`}
        >
          {media}
        </div>
      )}
    </section>
  );
}
