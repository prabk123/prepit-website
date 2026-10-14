import DeviceFrame from "@/components/device/DeviceFrame";
import DevicePair from "@/components/device/DevicePair";
import FeatureSplit from "@/components/ui/FeatureSplit";
import Glow from "@/components/ui/Glow";
import PointList from "@/components/ui/PointList";
import QuoteCard from "@/components/ui/QuoteCard";
import Section from "@/components/ui/Section";
import SectionHeading from "@/components/ui/SectionHeading";
import TextLink from "@/components/ui/TextLink";
import { appCapture } from "@/lib/captures";

const SIGNALS = [
  {
    title: "Energy",
    detail: "Will you have steady energy and focus today? Built from meal timing, glycaemic load and how you spread your calories.",
    accent: "var(--color-energy)",
  },
  {
    title: "Satiety",
    detail: "Will you stay in control around food? Driven by protein, fibre and how processed your meals are.",
    accent: "var(--color-satiety)",
  },
  {
    title: "Mood",
    detail: "How well yesterday's food set you up for a calm, steady day.",
    accent: "var(--color-mood)",
  },
];

/** "Know how you'll feel": Energy, Satiety and Mood. */
export default function SignalsSection() {
  return (
    <Section id="signals" labelledBy="signals-heading" analyticsName="signals">
      <div className="flex flex-col gap-stack">
        <FeatureSplit
          reverse
          media={
            <div className="relative">
              <Glow />
              <DevicePair className="[--device-w:260px] sm:[--device-w:300px] lg:[--device-w:clamp(260px,22vw,320px)]">
                <DeviceFrame
                  capture={appCapture(
                    "06-signal-energy",
                    "Energy at 84, with what shaped it: calorie fit, meal spread and timing",
                  )}
                />
                <DeviceFrame
                  className="hidden sm:block"
                  capture={appCapture(
                    "07-food-analysis",
                    "What your food did: last 7 days of Energy, Satiety and Mood, and what changed",
                  )}
                />
              </DevicePair>
            </div>
          }
        >
          <SectionHeading
            id="signals-heading"
            size="section"
            title="Calories tell you what you ate. PrepIt tells you how you'll feel."
            lead="Three scores from 0 to 100, built from your food alone. No wearable, no CGM."
          />
        </FeatureSplit>
        <PointList layout="columns" points={SIGNALS} />
        <QuoteCard
          className="max-w-[760px]"
          quote="Afternoon Energy looks soft. Your wrap and flat white are light on protein. A Greek yogurt now would help hold Satiety until dinner."
          name="A next step, for example. Every log ends with one. No shame, no “cheat days”."
        />
        <p className="text-small text-ink-faint">
          Grounded in published nutrition research. Estimates to guide your next meal, not a medical measurement.
          And honest about confidence: when there isn&apos;t enough data, PrepIt says so.
        </p>
        <TextLink href="/features/nutrition-signals">More about Energy, Satiety and Mood</TextLink>
      </div>
    </Section>
  );
}
