import HeroFilm from "@/components/motion/HeroFilm";
import SplitWords from "@/components/motion/SplitWords";
import AppStoreCta from "@/components/ui/AppStoreCta";
import { TRIAL_DAYS } from "@/lib/pricing";

/**
 * The promise beside the hero film (website motion experiment): the app's
 * real components, drawn in code, playing the nutritionist's protein
 * check-in and a dinner logged from it (see HeroFilm). From 1024 px the text
 * sits left and the film right; below that the film follows the text, so on
 * a 390 x 844 phone the headline, line and button fit the first screen.
 */
export default function HomeHero() {
  return (
    <section
      id="hero"
      aria-labelledby="hero-heading"
      data-section-name="hero"
      className="relative isolate w-full overflow-hidden bg-page pt-16 text-ink"
    >
      <div className="mx-auto grid w-full max-w-content items-center gap-6 px-gutter pt-8 pb-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-12 lg:pt-10 lg:pb-16">
        <div className="flex flex-col gap-6 lg:gap-8">
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

        <HeroFilm
          className="hero-rise [--rise-delay:300ms]"
          label="An animation of PrepIt's app screens. The nutritionist notices protein has been under target on 18 of 21 days, mostly at dinner, and suggests a bigger portion of protein at dinner. That reply is tapped. Then a Mediterranean salmon bowl with quinoa is logged from the plus button at 6:45 PM: 454 calories. The day's Eaten goes from 1,027 to 1,481 of 1,570 calories, on track, with Energy 84, Satiety 96 and Mood 87."
        />
      </div>
    </section>
  );
}
