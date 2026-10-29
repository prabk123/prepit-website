import FeatureSplit from "@/components/ui/FeatureSplit";
import Section from "@/components/ui/Section";
import SectionHeading from "@/components/ui/SectionHeading";
import TextLink from "@/components/ui/TextLink";
import PhotoGlance, { GlanceRings } from "@/components/media/PhotoGlance";
import { lunchGlance } from "@/content/lifestyle";

// The showcase account's scores on Home (PRE-282), floating on the lunch photo.
const SIGNAL_SCORES = [
  { name: "Energy", score: 84 },
  { name: "Satiety", score: 96 },
  { name: "Mood", score: 87 },
];

/**
 * Standout 2: how your food will make you feel: the day's three scores
 * floating on the lunch behind them.
 */
export default function SignalsSection() {
  return (
    <Section id="signals" labelledBy="signals-heading" analyticsName="signals">
      <FeatureSplit
        reverse
        media={
          // Lunch, with the day's Energy, Satiety and Mood floating beside
          // it, as on Home (the showcase account's 84, 96 and 87).
          <div className="relative mx-auto w-full max-w-[460px] overflow-hidden rounded-card">
            <picture>
              {lunchGlance.avif && <source srcSet={lunchGlance.avif} sizes="(min-width: 1024px) 460px, 100vw" type="image/avif" />}
              {lunchGlance.webp && <source srcSet={lunchGlance.webp} sizes="(min-width: 1024px) 460px, 100vw" type="image/webp" />}
              <img
                src={lunchGlance.src}
                alt={lunchGlance.alt ?? ""}
                width={lunchGlance.width}
                height={lunchGlance.height}
                loading="lazy"
                decoding="async"
                className="block h-auto w-full"
              />
            </picture>
            <PhotoGlance x={34} y={62} phoneX={5} phoneY={64}>
              <GlanceRings rings={SIGNAL_SCORES.map((s) => ({ label: s.name, score: s.score }))} />
            </PhotoGlance>
          </div>
        }
      >
        <SectionHeading
          id="signals-heading"
          size="section"
          title="Know how your food will make you feel."
          lead="Calories say what you ate. Energy, Satiety and Mood say whether you'll get the 3pm dip, stay full until dinner and feel steady tomorrow."
        />
        <p className="max-w-[46ch] text-body text-ink-secondary text-pretty">
          Each is a score from 0 to 100, worked out from your food alone. Tap one to see what moved it.
        </p>
        <p className="text-small text-ink-faint">Estimates to guide your next meal, not a medical measurement.</p>
        <TextLink href="/features/nutrition-signals">More about Energy, Satiety and Mood</TextLink>
      </FeatureSplit>
    </Section>
  );
}
