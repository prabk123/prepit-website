import type { Metadata } from "next";
import Link from "next/link";
import DeviceFrame from "@/components/device/DeviceFrame";
import { BentoTile } from "@/components/ui/Bento";
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
    <div className="w-full bg-page pt-16 text-ink lg:pt-[72px]">
      {/* A real check-in that names one easy fix. Not Home, which the download section below already shows (PRE-289). */}
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
                  "25b-nudge-protein",
                  "The nutritionist noticing protein was under target on 18 of 21 days, mostly at dinner, and offering two easy fixes: Bigger protein at dinner or Greek yogurt after dinner",
                )}
              />
            </div>
          }
        >
          <SectionHeading
            as="h1"
            id="about-heading"
            title="A nutritionist for everyone who eats."
            lead="PrepIt knows what you ate, what you're aiming for and how your food is likely to make you feel, and tells you what to eat next."
          />
        </FeatureSplit>
      </Section>

      <Section tone="surface" labelledBy="why-heading">
        {/* Beside a real chat, so the story isn't a wall of text on phones (PRE-285). */}
        <FeatureSplit
          reverse
          media={
            <div className="relative">
              <Glow />
              <DeviceFrame
                className="[--device-w:240px] sm:[--device-w:280px] lg:[--device-w:300px]"
                capture={appCapture(
                  "02-chat-chart",
                  "The nutritionist noticing that last week's toast and jam breakfast came before the 3pm dip, then charting protein per day",
                )}
              />
            </div>
          }
        >
          <SectionHeading id="why-heading" size="section" title="Why PrepIt exists." />
          <div className="flex flex-col gap-5 text-lead text-ink-secondary text-pretty">
            <p>
              Tracking always starts well. Then it gets annoying. You hit your numbers and still feel tired, hungry and
              foggy without knowing why. “You didn’t eat enough protein.” Fine, but what should you eat tonight?
            </p>
            <p>
              A good nutritionist notices the patterns you can’t see and gives you one clear thing to try next. Very few
              people have one. PrepIt is built to be that nutritionist, always on and in your pocket.
            </p>
          </div>
        </FeatureSplit>
      </Section>

      <Section labelledBy="principles-heading">
        <div className="flex flex-col gap-stack">
          <SectionHeading
            id="principles-heading"
            size="section"
            title="What we hold ourselves to."
            lead="The principles behind every part of PrepIt."
          />
          {/*
            Three by three on desktop, so no tile is squeezed to a narrow column (PRE-289). Text only:
            a phone in one tile left the other two in its row mostly empty, and the hero and the story
            above already show the app.
          */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
            {principles.map((principle) => (
              <BentoTile key={principle.title} title={principle.title}>
                {principle.body}
              </BentoTile>
            ))}
            <BentoTile title="You stay in control">
              Your nutritionist can log, move or fix a meal, plan your week and change your goals,
              but any log, plan or goal change it makes shows up as a card first, and nothing is saved until you tap it.
            </BentoTile>
            <BentoTile title="A nutritionist, not a doctor">
              PrepIt gives nutrition guidance, not medical advice, and will tell you when something
              needs a professional.
            </BentoTile>
          </div>
        </div>
      </Section>

      <Section tone="surface" labelledBy="team-heading">
        <div className="mx-auto flex max-w-[720px] flex-col gap-8">
          <SectionHeading id="team-heading" size="section" title="Who builds it." />
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
