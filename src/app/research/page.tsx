import type { Metadata } from "next";
import DeviceFrame, { type DeviceCapture } from "@/components/device/DeviceFrame";
import MotionLayer from "@/components/motion/MotionLayer";
import Section from "@/components/ui/Section";
import SectionHeading from "@/components/ui/SectionHeading";
import TextLink from "@/components/ui/TextLink";
import { appCapture } from "@/lib/captures";
import { RESEARCH_POINTS, type ResearchSource } from "@/lib/research";

const title = "How your nutritionist decides what to say";
const description =
  "What PrepIt's advice is built on: a consultation about how you eat, motivational interviewing, scores from nutrition science, official nutrition figures and public health guidance, with the published sources behind each.";
const url = "https://www.tryprepit.app/research";

export const metadata: Metadata = {
  title: { absolute: `${title} | PrepIt` },
  description,
  alternates: { canonical: url },
  // Page-level openGraph and twitter replace the root layout's, so the site
  // name is repeated here. The preview image is the site default
  // (src/app/opengraph-image.tsx).
  openGraph: {
    type: "website",
    url,
    title,
    description,
    siteName: "PrepIt",
    locale: "en_US",
  },
  twitter: { card: "summary_large_image", title, description },
};

/**
 * The app screen beside each point (PRE-285), so the page isn't six screens of
 * text on a phone. "It knows its limits" has no screen of its own.
 */
const POINT_CAPTURES: Record<string, DeviceCapture> = {
  "knows-you": appCapture(
    "20-focus-picker",
    "The consultation's focus picker: front-load protein at breakfast, even out the day, or make snacks work harder",
  ),
  coaching: appCapture(
    "02-chat-chart",
    "The nutritionist reflecting back last week's toast and jam breakfast, then charting protein per day when asked",
  ),
  scores: appCapture(
    "06-signal-energy",
    "Energy at 84, with how it's shaped: calorie fit against what's expected by now, and meal spread",
  ),
  numbers: appCapture(
    "05-meal-detail",
    "Protein overnight oats with apple and cinnamon: 357 calories, 34 g protein, and each ingredient with its own calories and macros",
  ),
  guidance: appCapture(
    "16c-supplements-suggested",
    "Suggested for you: Vitamin D and Vitamin B12, each with the NHS reference amount, your log's average and its NHS source",
  ),
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
    <div className="w-full bg-page pt-16 text-ink lg:pt-[72px]">
      <MotionLayer />
      <Section labelledBy="research-page-heading">
        <div className="mx-auto flex max-w-[1040px] flex-col gap-stack">
          <SectionHeading
            as="h1"
            intro
            id="research-page-heading"
            eyebrow="Why you can trust the advice"
            title="How your nutritionist decides what to say."
            className="max-w-[760px]"
            lead="Every reply starts from two things: what you've actually eaten, and what nutrition science says about it. Here's what sits behind it, and where it comes from."
          />

          <ol className="flex flex-col border-b border-line">
            {RESEARCH_POINTS.map((point) => {
              const capture = POINT_CAPTURES[point.id];
              return (
                <li
                  key={point.id}
                  id={point.id}
                  className="grid scroll-mt-28 items-start gap-8 border-t border-line py-8 lg:grid-cols-[minmax(0,1fr)_260px] lg:gap-16 lg:py-12"
                >
                  <div className="flex min-w-0 flex-col gap-4">
                    <h2 className="font-display text-title text-ink text-balance">{point.title}</h2>
                    <p className="text-lead text-ink-secondary text-pretty">{point.detail}</p>
                    {point.more && <p className="text-body text-ink-muted text-pretty">{point.more}</p>}
                    {point.sources.length > 0 && (
                      // Folded away so the long lists don't bury the next point (PRE-285).
                      <details className="group flex flex-col pt-2">
                        <summary className="flex min-h-11 w-fit cursor-pointer list-none items-center gap-2 text-eyebrow font-medium uppercase text-ink-muted hover:text-ink [&::-webkit-details-marker]:hidden">
                          Sources ({point.sources.length})
                          <span aria-hidden className="transition-transform group-open:rotate-45">
                            +
                          </span>
                        </summary>
                        <div className="flex flex-col gap-3 pt-2">
                          {groupByTopic(point.sources).map((group) => (
                            <div key={group.topic ?? "all"} className="flex flex-col gap-2.5">
                              {group.topic && (
                                <h3 className="text-small font-medium text-ink-secondary">{group.topic}</h3>
                              )}
                              <ul className="flex flex-col gap-2.5">
                                {group.sources.map((source) => (
                                  <li key={source.url} className="text-small text-ink-muted text-pretty">
                                    <a
                                      href={source.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-ink-secondary underline decoration-ink-faint underline-offset-4 hover:decoration-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus"
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
                      </details>
                    )}
                  </div>
                  {capture && (
                    <DeviceFrame className="mx-auto [--device-w:220px] lg:[--device-w:260px]" capture={capture} />
                  )}
                </li>
              );
            })}
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
