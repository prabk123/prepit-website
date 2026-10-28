import type { CSSProperties } from "react";
import FeatureSplit from "@/components/ui/FeatureSplit";
import Section from "@/components/ui/Section";
import SectionHeading from "@/components/ui/SectionHeading";
import TextLink from "@/components/ui/TextLink";
import { lunchRings } from "@/content/lifestyle";

// The scores on the Home screen in the photo beside them (PRE-282).
const SIGNAL_SCORES = [
  { name: "Energy", color: "var(--color-energy)", score: 84 },
  { name: "Satiety", color: "var(--color-satiety)", score: 96 },
  { name: "Mood", color: "var(--color-mood)", score: 87 },
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
        {/* Each ring fills to the lunch's score as it comes into view, the
            number counting up with it (website motion experiment). */}
        <ul aria-label="The three scores for the lunch in the photo" className="flex flex-wrap gap-x-8 gap-y-4">
          {SIGNAL_SCORES.map((signal, i) => (
            <li
              key={signal.name}
              className="signal-ring flex items-center gap-3"
              style={{ "--ring-color": signal.color, "--ring-score": signal.score, "--i": i } as CSSProperties}
            >
              <span className="relative grid h-14 w-14 place-items-center">
                <svg aria-hidden viewBox="0 0 56 56" className="absolute inset-0 -rotate-90">
                  <circle cx="28" cy="28" r="24" fill="none" stroke="var(--color-line)" strokeWidth="5" />
                  <circle
                    className="signal-ring__arc"
                    cx="28"
                    cy="28"
                    r="24"
                    fill="none"
                    stroke={signal.color}
                    strokeWidth="5"
                    strokeLinecap="round"
                    pathLength={100}
                  />
                </svg>
                <span data-count={signal.score} className="font-display text-[18px] text-ink tabular-nums">
                  {signal.score}
                </span>
              </span>
              <span className="text-small font-medium text-ink">{signal.name}</span>
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
