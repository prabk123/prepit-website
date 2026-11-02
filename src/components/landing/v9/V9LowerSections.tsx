import Link from "next/link";
import type { ReactNode } from "react";
import LandingCta, { LandingQuizLink } from "@/components/landing/LandingCta";
import Reveal from "@/components/landing/v9/Reveal";
import { V9Screen } from "@/components/landing/v9/V9Photo";
import { Eyebrow, Glass, Head, V9Section } from "@/components/landing/v9/V9Sections";
import FaqAccordion from "@/components/pricing/FaqAccordion";
import LongLogo from "@/components/ui/LongLogo";
import { FooterWithdrawalLink } from "@/components/withdrawal/WithdrawalLink";
import { faqPageJsonLd, LANDING_APP_STORE_FAQ_ITEMS, landingWebFaqItems } from "@/lib/faq";
import type { WebMarket } from "@/lib/markets";
import { type Prices, TRIAL_DAYS } from "@/lib/pricing";

/**
 * Landing v9 on /try, part 2 (PRE-433): why you can trust it, the offer, the
 * FAQ, the close and the footer, from the handoff's docs/landing-copy.md
 * (science section S3b, close K3). Built from the part 1 pieces in
 * V9Sections, on the same cream tokens.
 *
 * Prices come from the visitor's market (lib/markets, lib/pricing,
 * webBillingSellerFor), and the yearly total is always the bigger or first
 * figure (PRE-357).
 */

/** "Then $99.99 a year ($8.33 a month), or $14.99 a month." */
function thenPrices(prices: Prices) {
  return `Then ${prices.annual} a year (${prices.annualPerMonth} a month), or ${prices.monthly} a month.`;
}

// ---------------------------------------------------------------- 10. why you can trust it

function StepNumber({ n }: { n: number }) {
  return (
    <span aria-hidden className="grid h-6 w-6 flex-none place-items-center rounded-full bg-primary text-[12px] font-bold text-on-primary">
      {n}
    </span>
  );
}

function Step({ n, title, children, delay }: { n: number; title: string; children: ReactNode; delay: number }) {
  return (
    <li className="min-w-0">
      <Reveal delay={delay} className="grid grid-cols-[24px_minmax(0,1fr)] gap-x-4 gap-y-3">
        <StepNumber n={n} />
        <h3 className="font-display text-[22px] leading-[1.1] text-ink">
          <span className="sr-only">{n}. </span>
          {title}
        </h3>
        <div className="col-start-2 min-w-0">{children}</div>
      </Reveal>
    </li>
  );
}

const SCIENCE_POINTS: [string, string][] = [
  ["Food data from official sources.", "Brand labels and government food databases come first. Calories are checked against protein, carbs and fat."],
  ["Targets from a published formula.", "Your calories start from the Mifflin-St Jeor equation and how active you are. Protein is set by your body weight."],
  ["Scores from nutrition research.", "Energy, Satiety and Mood weigh your protein, fibre, sugar, fruit and veg, and processed food."],
  ["Coaching from behaviour science.", "Log, get feedback, pick one focus, review it weekly: the mix research links to better results."],
];

/** Text only: no organisation's logo may be used here (handoff docs/notes/science-claims.md). */
const DRAWS_ON: { id: string; name: ReactNode; shapes: string }[] = [
  { id: "usda", name: "USDA FoodData Central", shapes: "Food data" },
  { id: "cofid", name: "UK CoFID", shapes: "Food data" },
  { id: "mifflin", name: "Mifflin-St Jeor equation", shapes: "Targets" },
  { id: "who", name: "WHO sugars guideline", shapes: "Scores" },
  { id: "lancet", name: <i>The Lancet</i>, shapes: "Scores" },
  { id: "health-psychology", name: <i>Health Psychology</i>, shapes: "Coaching" },
];

