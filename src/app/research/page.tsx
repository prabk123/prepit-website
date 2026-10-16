import type { Metadata } from "next";
import Section from "@/components/ui/Section";
import SectionHeading from "@/components/ui/SectionHeading";
import TextLink from "@/components/ui/TextLink";
import { RESEARCH_POINTS, type ResearchSource } from "@/lib/research";

const title = "How your nutritionist decides what to say";
const description =
  "What PrepIt's advice is built on: a consultation about how you eat, motivational interviewing, scores from nutrition science, official nutrition figures and public health guidance, with the published sources behind each.";
const url = "https://www.tryprepit.app/research";

export const metadata: Metadata = {
  title: { absolute: `${title} | PrepIt` },
  description,
  alternates: { canonical: url },
  // Page-level openGraph and twitter replace the root layout's, so the shared
  // preview image and site name are repeated here.
  openGraph: {
    type: "website",
    url,
    title,
    description,
    siteName: "PrepIt",
    locale: "en_US",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "PrepIt – Your AI nutritionist app" }],
  },
  twitter: { card: "summary_large_image", title, description, images: ["/og-image.png"] },
};

/** Sources in order of first appearance of their topic; untagged ones form one group. */
function groupByTopic(sources: ResearchSource[]) {
  const groups: { topic?: string; sources: ResearchSource[] }[] = [];
  for (const source of sources) {
    const group = groups.find((g) => g.topic === source.topic);
    if (group) group.sources.push(source);
    else groups.push({ topic: source.topic, sources: [source] });
  }
  return groups;
}

/** /research: the six points from the homepage research band, each with its sources (PRE-278). */
export default function ResearchPage() {
  return (
    <div className="w-full bg-page pt-16 text-ink [color-scheme:dark] lg:pt-[72px]">
      <Section labelledBy="research-page-heading">
        <div className="mx-auto flex max-w-[760px] flex-col gap-stack">
          <SectionHeading
            as="h1"
            id="research-page-heading"
            eyebrow="Why you can trust the advice"
            title="How your nutritionist decides what to say."
            lead="Every reply starts from two things: what you've actually eaten, and what nutrition science says about it. Here's what sits behind it, and where it comes from."
          />

          <ol className="flex flex-col border-b border-line">
            {RESEARCH_POINTS.map((point) => (
              <li
                key={point.id}
                id={point.id}
                className="flex scroll-mt-28 flex-col gap-4 border-t border-line py-8"
              >
                <h2 className="font-display text-title text-ink text-balance">{point.title}</h2>
                <p className="text-lead text-ink-secondary text-pretty">{point.detail}</p>
                {point.more && <p className="text-body text-ink-muted text-pretty">{point.more}</p>}
                {point.sources.length > 0 && (
                  <div className="flex flex-col gap-3 pt-2">
                    <h3 className="text-eyebrow font-medium uppercase text-ink-muted">Sources</h3>
                    {groupByTopic(point.sources).map((group) => (
                      <div key={group.topic ?? "all"} className="flex flex-col gap-2.5">
                        {group.topic && <h4 className="text-small font-medium text-ink-secondary">{group.topic}</h4>}
                        <ul className="flex flex-col gap-2.5">
                          {group.sources.map((source) => (
                            <li key={source.url} className="text-small text-ink-muted text-pretty">
                              <a
                                href={source.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-ink-secondary underline decoration-ink-faint underline-offset-4 hover:decoration-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cream"
                              >
                                {source.citation}
                              </a>{" "}
                              <span className="italic">{source.where}</span>.
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}
              </li>
            ))}
          </ol>

          <p className="text-small text-ink-faint text-pretty">
            PrepIt gives nutrition guidance, not medical advice. Energy, Satiety and Mood are
            estimates to guide your next meal, not a medical measurement. The studies above are
            the published work each part rests on; PrepIt itself hasn&apos;t been tested in them.
          </p>
          <TextLink href="/features/nutrition-signals">More about Energy, Satiety and Mood</TextLink>
        </div>
      </Section>
    </div>
  );
}
