import type { Metadata } from "next";
import type { ReactNode } from "react";
import FeatureTiles from "@/components/features/FeatureTiles";
import { heroPhoto } from "@/components/features/FeatureHeroStage";
import { CapturePicture, Lift, PhotoStage, TypedField } from "@/components/features/PhotoStage";
import SiteClosing from "@/components/features/SiteClosing";
import { V9Screen } from "@/components/landing/v9/V9Photo";
import { Chip, Eyebrow, Split, V9Section } from "@/components/landing/v9/V9Sections";
import { HideSiteFinalCta } from "@/components/pricing/SiteFinalCta";
import StartTrialCta from "@/components/ui/StartTrialCta";
import TextLink from "@/components/ui/TextLink";
import { missedBreakfast } from "@/content/nutritionistMessages";
import { FEATURE_SLUGS, FEATURES, STILL_WIDTHS, featureHref, type FeatureSlug } from "@/lib/features";
import { TRIAL_DAYS, WEB_REMINDER_EMAIL_LIVE } from "@/lib/pricing";
import { visitorOffer } from "@/lib/visitorOffer";

const title = "Features";
const description =
  "You say what you ate and PrepIt's nutritionist does the rest: it logs the meal, shows how it will make you feel, spots the pattern you'd miss and plans your week.";
const url = "https://www.tryprepit.app/features";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: url },
  // The preview image comes from ./opengraph-image.tsx.
  openGraph: { type: "website", url, title: `${title} | PrepIt`, description, siteName: "PrepIt", locale: "en_US" },
  twitter: { card: "summary_large_image", title: `${title} | PrepIt`, description },
};

type FeatureSection = {
  slug: FeatureSlug;
  title: string;
  lead: ReactNode;
  chips: string[];
  link: string;
  /** The still and its lifted cards; `flip` when the media sits on the left. */
  stage: (flip: boolean) => ReactNode;
};