export function TrustSection() {
  return (
    <V9Section id="trust" name="trust" labelledBy="trust-heading" band>
      <div className="grid items-start gap-x-16 gap-y-10 min-[900px]:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <div className="min-[900px]:sticky min-[900px]:top-28">
          <Head
            id="trust-heading"
            label="Why you can trust it"
            title="Grounded in nutrition science."
            lead="Scores weigh protein, fibre, sugar and how processed your food is."
          />
        </div>

        <div className="flex min-w-0 flex-col gap-12">
          <Reveal className="flex items-center gap-4">
            <Glass className="w-[92px] flex-none">
              <V9Screen name="say-snap-burrito" width={414} height={544} alt="A photo of a chicken burrito bowl." />
            </Glass>
            <p className="flex flex-col gap-1">
              <b className="font-display text-[22px] font-medium leading-tight text-ink">One photo.</b>
              <span className="text-body text-ink-secondary">“homemade, about 400 g”</span>
            </p>
          </Reveal>

          <ol className="grid gap-x-8 gap-y-10 min-[640px]:grid-cols-2">
            <Step n={1} title="Looks it up" delay={0}>
              <ol aria-label="Where it looks, in order" className="flex flex-col items-start gap-2 text-small">
                <li className="rounded-[12px] bg-primary px-4 py-2.5 font-medium text-on-primary">Brand sites and government food data</li>
                <li className="rounded-[12px] bg-surface px-4 py-2.5 text-ink ring-1 ring-line">Nutrition sites</li>
                <li className="rounded-[12px] border border-dashed border-line-strong px-4 py-2.5 text-ink-muted">Recipe sites, last</li>
              </ol>
            </Step>
            <Step n={2} title="Itemises it" delay={90}>
              <Glass className="w-[min(100%,340px)]">
                <V9Screen
                  name="sci-meal-items"
                  width={752}
                  height={668}
                  alt="Meal items: grilled chicken breast 180 cal, white rice 156 cal, black beans 106 cal, guacamole 80 cal, pico de gallo 8 cal, each with carbs, protein and fat."
                />
              </Glass>
            </Step>
            <Step n={3} title="Checks the maths" delay={0}>
              <p className="flex flex-col gap-2">
                <span className="text-body text-ink-secondary">4 × 59 g carbs + 4 × 50 g protein + 9 × 11 g fat</span>
                <b className="font-display text-[clamp(44px,36px+1.6vw,56px)] font-medium leading-none tabular-nums text-ink">535 kcal</b>
                <span className="text-body text-ink-secondary">against 529 logged. It adds up.</span>
              </p>
            </Step>
            <Step n={4} title="Tells you straight" delay={90}>
              <Glass className="w-[min(100%,340px)]">
                <V9Screen
                  name="sci-satiety"
                  width={748}
                  height={338}
                  alt="Satiety, down 1: You can build more lasting fullness by increasing the portion of black beans. Adding a side of steamed broccoli or extra peppers would help too."
                />
              </Glass>
            </Step>
          </ol>

          <ul className="grid gap-x-8 min-[640px]:grid-cols-2">
            {SCIENCE_POINTS.map(([lead, rest]) => (
              <li key={lead} className="flex flex-col gap-1.5 border-t border-line-strong py-5">
                <b className="font-display text-[20px] font-medium leading-tight text-ink">{lead}</b>
                <span className="text-body text-ink-secondary text-pretty">{rest}</span>
              </li>
            ))}
          </ul>

          <div className="flex flex-col gap-4">
            <p className="inline-flex items-center gap-2 text-[12px] font-bold uppercase leading-none tracking-[0.12em] text-ink">
              <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-ink" />
              Draws on
            </p>
            <ul className="grid grid-cols-2 border-t border-line-strong min-[640px]:grid-cols-3">
              {DRAWS_ON.map((item) => (
                <li key={item.id} className="flex flex-col gap-1.5 border-b border-line py-4 pr-4">
                  <span className="font-display text-[20px] leading-tight text-ink">{item.name}</span>
                  <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-ink-muted">{item.shapes}</span>
                </li>
              ))}
            </ul>
            <p className="text-[13px] leading-normal text-ink-muted">
              Named for reference. None of these organisations or journals endorses PrepIt.
            </p>
          </div>
        </div>
      </div>
    </V9Section>
  );
}

// ---------------------------------------------------------------- 11. offer

const INCLUDED = [
  "3-session nutrition consultation",
  "Ask Nutritionist, any time",
  "Energy, Satiety and Mood",
  "Meal plans and groceries",
  "Weekly Check-ins",
  "Widgets and Apple Health",
];

/**
 * `prices` are checkout's currency on the web, and the US App Store prices
 * otherwise (PRE-373). The day 4 reminder email is a web promise (PRE-352):
 * App Store trials don't get it, so their timeline leaves it out.
 */
