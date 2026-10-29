import type { ComponentProps } from "react";
import DeviceFrame from "@/components/device/DeviceFrame";
import PreloadImage from "@/components/media/PreloadImage";
import AppStoreCta from "@/components/ui/AppStoreCta";
import FeatureSplit from "@/components/ui/FeatureSplit";
import Glow from "@/components/ui/Glow";
import Section from "@/components/ui/Section";
import SectionHeading from "@/components/ui/SectionHeading";
import type { FeatureMeta } from "@/lib/features";
import { TRIAL_DAYS } from "@/lib/pricing";

type FeatureHeroProps = {
  feature: FeatureMeta;
  /** The phone: a still (`capture`) or a looping recording (`video`). */
  media: Pick<ComponentProps<typeof DeviceFrame>, "capture" | "video">;
};

/** A feature page's header: h1, one line and the App Store button beside a phone. */
export default function FeatureHero({ feature, media }: FeatureHeroProps) {
  return (
    <Section labelledBy="feature-heading">
      {/* A clip's poster is the LCP, but browsers fetch posters late and at low
          priority. Preload it so the first screen paints as fast as a still. */}
      {media.video && <PreloadImage href={media.video.poster} />}
      <FeatureSplit
        emphasis="text"
        media={
          <div className="hero-rise relative py-4 [--rise-delay:300ms]">
            <Glow />
            <DeviceFrame
              className="[--device-w:260px] sm:[--device-w:300px] lg:[--device-w:340px]"
              priority
              {...media}
            />
          </div>
        }
      >
        <SectionHeading
          as="h1"
          intro
          id="feature-heading"
          size="section"
          title={feature.heading}
          lead={feature.lead}
        />
        <AppStoreCta
          className="hero-rise [--rise-delay:600ms]"
          trackingSource={`feature-${feature.slug}-hero`}
          note={`${TRIAL_DAYS} days free. Cancel anytime.`}
        />
      </FeatureSplit>
    </Section>
  );
}
