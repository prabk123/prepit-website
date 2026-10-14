import type { ReactNode } from "react";
import FeatureSplit from "@/components/ui/FeatureSplit";
import Section from "@/components/ui/Section";
import SectionHeading from "@/components/ui/SectionHeading";

type FeatureBlockProps = {
  /** Anchor id; the heading gets `<id>-heading`. */
  id: string;
  title: string;
  lead: ReactNode;
  /** Points, a link or a note under the heading. */
  children?: ReactNode;
  /** A phone, a pair of phones, a widget or a clip. */
  media: ReactNode;
  /** Media on the left on desktop. Alternate down the page. */
  reverse?: boolean;
  tone?: "page" | "surface";
  /**
   * `split`: text beside the phone. `peek`: a centred heading over the top of
   * the phone, which runs off the section's bottom edge. Use `peek` for short
   * blocks (a line and a link) to break up a run of splits.
   */
  layout?: "split" | "peek";
};

/** One feature-page section: a heading, one line and points beside (or over) a phone. */
export default function FeatureBlock({
  id,
  title,
  lead,
  children,
  media,
  reverse,
  tone,
  layout = "split",
}: FeatureBlockProps) {
  if (layout === "peek") {
    return (
      <Section id={id} tone={tone} labelledBy={`${id}-heading`}>
        <div className="flex flex-col items-center gap-stack">
          <div className="flex flex-col items-center gap-8 text-center">
            <SectionHeading id={`${id}-heading`} size="section" align="center" title={title} lead={lead} />
            {children}
          </div>
          <div className="-mb-section flex h-[440px] w-full justify-center overflow-hidden lg:h-[500px]">
            {media}
          </div>
        </div>
      </Section>
    );
  }

  return (
    <Section id={id} tone={tone} labelledBy={`${id}-heading`}>
      <FeatureSplit reverse={reverse} media={media}>
        <SectionHeading id={`${id}-heading`} size="section" title={title} lead={lead} />
        {children}
      </FeatureSplit>
    </Section>
  );
}
