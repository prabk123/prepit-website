import DeviceFrame from "@/components/device/DeviceFrame";
import DevicePair from "@/components/device/DevicePair";
import FeatureBlock from "@/components/features/FeatureBlock";
import CaptureRow from "@/components/ui/CaptureRow";
import Glow from "@/components/ui/Glow";
import PhotoBand from "@/components/ui/PhotoBand";
import QuoteCard from "@/components/ui/QuoteCard";
import Section from "@/components/ui/Section";
import SectionHeading from "@/components/ui/SectionHeading";
import TextLink from "@/components/ui/TextLink";
import { signalsGym } from "@/content/featureImagery";
import { appCapture } from "@/lib/captures";

const PHONE = "[--device-w:260px] sm:[--device-w:300px] lg:[--device-w:clamp(260px,22vw,320px)]";

// Each score under its own screen, so this isn't a text-only stretch on phones (PRE-285).
const DRIVERS = [
  {
    title: "Energy",
    detail:
      "Will you hit a slump mid-afternoon? It looks at how close you are to your calorie goal, protein in the morning, sugar against other carbs, glycaemic load and how you spread your meals.",
    accent: "var(--color-energy)",
    capture: appCapture("06-signal-energy", "Energy at 84, with how it's shaped: calorie fit and meal spread"),
  },
  {
    title: "Satiety",
    detail:
      "Will you stay full until your next meal, or find yourself at the biscuit tin? It looks at protein, fibre and how processed your meals are.",
    accent: "var(--color-satiety)",
    capture: appCapture("06b-signal-satiety", "Satiety at 96, with how it's shaped: protein and fibre"),
  },
  {
    title: "Mood",
    detail:
      "Will today feel calm and steady? It reads yesterday's whole day, because that's the food that shapes how you feel this morning.",
    accent: "var(--color-mood)",
    capture: appCapture("01-home", "Home with Mood at 87 beside Energy and Satiety"),
  },
];

/**
 * /features/nutrition-signals: standout 2, "how your food will make you
 * feel". The rings, a worked example of a reason and a next step, what moves
 * each score, the week view, and no wearable.
 */
export default function SignalsFeature() {
  return (
    <>
      <PhotoBand
        id="at-a-glance"
        labelledBy="at-a-glance-heading"
        photo={signalsGym.desktop}
        phonePhoto={signalsGym.mobile}
        textSide={signalsGym.textSide}
      >
        <SectionHeading
          id="at-a-glance-heading"
          size="section"
          title="One look tells you how today is going."
          lead="Three rings on Home, each from 0 to 100. Green, amber or red shows how today is going while there's still time to change dinner."
        />
      </PhotoBand>

      <Section id="drivers" labelledBy="drivers-heading">
        <div className="flex flex-col gap-stack">
          <SectionHeading
            id="drivers-heading"
            size="section"
            title="What moves each score."
            lead="Not just how much you ate, but what, and when."
          />
          <CaptureRow label="What moves each score" items={DRIVERS} />
        </div>
      </Section>

      <FeatureBlock
        id="every-meal"
        tone="surface"
        title="Every score comes with a reason."
        lead="Tap a ring to see what moved it, like a breakfast light on protein. Open any meal to see what it did to each score."
        media={
          <div className="relative">
            <Glow />
            <DeviceFrame
              className={PHONE}
              capture={appCapture(
                "05-meal-detail",
                "Protein overnight oats with apple and cinnamon: 357 calories, 34 g protein and each ingredient, with its Energy card below",
              )}
            />
          </div>
        }
      >
        <QuoteCard
          quote="Your toast and jam breakfast was light on protein. Adding eggs or Greek yogurt at lunch would help hold Satiety until dinner."
          name="A next step, for example. No shame, no “cheat days”."
        />
        <TextLink href="/guides/energy-satiety-and-mood">Guide: read your Energy, Satiety and Mood</TextLink>
      </FeatureBlock>

      <FeatureBlock
        id="your-week"
        layout="peek"
        title="See what helped your week."
        lead="On Progress, What your food did shows the last 7 days of each score and what pushed it up or down, like protein at breakfast helping, or fibre slipping."
        media={
          <div className="relative">
            <Glow />
            <DevicePair className={PHONE}>
              <DeviceFrame
                capture={appCapture(
                  "07-food-analysis",
                  "What your food did: the last 7 days of Energy, Satiety and Mood, and what changed",
                )}
              />
              <DeviceFrame
                className="hidden sm:block"
                capture={appCapture(
                  "06b-signal-satiety",
                  "Satiety's detail for the day, with what shaped the score",
                )}
              />
            </DevicePair>
          </div>
        }
      />

      <Section id="no-wearable" tone="surface" labelledBy="no-wearable-heading">
        <div className="flex flex-col gap-stack">
          <SectionHeading
            id="no-wearable-heading"
            size="section"
            title="No ring. No watch. No glucose monitor."
            lead="Everything starts from what you eat, so there's nothing to wear or charge. Connect Apple Health and it can tell a hungry gym day from a hungry rest day."
          />
          <p className="max-w-[60ch] text-body text-ink-muted text-pretty">
            The scores are built on published nutrition research. They&apos;re estimates to guide your next meal,
            not a medical measurement, and when there isn&apos;t enough to go on, PrepIt says so.
          </p>
          <TextLink href="/research#scores">How the scores are built, with sources</TextLink>
        </div>
      </Section>
    </>
  );
}
