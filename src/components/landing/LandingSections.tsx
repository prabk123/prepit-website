import type { CSSProperties, ReactNode } from "react";
import LandingCta from "@/components/landing/LandingCta";
import Section from "@/components/ui/Section";
import SectionHeading from "@/components/ui/SectionHeading";
import type { WebMarket } from "@/lib/markets";
import { type Prices, TRIAL_DAYS } from "@/lib/pricing";

/**
 * The direct-sale landing page's sections (PRE-302), built to the landing
 * design on the site's tokens and components. Photos and the two composites
 * (a real screen placed in a generated photo) are exported from the design
 * into public/landing; app screens are real captures from the showcase
 * account.
 */

// ---------------------------------------------------------------- pieces

/** A design photo in public/landing, served as AVIF or WebP at the widths exported. */
function LandingPhoto({
  name,
  widths,
  sizes,
  alt,
  className,
  priority,
  style,
}: {
  name: string;
  widths: number[];
  sizes: string;
  alt: string;
  className?: string;
  priority?: boolean;
  style?: CSSProperties;
}) {
  const set = (ext: string) => widths.map((w) => `/landing/${name}-${w}.${ext} ${w}w`).join(", ");
  return (
    <picture>
      <source srcSet={set("avif")} sizes={sizes} type="image/avif" />
      <source srcSet={set("webp")} sizes={sizes} type="image/webp" />
      <img
        src={`/landing/${name}-${widths[widths.length - 1]}.webp`}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : undefined}
        decoding="async"
        className={className}
        style={style}
      />
    </picture>
  );
}

