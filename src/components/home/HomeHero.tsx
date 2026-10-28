import AnnotatedPhoto from "@/components/media/AnnotatedPhoto";
import PreloadImage from "@/components/media/PreloadImage";
import SplitWords from "@/components/motion/SplitWords";
import AppStoreCta from "@/components/ui/AppStoreCta";
import { heroCafe } from "@/content/lifestyle";
import { TRIAL_DAYS } from "@/lib/pricing";

/**
 * The promise over the cafe photo (PRE-306), whose phone shows the
 * nutritionist's protein chart. From 1024 px the text sits on the photo's
 * bright left side on a soft light wash, with the phone on the right; below
 * that the photo's 4:5 crop follows the text, so on a 390 x 844 phone the
 * headline, line and button fit the first screen.
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
      <div className="relative">
        <div className="relative z-[3] mx-auto flex w-full max-w-content px-gutter pt-8 lg:absolute lg:inset-x-0 lg:inset-y-0 lg:items-center lg:pt-0">
          <div className="relative flex flex-col gap-6 lg:max-w-[min(560px,44vw)] lg:gap-8">
            {/* Light only behind the text, so the window and table around it stay as shot. */}
            <div
              aria-hidden
              className="photo-band-wash-text pointer-events-none absolute -inset-x-[30%] -inset-y-[20%] -z-10 max-lg:hidden"
            />
            <p className="text-eyebrow font-medium uppercase">
              <span className="text-gradient-brand gradient-drift">Your AI nutritionist</span>
            </p>
            <h1 id="hero-heading" className="hero-words font-display text-hero text-ink text-balance">
              <SplitWords
                text="The nutritionist that notices."
                lastAfter={
                  // An orange stroke drawn under "notices." once the words are in.
                  <svg
                    aria-hidden
                    viewBox="0 0 220 18"
                    preserveAspectRatio="none"
                    className="hero-underline absolute -bottom-[0.1em] left-0 h-[0.22em] w-[92%] text-accent"
                  >
                    <path
                      d="M3 12 C 50 4, 120 3, 217 9"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="5"
                      strokeLinecap="round"
                      pathLength={1}
                    />
                  </svg>
                }
              />
            </h1>
            <p className="hero-rise max-w-[44ch] text-lead text-ink-secondary text-pretty">
              Tell PrepIt what you eat. It spots what&apos;s behind the 3pm slump and the evening snacking, and tells
              you the one thing to change first.
            </p>
            <AppStoreCta className="hero-rise [--rise-delay:600ms]" trackingSource="home-hero" note={`${TRIAL_DAYS} days free. Cancel anytime.`} />
          </div>
        </div>

        <AnnotatedPhoto
          photo={heroCafe.desktop}
          phonePhoto={heroCafe.mobile}
          annotations={heroCafe.annotations}
          annotationsFromXl
          fadeEdges
          className="hero-settle mt-8 aspect-[4/5] max-h-[720px] w-full lg:mt-0 lg:aspect-[1376/768] lg:max-h-[1040px] lg:min-h-[600px]"
        />
      </div>
    </section>
  );
}
