import PointList from "@/components/ui/PointList";
import Section from "@/components/ui/Section";
import SectionHeading from "@/components/ui/SectionHeading";

const STEPS = [
  {
    title: "Log",
    detail: "Say what you ate, in your own words or with a photo. PrepIt builds the meal in seconds, and you can fix anything in one tap.",
  },
  {
    title: "Understand",
    detail: "Energy, Satiety and Mood turn each meal into three live scores, so you know how you'll feel.",
  },
  {
    title: "Adjust",
    detail: "Every log comes with one clear next step, and your nutritionist when you want to go deeper.",
  },
];

/**
 * "The loop": Log, Understand, Adjust, with the example next step. The quote
 * is set as site copy, not drawn as an app screen.
 */
export default function LoopSection() {
  return (
    <Section id="loop" labelledBy="loop-heading" analyticsName="loop">
      <div className="flex flex-col gap-stack">
        <SectionHeading
          id="loop-heading"
          size="section"
          title="This isn't “calories in, calories out”. It's a loop that builds lasting habits."
          lead="Every meal you log makes your nutritionist smarter about you."
          className="max-w-[880px]"
        />
        <PointList layout="columns" titleSize="large" points={STEPS} />
        <figure className="flex max-w-[760px] flex-col gap-4 rounded-tile border border-line bg-surface p-6 lg:p-8">
          <figcaption className="text-eyebrow font-medium uppercase text-annotation">A next step, for example</figcaption>
          <blockquote className="text-lead text-ink text-pretty">
            “Afternoon Energy looks soft. Breakfast was light on protein. A Greek yogurt now would help hold Satiety
            until dinner.”
          </blockquote>
        </figure>
      </div>
    </Section>
  );
}
