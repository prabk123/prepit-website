import DeviceFrame from "@/components/device/DeviceFrame";
import { BentoGrid, BentoTile } from "@/components/ui/Bento";
import Section from "@/components/ui/Section";
import SectionHeading from "@/components/ui/SectionHeading";
import { appCapture, widgetCapture } from "@/lib/captures";

/**
 * Part of a phone, cropped by the tile, for small bento visuals: its top, or
 * its bottom for screens whose content is a sheet at the bottom.
 */
function PhonePeek({ name, alt, crop = "top" }: { name: string; alt: string; crop?: "top" | "bottom" }) {
  return (
    <div
      className={`flex h-[240px] flex-col overflow-hidden ${
        crop === "top" ? "-mb-8 justify-start lg:-mb-10" : "justify-end"
      }`}
    >
      <DeviceFrame className="[--device-w:260px]" capture={appCapture(name, alt)} />
    </div>
  );
}

function Widget({ capture }: { capture: ReturnType<typeof widgetCapture> }) {
  return (
    <picture>
      {capture.avif && <source srcSet={capture.avif} type="image/avif" />}
      <source srcSet={capture.webp} type="image/webp" />
      <img
        src={capture.src}
        alt={capture.alt}
        width={capture.width}
        height={capture.height}
        loading="lazy"
        decoding="async"
        className="h-auto w-full rounded-widget shadow-phone"
      />
    </picture>
  );
}

function Icon({ path }: { path: string }) {
  return (
    <span className="flex h-12 w-12 items-center justify-center rounded-icon bg-surface-raised text-annotation">
      <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden>
        <path d={path} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

const HEART = "M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z";
const LOCK = "M7 11V8a5 5 0 0 1 10 0v3M6 11h12v9H6z";

/** "Built into your day": everything else as a bento grid of real captures. */
export default function EverythingElse() {
  return (
    <Section id="features" labelledBy="features-heading" analyticsName="everything-else">
      <div className="flex flex-col gap-stack">
        <SectionHeading
          id="features-heading"
          title="Built into your day."
          lead="Small things that keep good eating easy."
        />
        <BentoGrid>
          <BentoTile
            size="large"
            title="Home Screen widgets"
            media={
              <div className="grid w-full max-w-[460px] grid-cols-[minmax(0,2fr)_minmax(0,1fr)] items-start gap-4">
                <Widget
                  capture={widgetCapture(
                    "15-widget-today-plan-large",
                    "Large Today's plan widget with Log it and Skip on planned meals",
                    1014,
                    1062,
                  )}
                />
                <div className="flex flex-col gap-4">
                  <Widget
                    capture={widgetCapture("15-widget-water-small", "Small water widget", 474, 474)}
                  />
                  <Widget
                    capture={widgetCapture("15-widget-streak-small", "Small streak widget", 474, 474)}
                  />
                </div>
              </div>
            }
          >
            Add water, tick supplements and Log it or Skip planned meals without opening the app.
          </BentoTile>
          <BentoTile
            size="medium"
            title="Works offline"
            media={
              <PhonePeek
                name="18b-offline-waiting-list"
                alt="Logs saved with no signal, waiting to send"
              />
            }
          >
            Log meals, water, supplements and weight with no signal. It all sends when you&apos;re back.
          </BentoTile>
          <BentoTile
            size="medium"
            title="Supplements"
            media={
              <PhonePeek
                name="16b-supplements-screen"
                alt="Today's supplements to tick off, and suggestions from your log"
              />
            }
          >
            Track what you take and see what&apos;s worth considering from your log.
          </BentoTile>
          <BentoTile
            title="Achievements"
            media={<PhonePeek
                name="17-achievement"
                crop="bottom"
                alt="An achievement unlocked: On a Roll, 3 days logged in a row"
              />}
          >
            Streaks and milestones that celebrate the habit.
          </BentoTile>
          <BentoTile
            title="Weight and body"
            media={<PhonePeek name="19-body-composition" alt="Body Composition: weight, body fat and lean mass" />}
          >
            Log your weight and watch the trend.
          </BentoTile>
          <BentoTile title="Apple Health" media={<Icon path={HEART} />}>
            Bring in your activity and weight.
          </BentoTile>
          <BentoTile title="Your data stays yours" media={<Icon path={LOCK} />}>
            We never sell your data. Delete your account any time.
          </BentoTile>
        </BentoGrid>
      </div>
    </Section>
  );
}
