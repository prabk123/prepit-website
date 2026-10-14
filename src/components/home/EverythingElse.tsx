import DeviceFrame from "@/components/device/DeviceFrame";
import WidgetImage from "@/components/device/WidgetImage";
import { BentoGrid, BentoStack, BentoTile } from "@/components/ui/Bento";
import Section from "@/components/ui/Section";
import SectionHeading from "@/components/ui/SectionHeading";
import TextLink from "@/components/ui/TextLink";
import { appCapture, widgetCapture } from "@/lib/captures";

/**
 * Part of a phone, cropped by the tile, for small bento visuals: its top, or
 * its bottom for screens whose content is a sheet at the bottom.
 */
function PhonePeek({
  name,
  alt,
  crop = "top",
  height = "h-[240px]",
  className = "[--device-w:260px]",
}: {
  name: string;
  alt: string;
  crop?: "top" | "bottom";
  /** The visible part of the phone. */
  height?: string;
  /** The phone's width, as `--device-w` classes. */
  className?: string;
}) {
  return (
    <div
      className={`flex ${height} flex-col overflow-hidden ${
        crop === "top" ? "-mb-8 justify-start lg:-mb-10" : "justify-end"
      }`}
    >
      <DeviceFrame className={className} capture={appCapture(name, alt)} />
    </div>
  );
}

function Icon({ path }: { path: string }) {
  return (
    <span className="flex h-12 w-12 items-center justify-center rounded-icon bg-surface-raised text-ink-muted">
      <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden>
        <path d={path} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

/** Narrower phone beside the text in a row tile, so the text keeps about 230 px. */
const ROW_PHONE = "[--device-w:260px] xl:[--device-w:210px]";

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
            mediaAlign="center"
            title="Home Screen widgets"
            media={
              <div className="grid w-full max-w-[520px] grid-cols-[minmax(0,2fr)_minmax(0,1fr)] items-start gap-4">
                <WidgetImage
                  capture={widgetCapture(
                    "15-widget-today-plan-large",
                    "Large Today's plan widget with Log it and Skip on planned meals",
                    1014,
                    1062,
                  )}
                />
                <div className="flex flex-col gap-4">
                  <WidgetImage
                    capture={widgetCapture("15-widget-water-small", "Small water widget", 474, 474)}
                  />
                  <WidgetImage
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
            layout="row"
            rowFrom="xl"
            title="Works offline"
            media={
              <PhonePeek
                name="18b-offline-waiting-list"
                className={ROW_PHONE}
                alt="Logs saved with no signal, waiting to send"
              />
            }
          >
            Log meals, water, supplements and weight with no signal. It all sends when you&apos;re back.
          </BentoTile>
          <BentoTile
            size="medium"
            layout="row"
            rowFrom="xl"
            title="Supplements"
            media={
              <PhonePeek
                name="16b-supplements-screen"
                className={ROW_PHONE}
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
                height="h-[200px]"
              />}
          >
            Streaks and milestones that celebrate the habit.
          </BentoTile>
          <BentoTile
            title="Weight and body"
            media={<PhonePeek name="19-body-composition" alt="Body Composition: weight, body fat and lean mass" height="h-[200px]" />}
          >
            Log your weight and watch the trend.
          </BentoTile>
          <BentoStack>
            <BentoTile layout="row" mediaAlign="center" title="Apple Health" media={<Icon path={HEART} />}>
              Bring in your activity and weight.
            </BentoTile>
            <BentoTile layout="row" mediaAlign="center" title="Your data stays yours" media={<Icon path={LOCK} />}>
              We never sell your data. Delete your account any time.
            </BentoTile>
          </BentoStack>
        </BentoGrid>
        <TextLink href="/features/widgets-and-siri">More about widgets and Siri</TextLink>
      </div>
    </Section>
  );
}
