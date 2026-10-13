import PointList from "@/components/ui/PointList";

const FACTS = [
  { title: "No wearable", detail: "It works from what you eat. No ring, no watch, no glucose monitor." },
  { title: "Research-backed", detail: "Energy, Satiety and Mood are based on published nutrition research." },
  { title: "Seconds to log", detail: "Type it, snap it or say it. Your nutritionist does the maths." },
  { title: "Made for iPhone", detail: "Widgets, Siri, the Action button and your Lock Screen." },
];

/**
 * Four product facts under the hero. The App Store rating and reviews are left
 * off until there are enough ratings (Prabodh, 13 Oct).
 */
export default function ProofStrip() {
  return (
    <section
      aria-label="Why PrepIt is different"
      data-section-name="proof-strip"
      className="w-full bg-page text-ink"
    >
      <div className="mx-auto w-full max-w-content px-gutter pt-12 lg:pt-16">
        <PointList layout="columns" columns={4} titleSize="large" points={FACTS} />
      </div>
    </section>
  );
}
