import KnowsYouFilm from "@/components/motion/KnowsYouFilm";
import FeatureSplit from "@/components/ui/FeatureSplit";
import Section from "@/components/ui/Section";
import SectionHeading from "@/components/ui/SectionHeading";

/**
 * Standout 1, second half: how it gets to know you. A film of the
 * consultation's focus picker becoming a weekly check-in report, drawn in
 * code from the app's captures (see KnowsYouFilm).
 */
export default function KnowsYouSection() {
  return (
    <Section id="consultation" labelledBy="knows-you-heading" analyticsName="knows-you">
      <FeatureSplit
        media={
          <KnowsYouFilm label="An animation of PrepIt's app screens. The consultation's Pick your focus card: Front-load protein at breakfast is picked as the main focus and Even out the day as the second, then Continue. Then a weekly check-in for 6 to 12 October: Your steadiest week yet. The Lose fat goal shows 79.2 kg against a 75.0 kg goal weight, a pace of 0.4 kg a week against a goal pace of 0.3, On pace. Calories averaged 1,562 over 7 logged days against a 1,570 target." />
        }
      >
        <SectionHeading
          id="knows-you-heading"
          size="section"
          title="First, it gets to know you."
          lead="A short consultation about how you eat now ends with one or two things to focus on, like protein at breakfast or the evening snacking."
        />
        <p className="max-w-[46ch] text-body text-ink-secondary text-pretty">
          Every week, a check-in looks back at how it went and picks the one thing to change next.
        </p>
      </FeatureSplit>
    </Section>
  );
}