export function OfferSection({ market, prices }: { market: WebMarket; prices: Prices }) {
  const web = market === "web";
  const timeline: { when: string; title: string; what: string }[] = [
    { when: "Today", title: "Getting to know you", what: `Session 1, about 5 minutes.${web ? ` ${prices.free}.` : ""}` },
    { when: "After 3 days", title: "What I've noticed so far", what: "1 focus, 2 swaps. Plan my week." },
    ...(web ? [{ when: "Day 4", title: "Reminder email", what: "4 days before any charge." }] : []),
    { when: "Around day 7", title: "Week-in-review", what: "Session 3, your first check-in." },
  ];
  return (
    <V9Section id="pricing" name="pricing" labelledBy="price-heading">
      <div className="grid items-start gap-x-16 gap-y-10 min-[900px]:grid-cols-[minmax(0,6fr)_minmax(0,5fr)]">
        <div className="flex min-w-0 flex-col gap-8">
          <Head
            id="price-heading"
            label={web ? `${TRIAL_DAYS} days free · ${prices.free} today` : `${TRIAL_DAYS} days free`}
            title="Pay nothing unless you keep it."
            lead="3 sessions, your first check-in and a plan if you want one. Then decide."
          />
          <ol className="grid border-t-2 border-ink">
            {timeline.map((row) => (
              <li key={row.when} className="grid gap-1 border-b border-line py-4 min-[401px]:grid-cols-[120px_minmax(0,1fr)] min-[401px]:gap-4">
                <span className="pt-0.5 text-[12px] font-bold uppercase leading-snug tracking-[0.06em] text-ink">{row.when}</span>
                <span className="text-body text-ink-secondary">
                  <b className="block font-bold text-ink">{row.title}</b>
                  {row.what}
                </span>
              </li>
            ))}
          </ol>
        </div>

        <Reveal className="grid gap-5 rounded-[26px] bg-surface p-6 shadow-[var(--shadow-v9-card)] ring-1 ring-black/5 min-[900px]:p-9">
          <p className="font-display text-[clamp(44px,36px+1.6vw,56px)] font-medium leading-none tracking-[-0.02em] text-ink">
            {web ? `${prices.free} today` : `${TRIAL_DAYS} days free`}
          </p>
          {/* The amount charged comes first and largest (PRE-357). */}
          <p className="text-body text-ink-secondary">
            Then <b className="text-ink">{prices.annual} a year</b>, which works out at {prices.annualPerMonth} a month. Or{" "}
            <b className="text-ink">{prices.monthly} a month</b>.
          </p>
          <span className="w-fit rounded-full bg-primary px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.08em] text-on-primary">
            Save {prices.annualSavingPercent} vs monthly
          </span>
          <ul className="grid gap-2.5 border-t border-line pt-5 text-body text-ink-secondary">
            {INCLUDED.map((item) => (
              <li key={item} className="flex items-center gap-3">
                <span aria-hidden className="h-1.5 w-1.5 flex-none rounded-full bg-accent" />
                {item}
              </li>
            ))}
          </ul>
          <LandingCta market={market} placement="pricing" fullWidth />
          <p className="text-[13px] leading-normal text-ink-muted">
            {web
              ? `Renews automatically until you cancel. Cancel before day 8 and you pay nothing. Prices in ${prices.currencyName}. For iPhone.`
              : `Renews automatically until you cancel. Prices in ${prices.currencyName}; the App Store shows the price for your country. For iPhone.`}
          </p>
        </Reveal>
      </div>
    </V9Section>
  );
}

// ---------------------------------------------------------------- 12. FAQ

/** Opens are `faq_question_opened` with source `landing-faq`, as before. */
export function FaqSection({ market, prices }: { market: WebMarket; prices: Prices }) {
  const items = market === "web" ? landingWebFaqItems(prices) : LANDING_APP_STORE_FAQ_ITEMS;
  return (
    <V9Section id="faq" name="faq" labelledBy="faq-heading" className="[&>div]:pt-0">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPageJsonLd(items)).replace(/</g, "\\u003c") }}
      />
      <div className="grid items-start gap-x-16 gap-y-8 min-[900px]:grid-cols-[minmax(0,4fr)_minmax(0,7fr)]">
        <div className="flex flex-col gap-4">
          <Eyebrow>FAQ</Eyebrow>
          <h2 id="faq-heading" className="font-display text-chapter text-ink text-balance">
            The small print, in big print.
          </h2>
        </div>
        <FaqAccordion items={items} trackingSource="landing-faq" singleColumn />
      </div>
    </V9Section>
  );
}

// ---------------------------------------------------------------- 13. close (K3)

/**
 * "Start with 5 minutes." The Session 1 card is a picture of the app's first
 * question, not a control. `showQuizLink` is the later test arm (decision D4):
 * off at launch, ready as `data-cta="closing_quiz"`.
 */
