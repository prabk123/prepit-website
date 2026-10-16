import DeviceFrame from "@/components/device/DeviceFrame";
import DevicePair from "@/components/device/DevicePair";
import FeatureBlock from "@/components/features/FeatureBlock";
import Glow from "@/components/ui/Glow";
import PhotoBand from "@/components/ui/PhotoBand";
import PointList from "@/components/ui/PointList";
import Section from "@/components/ui/Section";
import SectionHeading from "@/components/ui/SectionHeading";
import TextLink from "@/components/ui/TextLink";
import { signalsGym } from "@/content/featureImagery";
import { appCapture } from "@/lib/captures";

const PHONE = "[--device-w:260px] sm:[--device-w:300px] lg:[--device-w:clamp(260px,22vw,320px)]";

const DRIVERS = [
  {
    title: "Energy",
    detail:
      "Will you have steady energy and focus today? Built from how close you are to your calorie goal, protein in the morning, sugar against other carbs, glycaemic load and how you spread your meals.",
    accent: "var(--color-energy)",
  },
  {
    title: "Satiety",
    detail:
      "Will you stay in control around food? Driven by protein, fibre and how processed your meals are.",
    accent: "var(--color-satiety)",
  },
  {
    title: "Mood",
    detail:
      "How well did yesterday's food set you up for a calm, steady day? Built from yesterday's full log.",
    accent: "var(--color-mood)",
  },
];

/** /features/nutrition-signals: Energy, Satiety and Mood, what drives each, research grounding, no wearable. */
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
          title="Read your day at a glance."
          lead="Three rings on Home, each from 0 to 100. Green, amber or red tells you how today is going before you've finished it."
        />
        <PointList
          layout="rows"
          points={[
            { title: "Energy and Satiety", detail: "Update as you log today" },
            { title: "Mood", detail: "Reads yesterday's full log" },
          ]}
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
          <PointList layout="columns" points={DRIVERS} />
        </div>
      </Section>

      <FeatureBlock
        id="every-meal"
        tone="surface"
        title="Every meal shows what it did."
        lead="Open any meal to see how it moved Energy, Satiety and Mood, with a short tip for next time. Tap a ring on Home to see how the day's score was worked out."
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
        <TextLink href="/guides/energy-satiety-and-mood">Guide: read your Energy, Satiety and Mood</TextLink>
      </FeatureBlock>

      <FeatureBlock
        id="your-week"
        layout="peek"
        title="See what helped your week."
        lead="On Progress, What your food did shows the last 7 days of each score and what pushed it up or down, like protein at breakfast or fibre slipping."
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
            lead="Everything comes from what you log. Apple Health can bring in your activity and weight, but it's never required."
          />
          <PointList
            layout="columns"
            points={[
              { title: "From your food", detail: "Just what you log. Nothing to wear or charge." },
              { title: "Research-based", detail: "Built on published nutrition research." },
              {
                title: "A guide, not a diagnosis",
                detail: "Estimates to guide your next meal, not a medical measurement.",
              },
            ]}
          />
          <TextLink href="/research#scores">How the scores are built, with sources</TextLink>
        </div>
      </Section>
    </>
  );
}
