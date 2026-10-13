import DeviceFrame from "@/components/device/DeviceFrame";
import DevicePair from "@/components/device/DevicePair";
import AnnotatedPhoto from "@/components/media/AnnotatedPhoto";
import AppStoreCta from "@/components/ui/AppStoreCta";
import Glow from "@/components/ui/Glow";
import { appCapture } from "@/lib/captures";
import { HERO_SCENE } from "@/lib/lifestylePhotos";
import { TRIAL_DAYS } from "@/lib/pricing";

const HERO_POINTS = [
  "Log any meal in seconds, in your own words",
  "See how your food will shape your energy, hunger and mood",
  "Get a nutritionist who checks in, coaches and plans with you",
];

/**
 * Headline first, then the supporting line and App Store button, then the
 * annotated cafe photo with Home and a chat reply on real phones. On a
 * 390 x 844 phone the headline, button and the top of Home all fit the first
 * screen.
 */
export default function HomeHero() {
  return (
    <section
      id="hero"
      aria-labelledby="hero-heading"
      data-section-name="hero"
      className="relative isolate w-full overflow-hidden bg-page pt-16 text-ink"
    >
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
        photo={HERO_SCENE.photo}
        annotations={HERO_SCENE.annotations}
        placeholder={HERO_SCENE.placeholder}
        fadeEdges
        className="mt-8 h-[520px] sm:h-[600px] lg:mt-14 lg:h-auto lg:aspect-[1376/768] lg:max-h-[860px]"
      >
        <div className="absolute inset-x-0 top-6 z-[3] flex justify-center lg:inset-x-auto lg:right-[max(var(--spacing-gutter),calc((100vw-var(--container-content))/2+var(--spacing-gutter)))] lg:top-[7%]">
          <Glow style={{ width: "120%" }} />
          <DevicePair className="[--device-w:270px] sm:[--device-w:300px] lg:[--device-w:clamp(260px,20vw,300px)]">
            <DeviceFrame
              priority
              capture={appCapture("01-home", "PrepIt Home: today's Energy, Satiety and Mood rings, calories and macros")}
            />
            <DeviceFrame
              className="hidden sm:block"
              capture={appCapture(
                "02-chat-chart",
                "The nutritionist answering “show my protein for the last week” with a bar chart",
              )}
            />
          </DevicePair>
        </div>
      </AnnotatedPhoto>
    </section>
  );
}