/** One section per feature, in site order, from Charlie's copy deck (docs/copy/01-features.md). */
const SECTIONS: FeatureSection[] = [
  {
    slug: "ai-nutritionist",
    title: "It speaks up before you slip.",
    lead: "A 5-minute chat to learn your routine. Then it messages you when it spots something worth changing, one thing at a time.",
    chips: ["5-minute consultation", "1 focus each week", "A light touch"],
    link: "How your nutritionist works",
    stage: (flip) => (
      <PhotoStage
        flip={flip}
        photo={{ name: "one-change", widths: [560, 880], alt: "Seven plates of toast in rows, and only the last one has an egg on it" }}
      >
        <Lift tag="Breakfast time" style={{ right: 0, top: "34%", width: "68%" }}>
          <CapturePicture capture={missedBreakfast.capture} />
        </Lift>
      </PhotoStage>
    ),
  },
  {
    slug: "nutrition-signals",
    title: "Know by lunch how your afternoon will go.",
    lead: "Three scores from 0 to 100, worked out from your food alone. Tap one and it tells you why, in plain words.",
    chips: ["No wearable", "A reason with every score", "Updates as you log"],
    link: "How the scores work",
    stage: (flip) => (
      <PhotoStage
        flip={flip}
        photo={heroPhoto("nutrition-signals")}
      >
        <Lift style={{ left: 0, top: "16%", width: "72%" }}>
          <V9Screen name="see-rings" width={741} height={337} alt="Energy 84, Satiety 96 and Mood 87" />
        </Lift>
        <Lift tag="Energy +34" style={{ right: "2%", bottom: "10%", width: "70%" }}>
          <V9Screen name="see-why-energy-oats" width={740} height={293} alt="Energy +34: morning protein provides a steady power supply to your day" />
        </Lift>
      </PhotoStage>
    ),
  },
  {
    slug: "meal-plans",
    title: "Next week's meals, sorted in one chat.",
    lead: "Say which days, your budget and what you'd rather skip. It plans meals around your goals, then builds the shopping list by aisle.",
    chips: ["Up to 7 days", "Cost estimate", "“Swap Thursday's dinner”"],
    link: "How meal plans work",
    stage: (flip) => (
      <PhotoStage
        flip={flip}
        photo={heroPhoto("meal-plans")}
      >
        <Lift style={{ right: 0, top: "22%", width: "50%" }}>
          <V9Screen name="ui-grocery" width={764} height={951} alt="A grocery list grouped by aisle: bakery, dairy and alternatives, fresh produce" />
        </Lift>
      </PhotoStage>
    ),
  },
  {
    slug: "logging",
    title: "Type it like you'd text a friend.",
    lead: "“Chicken wrap, an apple and a flat white” is enough. Or say it, or snap your plate. It's on your log straight away.",
    chips: ["Type, talk or snap", "No database to search", "Edit anything"],
    link: "How logging works",
    stage: (flip) => (
      <PhotoStage
        flip={flip}
        photo={heroPhoto("logging")}
      >
        <Lift style={{ left: 0, top: "20%", width: "74%" }}>
          <TypedField text="chicken wrap with hummus and salad" />
        </Lift>
        <Lift style={{ right: "3%", top: "42%", width: "70%" }}>
          <V9Screen name="say-row-wrap" width={626} height={247} alt="The wrap on the log with its calories, macros and score changes" />
        </Lift>
      </PhotoStage>
    ),
  },
  {
    slug: "widgets-and-siri",
    title: "Log lunch without opening the app.",
    lead: "Say “Hey Siri, log a meal in PrepIt”, press the Action button or tap a widget. Your scores sit on your Home Screen.",
    chips: ["Siri and Shortcuts", "Action button", "Lock Screen"],
    link: "How widgets and Siri work",
    stage: (flip) => (
      <PhotoStage
        flip={flip}
        photo={heroPhoto("widgets-and-siri")}
      >
        <Lift style={{ right: 0, top: "28%", width: "44%" }}>
          <V9Screen name="widget-signals-light" width={474} height={474} alt="The Energy, Satiety and Mood widget" />
        </Lift>
      </PhotoStage>
    ),
  },
];

/** "What it won't do.": the doubts this page raises, answered. */
const WONT = [
  ["Send you hunting.", "No food database to search and no barcode to find. Just say what you ate."],
  ["Tell you off.", "No cheat days, no bad foods. One small change at a time, and you pick it."],
  ["Need a gadget.", "No ring, no watch, no glucose monitor. Everything starts from your food."],
  ["Play doctor.", "A coach, not a doctor. For anything medical it points you to your GP, a pharmacist or a dietitian."],
];

/**
 * The Features overview (PRE-307, redrawn in PRE-450 from Charlie's site
 * pages handoff): a still with real app cards in the hero, a row of five
 * photo tiles, one section per feature on alternating cream and band, what
 * it won't do, then the homepage's own close. Every button starts the web
 * trial in the `site` funnel.
 */