function Tick() {
  return (
    <svg viewBox="0 0 16 16" className="h-3 w-3" aria-hidden>
      <path d="M3 8.5l3 3 7-7" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Up to three short points, each with an orange tick and a bold lead-in. */
function Bullets({ items }: { items: [ReactNode, ReactNode][] }) {
  return (
    <ul className="grid gap-3">
      {items.map(([lead, rest], index) => (
        <li key={index} className="grid grid-cols-[22px_minmax(0,1fr)] items-start gap-3 text-ink-secondary">
          <span className="mt-px grid h-[22px] w-[22px] place-items-center rounded-full bg-accent text-on-accent">
            <Tick />
          </span>
          <span>
            <b className="font-bold text-ink">{lead}</b> {rest}
          </span>
        </li>
      ))}
    </ul>
  );
}

/** Copy that differs between web checkout and the App Store markets. */
export function landingCopy(market: WebMarket, prices: Prices) {
  const web = market === "web";
  return {
    web,
    reassure: web
      ? { strong: `${prices.free} today.`, rest: "Reminder email on day 4. Cancel before day 8 and you pay nothing." }
      : market === "app-store"
        ? { strong: `${TRIAL_DAYS} days free.`, rest: "Cancel in your iPhone's settings at least 24 hours before the trial ends and you pay nothing." }
        : { strong: "Not in your country yet.", rest: "Join the waitlist and we'll tell you when you can start." },
  };
}

// ---------------------------------------------------------------- 8. trust (dark band)

export function TrustSection({ market }: { market: WebMarket }) {
  return (
    <Section id="trust" tone="dark" labelledBy="trust-heading" analyticsName="trust">
      <LandingPhoto
        name="trust-band"
        widths={[768]}
        sizes="56vw"
        alt=""
        className="landing-trust-photo pointer-events-none absolute right-0 top-0 -z-10 h-[70%] w-full object-cover opacity-20 min-[1000px]:w-[56%] min-[1000px]:opacity-40"
      />
      <div className="flex max-w-[760px] flex-col gap-5">
        <SectionHeading
          id="trust-heading"
          eyebrow="Why you can trust it"
          eyebrowTone="gradient"
          size="section"
          title="Grounded in nutrition science."
          lead="Your targets, scores and advice draw on nutrition science and behaviour-change research, and every meal you describe shows where its numbers came from."
          className="[&>p:last-child]:max-w-[36em]"
        />
        <Bullets
          items={[
            ["Real sources", "for your food, with a confidence level on every meal you describe"],
            ["Medical questions go to a professional:", `${market === "web" ? "your doctor" : "your GP"}, a pharmacist or a registered dietitian`],
            ["You stay in control:", "nothing changes until you confirm"],
          ]}
        />
        <p className="mt-1.5 text-[13px] leading-normal text-ink-muted">
          <b className="font-bold text-ink-secondary">Research it draws on includes</b> Michie et al. (2009), effective
          techniques in healthy eating programmes, <i>Health Psychology</i>; Reynolds et al. (2019), carbohydrate quality
          and fibre, <i>The Lancet</i>; and the World Health Organization&apos;s guideline on sugars intake (2015).
          Nutrition guidance, not medical advice.
        </p>
      </div>
    </Section>
  );
}

// ---------------------------------------------------------------- 10. offer

const INCLUDED = [
  "Your 3-session nutrition consultation",
  "Ask Nutritionist, any time",
  "Energy, Satiety and Mood on every meal",
  "A check-in every week",
  "Meal plans and grocery lists",
  "Widgets and Apple Health",
];

/** `prices` are checkout's currency on the web, and the US App Store prices otherwise (PRE-373). */
export function OfferSection({ market, prices }: { market: WebMarket; prices: Prices }) {
  const web = market === "web";
  const timeline: [string, string, boolean?][] = [
    ["Today", web ? `Sign in, get the app and start Session 1. You pay ${prices.free}.` : "Get the app and start Session 1."],
    ["Around day 3", "Session 2: your first focus and two swaps."],
    ...(web ? ([["Day 4", "We email you a reminder, 4 days before any charge.", true]] as [string, string, boolean][]) : []),
    ["Around day 7", "Session 3: your week-in-review."],
  ];
  return (
    <Section id="pricing" labelledBy="price-heading" analyticsName="pricing" className="[&>div]:pt-0">
      <div className="grid items-start gap-x-16 gap-y-10 min-[920px]:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div>
          <SectionHeading
            id="price-heading"
            eyebrow="Everything included"
            eyebrowTone="gradient"
            title={`${TRIAL_DAYS} days free. Consultation included.`}
          />
          <p className="mt-5 text-body text-ink-secondary">Full access from the first minute. Here&apos;s what happens and when.</p>
          <ol className="mt-7 grid">
            {timeline.map(([when, what, remind]) => (
              <li key={when} className="grid gap-0.5 border-t border-line py-3.5 min-[401px]:grid-cols-[116px_minmax(0,1fr)] min-[401px]:gap-4">
                <b className="tabular-nums">{when}</b>
                <span className={remind ? "font-medium text-ink" : "text-ink-secondary"}>{what}</span>
              </li>
            ))}
          </ol>
        </div>
        <div className="grid gap-5 rounded-card border-t-4 border-t-accent bg-surface p-[clamp(22px,3vw,36px)] shadow-[0_40px_80px_-48px_rgb(26_26_46/0.35)]">
          <div>
            <p className="font-display text-[clamp(38px,30px+1.6vw,52px)] leading-none">{web ? `${prices.free} today` : `${TRIAL_DAYS} days free`}</p>
            <p className="mt-2 text-small text-ink-muted">Then, if you keep PrepIt:</p>
          </div>
          <div className="grid gap-2.5">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1 rounded-[18px] border-[1.5px] border-line px-4 py-3.5">
              <span className="font-bold">Yearly</span>
              {/* The yearly total is the big figure, the per-month one the note (PRE-357). */}
              <span className="text-right font-display text-[24px] leading-tight tabular-nums">
                {prices.annual}
                <small className="whitespace-nowrap font-sans text-small text-ink-muted"> a year</small>
              </span>
              <span className="text-small text-ink-secondary">Works out at {prices.annualPerMonth} a month</span>
              <span className="justify-self-end whitespace-nowrap rounded-full bg-accent px-2.5 py-0.5 text-[12px] font-bold text-on-accent">
                Save {prices.annualSavingPercent} vs monthly
              </span>
            </div>
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1 rounded-[18px] border-[1.5px] border-line px-4 py-3.5">
              <span className="font-bold">Monthly</span>
              <span className="text-right font-display text-[24px] leading-tight tabular-nums">
                {prices.monthly}
                <small className="whitespace-nowrap font-sans text-small text-ink-muted"> a month</small>
              </span>
              <span className="text-small text-ink-secondary">Billed monthly</span>
            </div>
          </div>
          <ul className="grid gap-x-[18px] gap-y-2.5 text-[15px] min-[521px]:grid-cols-2">
            {INCLUDED.map((item) => (
              <li key={item} className="grid grid-cols-[18px_minmax(0,1fr)] items-start gap-2.5">
                <svg viewBox="0 0 16 16" className="mt-0.5 h-[18px] w-[18px] text-accent" aria-hidden>
                  <path d="M3 8.5l3 3 7-7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <LandingCta market={market} placement="pricing" fullWidth />
          <p className="text-[13px] leading-normal text-ink-muted">
            {web
              ? `Renews automatically until you cancel. Cancel before day 8 and you pay nothing. Prices in ${prices.currencyName}. For iPhone.`
              : `Renews automatically until you cancel. Prices in ${prices.currencyName}; the App Store shows the price for your country. For iPhone.`}
          </p>
        </div>
      </div>
    </Section>
  );
}

// ---------------------------------------------------------------- 12. closing (dark band)

export function ClosingSection({ market, prices }: { market: WebMarket; prices: Prices }) {
  const web = market === "web";
  return (
    <Section id="start" tone="dark" labelledBy="close-heading" analyticsName="closing">
      <LandingPhoto name="closing-band" widths={[768]} sizes="100vw" alt="" className="absolute inset-0 -z-20 h-full w-full object-cover opacity-60" />
      <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,rgb(24_24_27/0.35),rgb(24_24_27/0.86))]" />
      <div className="flex flex-col items-center gap-5 text-center">
        <p className="text-eyebrow font-medium uppercase">
          <span className="text-gradient-brand">Your AI nutritionist</span>
        </p>
        <h2 id="close-heading" className="font-display text-chapter text-ink text-balance">
          Start eating healthier this week.
        </h2>
        <p className="text-lead text-ink-secondary">
          {TRIAL_DAYS} days free, with your nutrition consultation.{web ? ` ${prices.free} today.` : ""}
        </p>
        <LandingCta market={market} placement="closing" />
        <p className="max-w-[34em] text-small text-ink-muted">
          Then {prices.annual} a year (that works out at {prices.annualPerMonth} a month), or {prices.monthly} a month.
          {web ? " We email you a reminder on day 4." : ""} Prices in {prices.currencyName}.
        </p>
      </div>
    </Section>
  );
}
