import BandPhoto from "@/components/ui/BandPhoto";
import PointList from "@/components/ui/PointList";
import Section from "@/components/ui/Section";
import SectionHeading from "@/components/ui/SectionHeading";
import TextLink from "@/components/ui/TextLink";
import { researchStill } from "@/content/featureImagery";
import { HOME_RESEARCH_POINT_IDS, RESEARCH_PAGE_HREF, RESEARCH_POINTS } from "@/lib/research";

// Three points in one short line each, so the band stays about a phone screen
// tall (PRE-284). The other three, and the sources, are on /research.
const HOME_POINTS = HOME_RESEARCH_POINT_IDS.map((id) => RESEARCH_POINTS.find((point) => point.id === id)!);

/**
 * "How your nutritionist decides what to say" (PRE-278): how the advice is
 * grounded, in three short points, linking to /research for all six and the sources. It is one of
 * the site's two dark bands in the light-led direction (PRE-276's dark tone).
 * The homepage restructure (PRE-277) puts it after Energy, Satiety and Mood.
 */
export default function ResearchSection() {
  return (
    <Section id="how-it-decides" tone="dark" labelledBy="research-heading" analyticsName="research">
      <BandPhoto photo={researchStill} />
      <div className="flex flex-col gap-stack">
        <SectionHeading
          id="research-heading"
          eyebrow="Why you can trust the advice"
          title="How your nutritionist decides what to say."
          lead="Every reply starts from two things: what you've actually eaten, and what nutrition science says about it."
        />
        <PointList
          layout="columns"
          points={HOME_POINTS.map((point) => ({ title: point.title, detail: point.summary ?? point.detail }))}
        />
        <TextLink href={RESEARCH_PAGE_HREF}>See all six, with the research behind them</TextLink>
      </div>
    </Section>
  );
}
