import FeatureSplit from "@/components/ui/FeatureSplit";
import Section from "@/components/ui/Section";
import SectionHeading from "@/components/ui/SectionHeading";
import TextLink from "@/components/ui/TextLink";
import { lunchRings } from "@/content/lifestyle";

const SIGNAL_DOTS = [
  { name: "Energy", color: "var(--color-energy)" },
  { name: "Satiety", color: "var(--color-satiety)" },
  { name: "Mood", color: "var(--color-mood)" },
];

/**
 * Standout 2: how your food will make you feel: the three rings on a real
 * Home screen, beside the lunch behind them.
 */
export default function SignalsSection() {
  return (
    <Section id="signals" labelledBy="signals-heading" analyticsName="signals">
      <FeatureSplit
        reverse
        media={
          // The lunch photo's 4:5 crop around the phone (PRE-282): Home with
          // Energy 84, Satiety 96 and Mood 87 beside the meal behind them.
          <picture>
            {lunchRings.mobile.avif && (
              <source srcSet={lunchRings.mobile.avif} sizes="(min-width: 1024px) 460px, 100vw" type="image/avif" />
            )}
            {lunchRings.mobile.webp && (
              <source srcSet={lunchRings.mobile.webp} sizes="(min-width: 1024px) 460px, 100vw" type="image/webp" />
            )}
            <img
              src={lunchRings.mobile.src}
              alt={lunchRings.desktop.alt ?? ""}
              width={lunchRings.mobile.width}
              height={lunchRings.mobile.height}
              loading="lazy"
              decoding="async"
              className="mx-auto h-auto w-full max-w-[460px] rounded-card"
            />
          </picture>
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
          Each is a score from 0 to 100, worked out from your food alone. Tap one to see what moved it.
        </p>
        <p className="text-small text-ink-faint">Estimates to guide your next meal, not a medical measurement.</p>
        <TextLink href="/features/nutrition-signals">More about Energy, Satiety and Mood</TextLink>
      </FeatureSplit>
    </Section>
  );
}
