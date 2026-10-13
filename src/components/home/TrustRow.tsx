import PointList from "@/components/ui/PointList";
import Section from "@/components/ui/Section";
import SectionHeading from "@/components/ui/SectionHeading";

const PROMISES = [
  {
    title: "Editable by design",
    detail: "Every estimate shows its assumptions and is one tap to fix. Nothing is logged until it looks right.",
  },
  {
    title: "Honest about confidence",
    detail: "When there isn't enough data, PrepIt says so instead of giving you confident, wrong advice.",
  },
  {
    title: "Private by default",
    detail: "Your logs and goals are yours, with clear control over your data and history.",
  },
];

/** "AI does the hard part. You stay in control.": the three promises as one compact row. */
export default function TrustRow() {
  return (
    <Section id="trust" labelledBy="trust-heading" analyticsName="trust">
      <div className="flex flex-col gap-stack">
        <SectionHeading
          id="trust-heading"
          size="section"
          title="AI does the hard part. You stay in control."
          lead="No shame. No “cheat days”. Just a clearer next step."
          className="max-w-[880px]"
        />
        <PointList layout="columns" points={PROMISES} />
      </div>
    </Section>
  );
}
