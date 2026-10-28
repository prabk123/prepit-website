import HowItWorksFilm from "@/components/motion/HowItWorksFilm";
import FeatureSplit from "@/components/ui/FeatureSplit";
import Section from "@/components/ui/Section";
import SectionHeading from "@/components/ui/SectionHeading";

/**
 * How it works in one 22 second take (website motion experiment): the
 * nutritionist speaks up, you act on it, and logging the meal lands the day.
 * The film is drawn in code (see HowItWorksFilm).
 */
export default function HowItWorksSection() {
  return (
    <Section
      id="how-it-works"
      labelledBy="how-it-works-heading"
      analyticsName="how-it-works"
    >
      <FeatureSplit
        media={
          <HowItWorksFilm label="An animation of the PrepIt app. The nutritionist notices protein has been under target on 18 of 21 days, mostly at dinner, and suggests a bigger portion of protein at dinner. That reply is tapped. Then a Mediterranean salmon bowl with quinoa is logged from the plus button at 6:45 PM: 454 calories, and the day's Eaten goes from 1,027 to 1,481 of 1,570 calories, on track, with Energy 84, Satiety 96 and Mood 87." />
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
