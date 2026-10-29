import SwapFilm from "@/components/motion/SwapFilm";
import FeatureSplit from "@/components/ui/FeatureSplit";
import Section from "@/components/ui/Section";
import SectionHeading from "@/components/ui/SectionHeading";
import TextLink from "@/components/ui/TextLink";

/**
 * "Change anything, just ask.": a film of a planned dinner swapped from chat,
 * drawn in code from the app's captures (see SwapFilm).
 */
export default function PlanSwapSection() {
  return (
    <Section id="plan-swap" labelledBy="plans-swap-heading" analyticsName="plan-swap">
      <FeatureSplit
        reverse
        media={
          <SwapFilm label="An animation of swapping a planned dinner. Saturday's Korean beef rice bowl, then Ask Nutritionist: Can you suggest some alternatives? Of cod and sweet potato mash, a chicken and vegetable stir-fry, or tuna and pasta bake, the stir-fry is picked. An Update plan card waits for Apply Changes, then the stir-fry is Saturday's dinner." />
        }
      >
        <SectionHeading
          id="plans-swap-heading"
          size="section"
          title="Change anything, just ask."
          lead="Want a different dinner on Saturday? Ask, and it swaps it."
        />
        <TextLink href="/features/meal-plans">More about meal plans</TextLink>
      </FeatureSplit>
    </Section>
  );
}
