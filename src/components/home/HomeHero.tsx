import AnnotatedPhoto from "@/components/media/AnnotatedPhoto";
import PreloadImage from "@/components/media/PreloadImage";
import AppStoreCta from "@/components/ui/AppStoreCta";
import { heroCafe } from "@/content/lifestyle";
import { TRIAL_DAYS } from "@/lib/pricing";

const HERO_POINTS = [
  "Log any meal in seconds, in your own words",
  "See how your food will shape your energy, hunger and mood",
  "Get a nutritionist who checks in, coaches and plans with you",
];

/**
 * Headline first, then the supporting line and App Store button, then the
 * annotated cafe photo, whose phone shows today's log. Phones get the 4:5 crop
 * around the phone; on a 390 x 844 phone the headline, button and the top of
 * that photo fit the first screen.
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
      <div className="mx-auto w-full max-w-content px-gutter pt-8 lg:pt-16">
        <p className="text-eyebrow font-medium uppercase">
          <span className="text-gradient-brand">Your personal AI nutritionist</span>
        </p>
        <h1 id="hero-heading" className="mt-4 font-display text-hero text-ink text-balance lg:mt-5">
          Not another tracker.
          <span className="mt-3 block text-title text-ink-secondary lg:mt-5 lg:text-section">
            A nutritionist that improves how you eat.
          </span>
        </h1>
        <div className="mt-6 grid gap-6 lg:mt-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)_auto] lg:gap-14">
          <p className="max-w-[46ch] text-lead text-ink-secondary text-pretty">
            PrepIt knows what you ate, what you&apos;re aiming for and how your food will make you feel.
            It checks in, spots patterns and tells you what to eat next, every day.
          </p>
          <ul className="hidden flex-col gap-3 text-body text-ink-secondary lg:flex">
            {HERO_POINTS.map((point) => (
              <li key={point} className="flex items-start gap-3">
                <span aria-hidden className="mt-[0.5em] h-2 w-2 shrink-0 rounded-full bg-annotation" />
                {point}
              </li>
            ))}
          </ul>
          <AppStoreCta trackingSource="home-hero" note={`${TRIAL_DAYS} days free. Cancel anytime.`} />
        </div>
      </div>

      <AnnotatedPhoto
        photo={heroCafe.desktop}
        phonePhoto={heroCafe.mobile}
        annotations={heroCafe.annotations}
        fadeEdges
        className="mt-8 aspect-[4/5] max-h-[720px] w-full lg:mt-14 lg:aspect-[1376/768] lg:max-h-[860px]"
      />
    </section>
  );
}
