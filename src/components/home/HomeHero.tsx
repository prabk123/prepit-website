import AnnotatedPhoto from "@/components/media/AnnotatedPhoto";
import PreloadImage from "@/components/media/PreloadImage";
import AppStoreCta from "@/components/ui/AppStoreCta";
import { heroCafe } from "@/content/lifestyle";
import { TRIAL_DAYS } from "@/lib/pricing";

/**
 * Headline first, then the supporting line and App Store button, then the
 * annotated cafe photo, whose phone shows today's log. On desktop the line and
 * button sit beside the headline, so at 1440 x 900 the photo fills the lower
 * part of the first screen. Phones get the 4:5 crop around the phone; on a
 * 390 x 844 phone the headline, button and the top of that photo fit the
 * first screen.
 */
export default function HomeHero() {
  return (
    <section
      id="hero"
      aria-labelledby="hero-heading"
      data-section-name="hero"
      className="relative isolate w-full overflow-hidden bg-page pt-16 text-ink"
    >
      {/* The photo is the LCP. Preload the crop and size this screen will pick,
          so it starts before the stylesheet and fonts are done. */}
      {(
        [
          [heroCafe.desktop, "(min-width: 1024px)"],
          [heroCafe.mobile, "(max-width: 1023.98px)"],
        ] as const
      ).map(([photo, media]) => (
        <PreloadImage
          key={media}
          href={photo.src}
          imageSrcSet={photo.avif}
          imageSizes={photo.sizes}
          type="image/avif"
          media={media}
        />
      ))}
      <div className="mx-auto grid w-full max-w-content gap-6 px-gutter pt-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-end lg:gap-10 lg:pt-10">
        <div>
          <p className="text-eyebrow font-medium uppercase">
            <span className="text-gradient-brand">Your personal AI nutritionist</span>
          </p>
          <h1 id="hero-heading" className="mt-4 font-display text-hero text-ink text-balance lg:mt-5">
            Not another tracker.
            <span className="mt-3 block text-title text-ink-secondary lg:mt-5 lg:text-section">
              A nutritionist that improves how you eat.
            </span>
          </h1>
        </div>
        <div className="flex flex-col gap-6 lg:gap-8 lg:pb-2">
          <p className="max-w-[46ch] text-lead text-ink-secondary text-pretty">
            PrepIt knows what you ate, what you&apos;re aiming for and how your food will make you feel.
            It checks in, spots patterns and tells you what to eat next, every day.
          </p>
          <AppStoreCta trackingSource="home-hero" note={`${TRIAL_DAYS} days free. Cancel anytime.`} />
        </div>
      </div>

      <AnnotatedPhoto
        photo={heroCafe.desktop}
        phonePhoto={heroCafe.mobile}
        annotations={heroCafe.annotations}
        fadeEdges
        className="mt-8 aspect-[4/5] max-h-[720px] w-full lg:mt-6 lg:aspect-[1376/768] lg:max-h-[860px]"
      />
    </section>
  );
}