export default async function FeaturesPage() {
  const { market, prices } = await visitorOffer();
  const web = market === "web";
  return (
    <>
      <HideSiteFinalCta />
      <section aria-labelledby="features-heading" className="w-full bg-page text-ink">
        <div className="mx-auto w-full max-w-content px-gutter pb-section pt-[clamp(28px,4vw,56px)]">
          <Split
            text={
              <>
                <Eyebrow>Features</Eyebrow>
                <h1 id="features-heading" className="font-display text-hero text-ink text-balance">
                  You say what you ate. It does <span className="landing-underline">the rest.</span>
                </h1>
                <p className="max-w-[34em] text-lead text-ink-secondary text-pretty">
                  It logs the meal, tells you how it will make you feel, spots the pattern you&apos;d miss and plans your week.
                  Every change it suggests waits for your yes.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Chip>{web ? `${TRIAL_DAYS} days free · ${prices.free} today` : `${TRIAL_DAYS} days free`}</Chip>
                  <Chip>iPhone</Chip>
                </div>
                <StartTrialCta
                  placement="features-index-hero"
                  note={`${web && WEB_REMINDER_EMAIL_LIVE ? "Reminder email on day 4. " : ""}Cancel before day ${TRIAL_DAYS + 1}, pay nothing.`}
                />
              </>
            }
            media={
              <PhotoStage
                size="hero"
                priority
                photo={{
                  name: "meal-column",
                  widths: STILL_WIDTHS,
                  alt: "A column of everyday meals on cream: oats, coffee, yogurt, a wrap and a salmon bowl",
                }}
              >
                <Lift style={{ left: "-2%", top: "9%", width: "62%" }} className="min-[900px]:!left-0">
                  <TypedField text="chicken wrap with hummus and salad" />
                </Lift>
                <Lift style={{ right: "-2%", top: "40%", width: "62%" }} className="min-[900px]:!-right-[3%]">
                  <V9Screen
                    priority
                    name="say-row-wrap"
                    width={626}
                    height={247}
                    alt="Logged at 12:30 PM: chicken wrap with hummus and salad, with its calories, macros and how it moved Energy, Satiety and Mood"
                  />
                </Lift>
                <Lift style={{ left: "4%", bottom: "6%", width: "58%" }}>
                  <V9Screen name="see-rings" width={741} height={337} priority alt="Energy 84, Satiety 96 and Mood 87, all green" />
                </Lift>
              </PhotoStage>
            }
          />
        </div>
      </section>

      <section aria-labelledby="five-heading" className="w-full bg-page text-ink">
        <div className="mx-auto flex w-full max-w-content flex-col gap-8 px-gutter pb-section">
          <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
            <h2 id="five-heading" className="font-display text-section text-ink text-balance">
              Five things it does for you.
            </h2>
            <p className="text-small text-ink-muted">Tap one for the full story.</p>
          </div>
          <FeatureTiles slugs={FEATURE_SLUGS} layout="row" />
        </div>
      </section>

      {SECTIONS.map((section, index) => {
        const flip = index % 2 === 1;
        const headingId = `${section.slug}-heading`;
        return (
          <V9Section key={section.slug} id={section.slug} name={section.slug} labelledBy={headingId} band={!flip}>
            <Split
              reverse={flip}
              text={
                <>
                  <Eyebrow>{FEATURES[section.slug].name}</Eyebrow>
                  <h2 id={headingId} className="font-display text-chapter text-ink text-balance">
                    {section.title}
                  </h2>
                  <p className="max-w-[34em] text-lead text-ink-secondary text-pretty">{section.lead}</p>
                  <div className="flex flex-wrap gap-2">
                    {section.chips.map((chip) => (
                      <Chip key={chip}>{chip}</Chip>
                    ))}
                  </div>
                  <TextLink href={featureHref(section.slug)}>{section.link}</TextLink>
                </>
              }
              media={section.stage(flip)}
            />
          </V9Section>
        );
      })}

      <V9Section id="wont" name="wont" labelledBy="wont-heading">
        <div className="flex flex-col gap-8">
          <h2 id="wont-heading" className="font-display text-section text-ink text-balance">
            What it won&apos;t do.
          </h2>
          <ul className="grid border-t border-line-strong min-[521px]:grid-cols-2 min-[901px]:grid-cols-4">
            {WONT.map(([heading, body]) => (
              <li
                key={heading}
                className="border-b border-line py-5 pr-3.5 min-[901px]:border-b-0 min-[901px]:border-r min-[901px]:px-[22px] min-[901px]:pb-1.5 min-[901px]:first:pl-0 min-[901px]:last:border-r-0"
              >
                <h3 className="mb-2.5 font-display text-[22px] font-medium leading-tight text-ink">{heading}</h3>
                <p className="text-[15.5px] text-ink-secondary">{body}</p>
              </li>
            ))}
          </ul>
        </div>
      </V9Section>

      <SiteClosing market={market} prices={prices} placement="features-index-closing" />
    </>
  );
}
