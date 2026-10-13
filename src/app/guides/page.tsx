import type { Metadata } from "next";
import GuideCard from "@/components/guides/GuideCard";
import Section from "@/components/ui/Section";
import SectionHeading from "@/components/ui/SectionHeading";
import { GUIDE_SECTIONS, getGuides } from "@/lib/guides";

const title = "Guides";
const description =
  "Short, step-by-step guides to PrepIt: log meals with the Action button, Siri and widgets, describe meals accurately, read Energy, Satiety and Mood, and plan your week.";
const url = "https://www.tryprepit.app/guides";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: url },
  // The preview image comes from ./opengraph-image.tsx.
  openGraph: { type: "website", url, title: `${title} | PrepIt`, description, siteName: "PrepIt", locale: "en_US" },
  twitter: { card: "summary_large_image", title: `${title} | PrepIt`, description },
};

export default async function GuidesPage() {
  const guides = await getGuides();

  return (
    <Section labelledBy="guides-heading">
      <div className="flex flex-col gap-stack">
        <SectionHeading
          as="h1"
          id="guides-heading"
          eyebrow="Guides"
          title="Get more from your nutritionist."
          lead="Short, step-by-step guides to logging faster, logging more accurately and getting the most out of PrepIt."
        />
        {GUIDE_SECTIONS.map((section) => {
          const inSection = guides.filter((guide) => guide.section === section.id);
          if (!inSection.length) return null;
          return (
            <section key={section.id} aria-labelledby={`guides-${section.id}`} className="flex flex-col gap-6">
              <h2 id={`guides-${section.id}`} className="font-display text-title text-ink">
                {section.title}
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:gap-5">
                {inSection.map((guide) => (
                  <GuideCard key={guide.slug} guide={guide} />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </Section>
  );
}
