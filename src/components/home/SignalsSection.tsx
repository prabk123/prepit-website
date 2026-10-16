import DeviceFrame from "@/components/device/DeviceFrame";
import ChatPanel from "@/components/ui/ChatPanel";
import FeatureSplit from "@/components/ui/FeatureSplit";
import Glow from "@/components/ui/Glow";
import Section from "@/components/ui/Section";
import SectionHeading from "@/components/ui/SectionHeading";
import TextLink from "@/components/ui/TextLink";
import { satietyNextStep } from "@/content/nutritionistMessages";
import { appCapture } from "@/lib/captures";

const SIGNAL_DOTS = [
  { name: "Energy", color: "var(--color-energy)" },
  { name: "Satiety", color: "var(--color-satiety)" },
  { name: "Mood", color: "var(--color-mood)" },
];

/**
 * Standout 2: how your food will make you feel. One score opened with its
 * reasons, and one worked next step.
 */
export default function SignalsSection() {
  return (
    <Section id="signals" labelledBy="signals-heading" analyticsName="signals">
      <FeatureSplit
        reverse
        media={
          <div className="relative">
            <Glow />
            <DeviceFrame
              className="[--device-w:260px] sm:[--device-w:300px] lg:[--device-w:clamp(260px,22vw,320px)]"
              capture={appCapture(
                "06-signal-energy",
                "Energy at 84, with what shaped it: calorie fit, meal spread and timing",
              )}
            />
          </div>
        }
      >
        <SectionHeading
          id="signals-heading"
          size="section"
          title="Know how your food will make you feel."
          lead="Calories say what you ate. Energy, Satiety and Mood say whether you'll get the 3pm dip, stay full until dinner and feel steady tomorrow."
        />
        <ul aria-label="The three scores" className="flex flex-wrap gap-x-6 gap-y-2">
          {SIGNAL_DOTS.map((signal) => (
            <li key={signal.name} className="flex items-center gap-2 text-small font-medium text-ink">
              <span aria-hidden className="h-2.5 w-2.5 rounded-full" style={{ background: signal.color }} />
              {signal.name}
            </li>
          ))}
        </ul>
        <p className="max-w-[46ch] text-body text-ink-secondary text-pretty">
          Each one is a score from 0 to 100, worked out from your food alone. Tap it to see what moved it, and when a
          change would help, your nutritionist tells you what to eat next.
        </p>
        <ChatPanel
          className="max-w-[480px]"
          messages={[satietyNextStep]}
          caption="An example next step. Estimates to guide your next meal, not a medical measurement."
        />
        <TextLink href="/features/nutrition-signals">More about Energy, Satiety and Mood</TextLink>
      </FeatureSplit>
    </Section>
  );
}
