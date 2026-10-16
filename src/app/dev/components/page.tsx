import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import DeviceFrame, { type DeviceCapture } from "@/components/device/DeviceFrame";
import DevicePair from "@/components/device/DevicePair";
import AppStoreCta from "@/components/ui/AppStoreCta";
import { BentoGrid, BentoTile } from "@/components/ui/Bento";
import CtaBand from "@/components/ui/CtaBand";
import FeatureSplit from "@/components/ui/FeatureSplit";
import Glow from "@/components/ui/Glow";
import PhotoBand from "@/components/ui/PhotoBand";
import PointList from "@/components/ui/PointList";
import AnnotatedPhoto from "@/components/media/AnnotatedPhoto";
import { heroCafe, plansKitchen } from "@/content/lifestyle";
import PricingCard from "@/components/ui/PricingCard";
import QuoteCard from "@/components/ui/QuoteCard";
import Section from "@/components/ui/Section";
import SectionHeading from "@/components/ui/SectionHeading";
import { TRIAL_NOTE } from "@/lib/pricing";

export const metadata: Metadata = {
  title: "Component preview",
  robots: { index: false, follow: false },
};

// Local development and Vercel preview deployments only. Production builds
// return 404, and the page is not in the sitemap.
const previewEnabled =
  process.env.NODE_ENV !== "production" || process.env.VERCEL_ENV === "preview";

// Real dark-mode simulator captures. The full set comes with PRE-198.
const recipeCapture: DeviceCapture = {
  alt: "PrepIt recipe screen with ingredients and preparation steps",
  avif: "/dev-preview/capture-recipe.avif",
  webp: "/dev-preview/capture-recipe.webp",
  src: "/dev-preview/capture-recipe.webp",
};

const groceryCapture: DeviceCapture = {
  alt: "PrepIt grocery list grouped by aisle",
  avif: "/dev-preview/capture-grocery.avif",
  webp: "/dev-preview/capture-grocery.webp",
  src: "/dev-preview/capture-grocery.webp",
};

const loopVideo = {
  mp4: "/dev-preview/loop.mp4",
  webm: "/dev-preview/loop.webm",
  poster: "/dev-preview/loop-poster.webp",
  width: 540,
  height: 1174,
  label: "PrepIt screens: a recipe, the grocery list and a plan day",
};

const colours = [
  ["page", "bg-page"],
  ["surface", "bg-surface"],
  ["surface-raised", "bg-surface-raised"],
  ["line", "bg-line"],
  ["line-strong", "bg-line-strong"],
  ["ink", "bg-ink"],
  ["ink-secondary", "bg-ink-secondary"],
  ["ink-muted", "bg-ink-muted"],
  ["ink-faint", "bg-ink-faint"],
  ["primary", "bg-primary"],
  ["accent", "bg-accent"],
  ["accent-text", "bg-accent-text"],
  ["energy", "bg-energy"],
  ["satiety", "bg-satiety"],
  ["mood", "bg-mood"],
] as const;

const typeScale = [
  ["hero", "font-display text-hero", "Eat well."],
  ["chapter", "font-display text-chapter", "Log a meal in seconds."],
  ["title", "font-display text-title", "One plan. Everything included."],
  ["card-title", "font-display text-card-title", "Home Screen widgets"],
  ["lead", "text-lead text-ink-secondary", "Type it, snap it or say it."],
  ["body", "text-body text-ink-muted", "Log meals, water, supplements and weight with no signal."],
  ["small", "text-small text-ink-muted", "Research-based estimates, not a medical measurement."],
  ["eyebrow", "text-eyebrow uppercase font-medium text-ink-muted", "Energy, Satiety and Mood"],
] as const;

function PreviewLabel({ children }: { children: ReactNode }) {
  return (
    <p className="mb-8 border-b border-line pb-3 text-small text-ink-faint">{children}</p>
  );
}

