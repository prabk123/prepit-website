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
};

/** One feature-page section: a heading, one line and points beside a phone. */
export default function FeatureBlock({ id, title, lead, children, media, reverse, tone }: FeatureBlockProps) {
  return (
    <Section id={id} tone={tone} labelledBy={`${id}-heading`}>
      <FeatureSplit reverse={reverse} media={media}>
        <SectionHeading id={`${id}-heading`} size="section" title={title} lead={lead} />
        {children}
      </FeatureSplit>
    </Section>
  );
}
