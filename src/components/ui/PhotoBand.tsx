import type { ReactNode } from "react";
import AnnotatedPhoto, { type PhotoAnnotation } from "@/components/media/AnnotatedPhoto";
import type { SectionPhoto } from "@/components/ui/Section";

type PhotoBandProps = {
  id?: string;
  labelledBy?: string;
  /** Fixed name sent with `home_section_viewed`. */
  analyticsName?: string;
  photo: SectionPhoto;
  annotations?: PhotoAnnotation[];
  /** Visible "placeholder" chip while the photo is a stand-in. */
  placeholder?: string;
  /** Headline, line and points, set over the dark gradient on the left. */
  children: ReactNode;
  /** Phones that rise out of the photo's bottom edge. */
  media?: ReactNode;
};

/**
 * D3's full-bleed photo section: an annotated lifestyle photo with the text on
 * a dark gradient at the left, and phones rising from its bottom edge. The
 * annotations sit on the right of the photo, clear of the text and phones.
 * Below 1024 px the photo is a strip on top, with the text and phones under it.
 */
export default function PhotoBand({
  id,
  labelledBy,
  analyticsName,
  photo,
  annotations,
  placeholder,
  children,
  media,
}: PhotoBandProps) {
  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      data-section-name={analyticsName}
      className="relative isolate w-full overflow-hidden bg-page pt-section text-ink"
    >
      <AnnotatedPhoto
        photo={photo}
        annotations={annotations}
        placeholder={placeholder}
        fadeEdges
        stackOnPhones
        className="lg:aspect-[1376/768] lg:max-h-[860px] lg:min-h-[640px]"
      >
        <div aria-hidden className="section-photo-scrim absolute inset-0 z-[1] max-lg:hidden" />
        <div className="relative z-[3] mx-auto flex h-full w-full max-w-content items-center px-gutter pt-[calc(var(--photo-strip-h)+1.5rem)] lg:py-16">
          <div className="flex max-w-[460px] flex-col gap-8">{children}</div>
        </div>
      </AnnotatedPhoto>
      {media && (
        <div className="relative z-[4] mx-auto mt-10 flex w-full max-w-content justify-center px-gutter lg:-mt-40 lg:justify-end">
          {media}
        </div>
      )}
    </section>
  );
}