export default function ComponentPreviewPage() {
  if (!previewEnabled) notFound();

  return (
    <div className="bg-page pt-16 text-ink lg:pt-[72px]">
      <Section labelledBy="preview-title">
        <SectionHeading
          eyebrow="Website revamp · dev only"
          title="Component preview"
          size="title"
          as="h1"
          id="preview-title"
          lead="Every building block in direction D3, annotated plates. All values come from src/app/tokens.css."
        />
      </Section>

      <Section tone="surface" labelledBy="tokens">
        <div className="flex flex-col gap-12">
          <SectionHeading title="Tokens" size="title" id="tokens" />
          <div className="grid grid-cols-3 gap-4 sm:grid-cols-5 lg:grid-cols-7">
            {colours.map(([name, className]) => (
              <div key={name} className="flex flex-col gap-2">
                <div className={`h-16 rounded-2xl border border-line-strong ${className}`} />
                <span className="text-small text-ink-muted">{name}</span>
              </div>
            ))}
            <div className="flex flex-col gap-2">
              <div className="h-16 rounded-2xl bg-[image:var(--gradient-brand)]" />
              <span className="text-small text-ink-muted">gradient-brand</span>
            </div>
          </div>
          <div className="flex flex-col gap-6">
            {typeScale.map(([name, className, sample]) => (
              <div key={name} className="flex min-w-0 flex-col gap-1 border-t border-line pt-4">
                <span className="text-small text-ink-faint">text-{name}</span>
                <span className={`${className} min-w-0 break-words`}>{sample}</span>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Section labelledBy="hero-sample">
        <PreviewLabel>Hero (D3): headline first, supporting line and AppStoreCta beside it. The annotated cafe photo underneath comes with PRE-201</PreviewLabel>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-end lg:gap-12">
          <SectionHeading
            eyebrow="Your AI nutritionist"
            eyebrowTone="gradient"
            title="Eat well. Feel the difference."
            size="hero"
            as="h2"
            id="hero-sample"
          />
          <div className="flex flex-col gap-8">
            <p className="text-lead text-ink-secondary text-pretty">
              Tell PrepIt what you ate in your own words. See how it will shape your energy, hunger and mood, and know what to eat next.
            </p>
            <AppStoreCta
              trackingSource="dev-preview-hero"
              note={TRIAL_NOTE}
              qrCaption="Scan to get PrepIt on your iPhone"
            />
          </div>
        </div>
      </Section>

      <Section labelledBy="plans-sample">
        <PreviewLabel>Two-column section: FeatureSplit with DevicePair and Glow</PreviewLabel>
        <FeatureSplit
          media={
            <div className="relative py-6">
              <Glow />
              <DevicePair>
                <DeviceFrame
                  tilt={-4}
                  capture={groceryCapture}
                  className="[--device-w:260px] lg:[--device-w:300px]"
                />
                <DeviceFrame
                  tilt={4}
                  capture={recipeCapture}
                  className="hidden [--device-w:260px] sm:block lg:[--device-w:300px]"
                />
              </DevicePair>
            </div>
          }
        >
          <SectionHeading
            eyebrow="Meal plans"
            title="Plans that fit your week."
            id="plans-sample"
            lead="Ask for a plan in chat and get meals built around your goals, tastes and budget."
          />
        </FeatureSplit>
      </Section>

      <Section labelledBy="logging-sample">
        <div>
          <PreviewLabel>Chapter: FeatureSplit (reversed) with LoopVideo in a DeviceFrame</PreviewLabel>
          <FeatureSplit
            reverse
            media={
              <div className="relative py-6">
                <Glow />
                <DeviceFrame width={300} video={loopVideo} />
              </div>
            }
          >
            <SectionHeading
              eyebrow="Logging"
              title="Log a meal in seconds."
              id="logging-sample"
              lead="Type it, snap it or say it. PrepIt works out the calories and macros, and you can fix anything in one tap."
            />
          </FeatureSplit>
        </div>
      </Section>

      <Section
        tone="photo"
        labelledBy="photo-sample"
        photo={{
          src: "/dev-preview/photo-placeholder.webp",
          width: 1600,
          height: 900,
        }}
      >
        <div>
          <PreviewLabel>Section tone=&quot;photo&quot;: full-bleed photo (placeholder until PRE-199) with the dark gradient on the left</PreviewLabel>
          <SectionHeading
            eyebrow="Your Nutritionist"
            title="A nutritionist who knows your day."
            id="photo-sample"
            lead="Ask anything and get answers built on what you actually ate, any time of day."
          />
        </div>
      </Section>

      <Section labelledBy="annotation-sample">
        <div className="flex flex-col gap-stack">
          <PreviewLabel>AnnotatedPhoto (PRE-201): orange ring, line and white glass label, drawn in on first view. Desktop only</PreviewLabel>
          <h2 id="annotation-sample" className="sr-only">Annotated photo</h2>
          <AnnotatedPhoto
            photo={heroCafe.desktop}
            phonePhoto={heroCafe.mobile}
            annotations={heroCafe.annotations}
            className="aspect-[16/9] rounded-card"
          />
        </div>
      </Section>

      <PhotoBand
        labelledBy="band-sample"
        photo={plansKitchen.desktop}
        phonePhoto={plansKitchen.mobile}
        annotations={plansKitchen.annotations}
        textSide={plansKitchen.textSide}
        media={<DeviceFrame width={260} capture={groceryCapture} />}
      >
        <PreviewLabel>PhotoBand (PRE-201): full-bleed annotated photo, text on the photo&apos;s clear side, phones under it</PreviewLabel>
        <SectionHeading
          size="section"
          title="Ask for a week of meals."
          id="band-sample"
          lead="Your nutritionist plans around your goals, tastes and budget."
        />
      </PhotoBand>

      <Section labelledBy="points-sample">
        <div className="flex flex-col gap-stack">
          <PreviewLabel>PointList: columns, rows and stacked</PreviewLabel>
          <h2 id="points-sample" className="sr-only">Point lists</h2>
          <PointList
            layout="columns"
            points={[
              { title: "Energy", detail: "Steady energy and focus today.", accent: "var(--color-energy)" },
              { title: "Satiety", detail: "Staying in control around food.", accent: "var(--color-satiety)" },
              { title: "Mood", detail: "A calm, steady day.", accent: "var(--color-mood)" },
            ]}
          />
          <div className="grid gap-10 lg:grid-cols-2">
            <PointList
              layout="rows"
              points={[
                { title: "Type it", detail: "“chicken wrap and a flat white”" },
                { title: "Snap it", detail: "A photo of your plate" },
              ]}
            />
            <PointList
              points={[
                { title: "Checks in", detail: "Asks about a missed breakfast." },
                { title: "Spots patterns", detail: "Suggests an easy fix." },
              ]}
            />
          </div>
        </div>
      </Section>

      <Section labelledBy="bento-sample">
        <div className="flex flex-col gap-stack">
          <PreviewLabel>BentoGrid and BentoTile (large, medium, small)</PreviewLabel>
          <SectionHeading
            title="Everything in one place."
            id="bento-sample"
            lead="The small things that make it easy to keep going."
          />
          <BentoGrid>
            <BentoTile
              size="large"
              title="Home Screen widgets"
              media={<DeviceFrame width={260} capture={groceryCapture} />}
            >
              Add water, tick supplements and Log it or Skip planned meals without opening the app.
            </BentoTile>
            <BentoTile size="medium" title="Works offline">
              Log meals, water, supplements and weight with no signal. It all sends when you&apos;re back.
            </BentoTile>
            <BentoTile size="small" title="Achievements">
              Streaks and milestones that celebrate the habit.
            </BentoTile>
            <BentoTile size="small" title="Apple Health">
              Bring in your activity and weight.
            </BentoTile>
          </BentoGrid>
        </div>
      </Section>

      <Section tone="surface" labelledBy="quotes-sample">
        <div className="flex flex-col gap-stack">
          <PreviewLabel>QuoteCard (placeholder reviews)</PreviewLabel>
          <SectionHeading title="What people say" size="title" id="quotes-sample" />
          <div className="grid gap-4 md:grid-cols-3">
            <QuoteCard quote="[REVIEW 1]" name="[NAME]" stars={5} />
            <QuoteCard quote="[REVIEW 2]" name="[NAME]" stars={5} />
            <QuoteCard quote="[REVIEW 3]" name="[NAME]" stars={5} />
          </div>
        </div>
      </Section>

      <Section labelledBy="pricing-sample">
        <div className="flex flex-col items-center gap-stack">
          <PreviewLabel>PricingCard with the dark AppStoreCta</PreviewLabel>
          <SectionHeading
            title="One plan. Everything included."
            align="center"
            id="pricing-sample"
          />
          <PricingCard
            title="7 days free"
            price="Then $99.99 a year or $14.99 a month"
            priceNote="That's $1.92 a week. Cancel anytime in the App Store."
            features={[
              "Unlimited logging by text, photo and Siri",
              "Energy, Satiety and Mood every day",
              "Your Nutritionist, any time",
              "Meal plans and grocery lists",
              "Widgets and offline logging",
            ]}
            cta={
              <AppStoreCta
                trackingSource="dev-preview-pricing"
                label="Start your free trial"
              />
            }
          />
        </div>
      </Section>

      <Section labelledBy="cta-sample">
        <div>
          <PreviewLabel>CtaBand with AppStoreCta and QR (QR shows from 1024 px)</PreviewLabel>
          <CtaBand
            id="cta-sample"
            title="Start feeling the difference."
            line="Try your nutritionist free for 7 days."
            cta={
              <AppStoreCta
                trackingSource="dev-preview-final-cta"
                qrCaption="Scan with your iPhone camera"
              />
            }
          />
        </div>
      </Section>

      <Section tone="surface" labelledBy="frames-sample">
        <div className="flex flex-col gap-stack">
          <SectionHeading
            title="DeviceFrame sizes"
            size="title"
            id="frames-sample"
            lead="260 px (smallest), 320 px and 420 px with a real capture."
          />
          <div className="flex flex-wrap items-end justify-center gap-10">
            <DeviceFrame width={260} capture={recipeCapture} />
            <DeviceFrame width={320} capture={groceryCapture} />
            <DeviceFrame width={420} capture={recipeCapture} className="hidden md:block" />
          </div>
        </div>
      </Section>
    </div>
  );
}
