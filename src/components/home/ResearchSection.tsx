import PointList from "@/components/ui/PointList";
import Section from "@/components/ui/Section";
import SectionHeading from "@/components/ui/SectionHeading";
import TextLink from "@/components/ui/TextLink";
import { RESEARCH_PAGE_HREF, RESEARCH_POINTS } from "@/lib/research";

/**
 * "How your nutritionist decides what to say" (PRE-278): how the advice is
 * grounded, in six points, linking to /research for the sources. It is one of
 * the site's two dark bands in the light-led direction; until the light theme
 * (PRE-276) adds that band tone, it sits on the surface tone to stand apart.
 * The homepage restructure (PRE-277) owns where it sits on the page.
 */
export default function ResearchSection() {
  return (
    <Section id="how-it-decides" tone="surface" labelledBy="research-heading" analyticsName="research">
      <div className="flex flex-col gap-stack">
        <SectionHeading
          id="research-heading"
          eyebrow="Why you can trust the advice"
          title="How your nutritionist decides what to say."
          lead="Every reply starts from two things: what you've actually eaten, and what nutrition science says about it."
        />
        <PointList
          layout="columns"
          points={RESEARCH_POINTS.map((point) => ({ title: point.title, detail: point.detail }))}
        />
        <TextLink href={RESEARCH_PAGE_HREF}>See the research and guidance behind it</TextLink>
      </div>
    </Section>
  );
}
