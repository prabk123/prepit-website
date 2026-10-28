import HowItWorksFilm from "@/components/motion/HowItWorksFilm";
import FeatureSplit from "@/components/ui/FeatureSplit";
import Section from "@/components/ui/Section";
import SectionHeading from "@/components/ui/SectionHeading";

/**
 * How it works in one 15 second take (website motion experiment): type what
 * you ate, it's logged, you see how it will make you feel, and your
 * nutritionist speaks up. The film is drawn in code (see HowItWorksFilm).
 */
export default function HowItWorksSection() {
  return (
    <Section id="how-it-works" labelledBy="how-it-works-heading" analyticsName="how-it-works">
      <FeatureSplit
        media={
          <HowItWorksFilm label="An animation: someone types two eggs and buttered toast, PrepIt logs it at 273 kcal with 16g of protein, shows Energy, Satiety and Mood filling, and the nutritionist replies that 16g of protein at breakfast keeps the 3pm dip away." />
        }
      >
        <SectionHeading
          id="how-it-works-heading"
          size="section"
          title="Say what you ate. It notices the rest."
          lead="Type it, snap it or say it. It's on your log in seconds, with how it will make you feel, and your nutritionist speaks up when something's worth changing."
        />
      </FeatureSplit>
    </Section>
  );
}
