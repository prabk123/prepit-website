import type { Metadata } from "next";
import Link from "next/link";
import DeviceFrame from "@/components/device/DeviceFrame";
import { BentoGrid, BentoTile } from "@/components/ui/Bento";
import FeatureSplit from "@/components/ui/FeatureSplit";
import Glow from "@/components/ui/Glow";
import Section from "@/components/ui/Section";
import SectionHeading from "@/components/ui/SectionHeading";
import { appCapture } from "@/lib/captures";

const title = "About PrepIt";
const description =
  "Why PrepIt exists: a nutritionist that is always on, for everyone who eats. The principles we build it by: accuracy, honesty about confidence, privacy and no guilt.";
const url = "https://www.tryprepit.app/about";

export const metadata: Metadata = {
  title: { absolute: `${title} | Your personal AI nutritionist` },
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

const principles = [
  {
    title: "Official sources first",
    body: "PrepIt checks official brand and restaurant nutrition information before anything else, and every estimate shows what it assumed.",
  },
  {
    title: "Honest about confidence",
    body: "When there isn't enough to go on, PrepIt says so, or asks you, instead of giving you confident, wrong advice.",
  },
  {
    title: "Private by default",
    body: "Your logs and goals are yours. We never sell your personal or health data, and you can delete your account at any time.",
  },
  {
    title: "No guilt",
    body: "No shame. No “cheat days”. Just a clearer next step.",
  },
];

export default function AboutPage() {
  return (
    <div className="w-full bg-page pt-16 text-ink [color-scheme:dark] lg:pt-[72px]">
      {/* A lifestyle photo from PRE-199 can replace the phone here once it is ready. */}
      <Section labelledBy="about-heading">
        <FeatureSplit
          emphasis="text"
          media={
            <div className="relative py-4">
              <Glow />
              <DeviceFrame
                className="[--device-w:260px] sm:[--device-w:300px] lg:[--device-w:340px]"
                priority
                capture={appCapture(
                  "02-chat-chart",
                  "PrepIt's nutritionist answering a question about protein with a chart of the last week",
                )}
              />
            </div>
          }
        >
          <SectionHeading
            as="h1"
            id="about-heading"
            title="A nutritionist for everyone who eats."
            lead="PrepIt knows what you ate, what you're aiming for and how your food is likely to make you feel. It checks in, spots patterns and tells you what to eat next, every day."
          />
        </FeatureSplit>
      </Section>

      <Section tone="surface" labelledBy="why-heading">
        <div className="mx-auto flex max-w-[720px] flex-col gap-8">
          <SectionHeading id="why-heading" size="title" title="Why PrepIt exists" />
          <div className="flex flex-col gap-5 text-lead text-ink-secondary text-pretty">
            <p>
              Tracking always starts well. Then it gets annoying. You search databases, guess
              portions and hit your numbers, and you still feel tired, hungry and foggy without
              knowing why. Most apps stop there. “You didn’t eat enough protein.” Fine, but what
              should you eat tonight?
            </p>
            <p>
              A good nutritionist does the part that matters. They look at your whole day, notice
              the patterns you can’t see, and give you one clear thing to try next. They check in
              when you go quiet and adjust when life gets in the way. Very few people have one.
            </p>
            <p>
              PrepIt is built to be that nutritionist, always on and in your pocket. Logging is
              only how it learns, so we made it take seconds: type it, snap it or say it. Everything
              else goes into helping you eat a little better this week than last.
            </p>
          </div>
        </div>
      </Section>

      <Section labelledBy="principles-heading">
        <div className="flex flex-col gap-stack">
          <SectionHeading
            id="principles-heading"
            title="What we hold ourselves to."
            lead="The principles behind every part of PrepIt."
          />
          <BentoGrid>
            {principles.map((principle) => (
              <BentoTile key={principle.title} title={principle.title}>
                {principle.body}
              </BentoTile>
            ))}
            <BentoTile size="medium" title="You stay in control">
              Your nutritionist can log, move or fix a meal, plan your week and change your goals,
              but you confirm every log, plan or goal change before it’s saved.
            </BentoTile>
            <BentoTile size="medium" title="A nutritionist, not a doctor">
              PrepIt gives nutrition guidance, not medical advice, and will tell you when something
              needs a professional.
            </BentoTile>
          </BentoGrid>
        </div>
      </Section>

      <Section tone="surface" labelledBy="team-heading">
        <div className="mx-auto flex max-w-[720px] flex-col gap-8">
          <SectionHeading id="team-heading" size="title" title="Who builds it" />
          <div className="flex flex-col gap-5 text-lead text-ink-secondary text-pretty">
            <p>
              PrepIt is made by a small, independent team, and it gets better every week from what
              the people using it tell us.
            </p>
            <p>
              Found something we got wrong, or want something we haven’t built yet?{" "}
              <a
                href="https://prepit.userjot.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-ink underline decoration-ink-faint underline-offset-4 hover:decoration-ink"
              >
                Share your feedback
              </a>{" "}
              or{" "}
              <Link
                href="/contact"
                className="text-ink underline decoration-ink-faint underline-offset-4 hover:decoration-ink"
              >
                get in touch
              </Link>
              . New to PrepIt? Start with the{" "}
              <Link
                href="/guides"
                className="text-ink underline decoration-ink-faint underline-offset-4 hover:decoration-ink"
              >
                guides
              </Link>
              .
            </p>
          </div>
        </div>
      </Section>
    </div>
  );
}