export function ClosingSection({ market, prices, showQuizLink = false }: { market: WebMarket; prices: Prices; showQuizLink?: boolean }) {
  const web = market === "web";
  return (
    <V9Section id="start" name="closing" labelledBy="close-heading" band>
      <div className="flex flex-col items-center gap-6 text-center">
        <p className="text-[12px] font-bold uppercase leading-none tracking-[0.12em]">
          <span className="text-gradient-brand">Your AI nutritionist</span>
        </p>
        <h2 id="close-heading" className="font-display text-chapter text-ink text-balance">
          Start with 5 minutes.
        </h2>
        <Reveal className="relative my-2 w-full max-w-[460px]">
          <span
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-1/2 -z-0 h-[180%] w-[220%] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(closest-side,rgb(255_255_255/0.75),rgb(255_255_255/0))]"
          />
          <div className="relative flex flex-col gap-3 rounded-[22px] bg-surface/90 p-6 text-left shadow-[var(--shadow-v9-card)] ring-1 ring-black/5">
            <p className="text-[11px] font-bold uppercase leading-none tracking-[0.1em] text-ink-secondary">Session 1 · Getting to know you</p>
            <p className="text-body text-ink-secondary">A short chat about your routine and goals.</p>
            <p className="font-display text-[clamp(40px,34px+1.2vw,48px)] font-medium leading-none text-ink">Ready?</p>
            <p className="sr-only">Your first replies to choose from: Let&apos;s do it, or What happens in a consultation?</p>
            <p aria-hidden className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-ink px-3.5 py-2 text-small font-medium leading-none text-ink">
                <span className="h-1.5 w-1.5 rounded-full bg-ink" />
                Let&apos;s do it
              </span>
              <span className="inline-flex items-center rounded-full border border-line-strong px-3.5 py-2 text-small font-medium leading-none text-ink">
                What happens in a consultation?
              </span>
            </p>
          </div>
        </Reveal>
        <p className="text-lead text-ink-secondary">{web ? `${TRIAL_DAYS} days free · ${prices.free} today` : `${TRIAL_DAYS} days free`}</p>
        <LandingCta market={market} placement="closing" className="max-[599px]:w-full max-[599px]:justify-center" />
        {showQuizLink && <LandingQuizLink market={market} />}
        <p className="max-w-[40em] text-[13px] leading-normal text-ink-muted">
          {thenPrices(prices)}
          {web ? " Reminder email on day 4." : " The App Store shows the price for your country."} Prices in {prices.currencyName}.
        </p>
      </div>
    </V9Section>
  );
}

// ---------------------------------------------------------------- footer

const FOOTER_LINKS = [
  { href: "/privacy-policy", label: "Privacy" },
  { href: "/terms-and-conditions", label: "Terms" },
  { href: "/subscription-policy", label: "Subscription terms" },
  { href: "/cookie-policy", label: "Cookies" },
  { href: "/guides", label: "Help" },
  { href: "/contact", label: "Contact" },
];

const footerLinkClass = "flex min-h-11 items-center text-small text-ink-secondary transition-colors hover:text-ink hover:underline hover:underline-offset-4 min-[900px]:min-h-0";

/**
 * The landing's short footer, in place of the site footer on /try
 * (landing-v9.css hides that one). The withdrawal link stays for UK and EEA
 * visitors (PRE-360), as in the site footer.
 */
export function V9Footer() {
  return (
    <footer className="v9-band w-full border-t border-line text-ink">
      <div className="mx-auto flex w-full max-w-content flex-col gap-6 px-gutter pb-[calc(96px+env(safe-area-inset-bottom,0px))] pt-12 min-[761px]:pb-16">
        <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-4">
          <Link href="/" className="flex h-11 w-fit items-center" aria-label="PrepIt home">
            <LongLogo className="h-6 w-auto text-primary" />
          </Link>
          <nav aria-label="Footer" className="flex flex-wrap gap-x-6">
            {FOOTER_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className={footerLinkClass}>
                {link.label}
              </Link>
            ))}
            <FooterWithdrawalLink className={footerLinkClass} />
          </nav>
        </div>
        <p className="max-w-[60em] text-[13px] leading-normal text-ink-muted">
          PrepIt is a coach, not a doctor: general nutrition guidance, not medical advice. Scores and costs are estimates. App
          screens are real, from an example account. Photos are illustrative, and some are AI-generated. iPhone only for now;
          Android is coming. © {new Date().getFullYear()} PrepIt.
        </p>
      </div>
    </footer>
  );
}
