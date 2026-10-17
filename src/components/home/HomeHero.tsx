import AnnotatedPhoto from "@/components/media/AnnotatedPhoto";
import PreloadImage from "@/components/media/PreloadImage";
import SpeaksUpPhone from "@/components/home/SpeaksUpPhone";
import AppStoreCta from "@/components/ui/AppStoreCta";
import { heroCafe } from "@/content/lifestyle";
import { heroPhoneMessage } from "@/content/nutritionistMessages";
import { TRIAL_DAYS } from "@/lib/pricing";

/**
 * The promise, then a real moment: the nutritionist's own missed-breakfast
 * message lifted out of the app's chat in a phone (PRE-283, PRE-294), beside
 * the headline on desktop (under the button on phones), then
 * the annotated cafe photo, whose phone shows today's log. On a 390 x 844
 * phone the headline, line and button fit the first screen.
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
      <div className="mx-auto grid w-full max-w-content gap-10 px-gutter pt-8 lg:grid-cols-[minmax(0,1fr)_400px] lg:items-center lg:gap-16 lg:pt-12">
        <div className="flex flex-col gap-6 lg:gap-8">
          <p className="text-eyebrow font-medium uppercase">
            <span className="text-gradient-brand">Your AI nutritionist</span>
          </p>
          <h1 id="hero-heading" className="font-display text-hero text-ink text-balance">
            The nutritionist that notices.
          </h1>
          <p className="max-w-[44ch] text-lead text-ink-secondary text-pretty">
            Tell PrepIt what you eat. It spots what&apos;s behind the 3pm slump and the evening snacking, and tells you
            the one thing to change first.
          </p>
          <AppStoreCta trackingSource="home-hero" note={`${TRIAL_DAYS} days free. Cancel anytime.`} />
        </div>
        <SpeaksUpPhone
          messages={[heroPhoneMessage]}
          loading="eager"
          className="[--device-w:216px] [--speaks-up-crop:calc(var(--device-w)*0.86)] [--speaks-up-pop-scale:1.55] [--speaks-up-pop-x:-12%] [--speaks-up-pop-lift:0.275] [--speaks-up-reason-gap:6px] [--speaks-up-reply-scale:1.2] [--speaks-up-reply-x:6%] [--speaks-up-reply-y:2px] sm:[--device-w:240px] lg:[--device-w:290px] lg:[--speaks-up-crop:calc(var(--device-w)*0.9)] lg:[--speaks-up-pop-scale:1.2] lg:[--speaks-up-pop-x:-14%] lg:[--speaks-up-pop-lift:0.1] lg:[--speaks-up-reply-scale:1.08] lg:[--speaks-up-reply-x:8%] lg:[--speaks-up-reply-y:0px]"
        />
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
