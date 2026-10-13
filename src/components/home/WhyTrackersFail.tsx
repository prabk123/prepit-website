import PointList from "@/components/ui/PointList";
import Section from "@/components/ui/Section";
import SectionHeading from "@/components/ui/SectionHeading";

const FRUSTRATIONS = [
  {
    title: "Logging takes forever.",
    detail: "Searching databases, guessing portions, scanning every barcode. You quit by week two.",
  },
  {
    title: "Calories don't tell you anything.",
    detail: "You hit your numbers and still feel tired, hungry and foggy, and the numbers don't explain why.",
  },
  {
    title: "They stop at tracking.",
    detail: "“You didn't eat enough protein.” Fine, but what should you eat tonight?",
  },
];

export default function WhyTrackersFail() {
  return (
    <Section id="why" labelledBy="why-heading" analyticsName="why-trackers-fail">
      <div className="flex flex-col gap-stack">
        <SectionHeading
          id="why-heading"
          size="section"
          title="Tracking always starts well. Then it gets annoying."
          lead="PrepIt fixes the three things that make every other app a chore."
          className="max-w-[880px]"
        />
        <PointList layout="columns" points={FRUSTRATIONS} />
      </div>
    </Section>
  );
}
