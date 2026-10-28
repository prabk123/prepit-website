import PlansFilm from "@/components/motion/PlansFilm";
import FeatureSplit from "@/components/ui/FeatureSplit";
import Section from "@/components/ui/Section";
import SectionHeading from "@/components/ui/SectionHeading";

/**
 * "Your week, planned": the text beside a film of the meal plan and its
 * grocery list (see PlansFilm), in place of the kitchen photo. Swapping a
 * meal follows in PlanSwapSection.
 */
export default function PlansBand() {
  return (
    <Section id="plans" labelledBy="plans-heading" analyticsName="plans">
      <FeatureSplit
        media={
          <PlansFilm label="An animation of a PrepIt meal plan for 17 to 23 October, 21 meals. Saturday: protein overnight oats with apple, a chicken burrito bowl and a Korean beef rice bowl, 1,580 kcal against a 1,570 target. Sunday: a berry yogurt parfait, Thai peanut chicken noodles and a salmon teriyaki rice bowl, 1,470 kcal. Then the grocery list, estimated at £48 to £66 and sorted by aisle, has its items ticked off." />
        }
      >
        <SectionHeading
          id="plans-heading"
          size="section"
          title="Your week, planned."
          lead="Ask for a week of meals. You get a plan built around your goals, the food you like and your budget, and one grocery list, sorted by aisle."
        />
      </FeatureSplit>
    </Section>
  );
}
