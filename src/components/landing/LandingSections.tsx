import type { CSSProperties, ReactNode } from "react";
import DeviceFrame from "@/components/device/DeviceFrame";
import LandingCta from "@/components/landing/LandingCta";
import Section from "@/components/ui/Section";
import SectionHeading from "@/components/ui/SectionHeading";
import { appVideo } from "@/lib/captures";
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

/** "After a few weeks": when a screen appears, so a new user knows what to expect. */
function WhenPill({ children }: { children: ReactNode }) {
  return (
    <span className="whitespace-nowrap rounded-full bg-accent px-2.5 py-0.5 text-[12px] font-bold uppercase tracking-[0.04em] text-on-accent">
      {children}
    </span>
  );
}

function MediaTag({ children }: { children: ReactNode }) {
  return (
    <p className="flex flex-wrap items-center gap-x-2 gap-y-1.5 text-[12px] font-bold uppercase tracking-[0.06em] text-ink-muted">
      {children}
    </p>
  );
}

function Caption({ children }: { children: ReactNode }) {
  return <figcaption className="text-[13px] leading-snug text-ink-muted">{children}</figcaption>;
}

/** A real screen as a floating white card, labelled with what it shows. */
function ScreenCard({
  tag,
  children,
  className,
}: {
  tag: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-[20px] bg-surface p-[5px] shadow-[0_24px_48px_-26px_rgb(26_26_46/0.42),0_4px_14px_-6px_rgb(26_26_46/0.14)] ${className ?? ""}`}>
      <p className="flex flex-wrap items-center gap-x-2 gap-y-1.5 px-2 pb-[7px] pt-[5px] text-[12px] font-bold uppercase leading-tight tracking-[0.06em] text-ink-muted">
        {tag}
      </p>
      {children}
    </div>
  );
}

/** A crop of a tall capture: `top` is where the crop starts, as a share of the capture's width. */
function ScreenCrop({ src, alt, width, height, ratio, top }: { src: string; alt: string; width: number; height: number; ratio: string; top: number }) {
  return (
    <div className="relative overflow-hidden rounded-[15px] bg-surface-raised" style={{ aspectRatio: ratio }}>
      {/* A capture already exported at its display size, as the other app captures are. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} width={width} height={height} loading="lazy" decoding="async" className="h-auto w-full" style={{ marginTop: `${-top * 100}%` }} />
    </div>
  );
}

/** Text beside media, stacking text first below 900 px. `reverse` puts the media on the left. */
function Split({ children, media, reverse }: { children: ReactNode; media: ReactNode; reverse?: boolean }) {
  return (
    <div className="grid items-center gap-x-[72px] gap-y-12 min-[900px]:grid-cols-2">
      <div className={`flex min-w-0 flex-col gap-5 ${reverse ? "min-[900px]:order-2" : ""}`}>{children}</div>
      <div className="min-w-0">{media}</div>
    </div>
  );
}

function Heading({ eyebrow, title, id }: { eyebrow: string; title: string; id: string }) {
  return <SectionHeading id={id} eyebrow={eyebrow} eyebrowTone="gradient" size="section" title={title} />;
}

function Body({ children }: { children: ReactNode }) {
  return <p className="max-w-[36em] text-body text-ink-secondary text-pretty">{children}</p>;
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

// ---------------------------------------------------------------- 1. hero

function PhoneIcon() {
  return (
    <svg viewBox="0 0 16 16" className="h-4 w-4 shrink-0" aria-hidden>
      <rect x="4" y="1.5" width="8" height="13" rx="2" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <path d="M7 12.5h2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}
function HeartIcon() {
  return (
    <svg viewBox="0 0 16 16" className="h-4 w-4 shrink-0" aria-hidden>
      <path d="M8 13.5S2 10 2 5.8A3.1 3.1 0 0 1 8 4.2a3.1 3.1 0 0 1 6 1.6C14 10 8 13.5 8 13.5Z" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  );
}
function LockIcon() {
  return (
    <svg viewBox="0 0 16 16" className="h-4 w-4 shrink-0" aria-hidden>
      <rect x="3" y="7" width="10" height="7.5" rx="1.6" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2" fill="none" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

const SESSIONS = ["Getting to know you", "What I've noticed so far", "Week-in-review"];

export function LandingHero({ market, prices }: { market: WebMarket; prices: Prices }) {
  const { reassure } = landingCopy(market, prices);
  return (
    <section
      id="hero"
      aria-labelledby="hero-heading"
      data-section-name="hero"
      className="landing-hero relative isolate flex w-full flex-col overflow-hidden bg-page pt-16 text-ink xl:block"
    >
      <div className="relative z-[2] mx-auto flex w-full max-w-content px-gutter pb-7 pt-7 xl:min-h-[clamp(660px,54vw,820px)] xl:items-center xl:pb-[72px] xl:pt-10">
        <div className="flex max-w-[640px] flex-col gap-[22px] xl:max-w-[min(540px,44vw)]">
          <p className="text-eyebrow font-medium uppercase">
            <span className="text-gradient-brand">Your AI nutritionist</span>
          </p>
          <h1 id="hero-heading" className="font-display text-hero text-ink text-balance">
            Eat healthier, <em className="landing-underline not-italic">one change at a time.</em>
          </h1>
          <p className="max-w-[36em] text-lead text-ink-secondary text-pretty">
            Tell your nutritionist what you eat in a sentence, a voice note or a photo. It finds the one thing to change
            first, and plans your week around food you like, shopping list included.
          </p>
          <div
            role="group"
            aria-label="Included in your free week"
            className="grid w-fit max-w-full gap-2.5 rounded-[20px] border border-line bg-surface px-3.5 pb-3.5 pt-3"
          >
            <p className="flex flex-wrap items-center gap-x-2.5 gap-y-2 text-[15px] font-bold leading-tight text-ink">
              <span className="whitespace-nowrap rounded-full bg-ink px-2.5 py-[5px] text-[12px] uppercase tracking-[0.06em] text-on-primary">
                {TRIAL_DAYS} days free
              </span>
              Your nutrition consultation is included
            </p>
            <ol aria-label="The three sessions" className="flex flex-wrap gap-x-4 gap-y-1.5 text-small text-ink-secondary">
              {SESSIONS.map((session, index) => (
                <li key={session} className="inline-flex items-center gap-[7px]">
                  <b className="grid h-5 w-5 flex-none place-items-center rounded-full bg-surface-raised text-[12px] tabular-nums text-accent-text">
                    {index + 1}
                  </b>
                  {session}
                </li>
              ))}
            </ol>
          </div>
          <LandingCta market={market} placement="hero" className="w-fit" />
          <p className="text-[15px] text-ink-secondary">
            <strong className="text-ink">{reassure.strong}</strong> {reassure.rest}
          </p>
          <div className="flex flex-wrap gap-x-[18px] gap-y-2 text-small text-ink-muted">
            <span className="inline-flex items-center gap-[7px]"><PhoneIcon />For iPhone</span>
            <span className="inline-flex items-center gap-[7px]"><HeartIcon />Works with Apple Health</span>
            <span className="inline-flex items-center gap-[7px]"><LockIcon />We never sell your data</span>
          </div>
        </div>
      </div>

      {/* The photo fills the hero from 1280 px, with the copy over its washed-out left side; below that it follows the copy. */}
      <div className="landing-hero-media relative aspect-[16/11] w-full overflow-hidden max-[600px]:aspect-[4/5] max-[600px]:max-h-[640px] xl:absolute xl:inset-0 xl:aspect-auto">
        <LandingPhoto
          name="hero-breakfast"
          widths={[960, 1600, 2400]}
          sizes="100vw"
          priority
          alt="A bowl of overnight oats with sliced apple, a glass of water and a coffee on a light kitchen table by the window."
          className="h-full w-full object-cover [object-position:86%_60%] xl:[object-position:62%_60%]"
        />
        <div className="absolute bottom-[4%] left-[5%] z-[3] xl:bottom-auto xl:left-[49%] xl:top-1/2 xl:-translate-y-1/2">
          <DeviceFrame
            priority
            className="[--device-w:clamp(148px,26vw,220px)] xl:[--device-w:clamp(200px,16.5vw,270px)]"
            capture={{
              src: "/landing/screen-meal-scores.webp",
              alt: "A real PrepIt screen: one breakfast moved Energy by 34, Satiety by 4 and Mood by 11, each with its reason.",
            }}
          />
        </div>
      </div>
      <p className="relative z-[3] px-gutter pt-3 text-[12px] leading-snug text-ink-muted xl:absolute xl:bottom-4 xl:left-[max(var(--spacing-gutter),calc((100vw-var(--container-content))/2))] xl:max-w-[min(540px,44vw)] xl:p-0">
        Real screen, example account: how the app scored one meal, with the reasons. Scores are estimates. The photo
        is illustrative.
      </p>
    </section>
  );
}

// ---------------------------------------------------------------- 2. free week

const DAYS = [
  { when: "Day 1", session: "Session 1", title: "Getting to know you", body: "Five minutes on your routine and your goal. Then eat as you normally do." },
  { when: "Around day 3", session: "Session 2", title: "What I've noticed so far", body: "Patterns from your own meals, one focus and two small swaps to try." },
  { when: "Around day 7", session: "Session 3", title: "Week-in-review", body: "What went well, how your scores moved, and next week's focus." },
];

export function FreeWeekSection({ market }: { market: WebMarket }) {
  return (
    <Section id="first-week" labelledBy="week-heading" analyticsName="free-week">
      <div className="mb-stack max-w-[760px]">
        <SectionHeading
          id="week-heading"
          eyebrow="Your free week"
          eyebrowTone="gradient"
          title="Seven days with a nutritionist that gets to know you first."
          lead="Your free week starts with a nutrition consultation: three short chat sessions in the app, built on what you actually eat."
          className="[&>p:last-child]:max-w-[36em]"
        />
      </div>
      <ol className="grid gap-[18px] min-[860px]:grid-cols-3">
        {DAYS.map((day) => (
          <li key={day.session} className="flex min-w-0 flex-col gap-2.5 rounded-tile bg-surface p-6">
            <p className="flex items-center gap-2.5 text-[13px] font-bold uppercase tracking-[0.08em] text-ink-muted">
              <span aria-hidden className="h-2.5 w-2.5 flex-none rounded-full bg-accent shadow-[0_0_0_4px_rgb(255_100_79/0.18)]" />
              {day.when}
            </p>
            <p className="text-[13px] font-bold text-accent-text">{day.session}</p>
            <h3 className="font-display text-card-title text-ink">{day.title}</h3>
            <p className="text-[16px] leading-normal text-ink-secondary">{day.body}</p>
          </li>
        ))}
      </ol>
      <p className="mt-[18px] flex flex-wrap items-center gap-x-3.5 gap-y-2.5 rounded-tile bg-surface px-[22px] py-[18px] text-ink-secondary">
        <WhenPill>Around day 3</WhenPill>
        <span>
          <b className="text-ink">Then your nutritionist offers to plan your week,</b> with one grocery list. Or ask any
          time after Session 1.
        </span>
      </p>
      <LandingCta market={market} placement="week" className="mt-stack w-fit" />
    </Section>
  );
}

// ---------------------------------------------------------------- 3. why it works

export function WhyItWorksSection() {
  return (
    <Section id="why" labelledBy="why-heading" analyticsName="why-it-works" className="[&>div]:pt-0">
      <Split
        media={
          <figure className="grid gap-3">
            <MediaTag>
              <WhenPill>After a few weeks</WhenPill>Your nutritionist noticed
            </MediaTag>
            <LandingPhoto
              name="why-hob"
              widths={[768, 1400]}
              sizes="(min-width: 900px) 50vw, 100vw"
              alt="Over his shoulder at the hob, a man reads a message from his nutritionist about protein while salmon and green beans cook. The message: protein has been a little low, mostly at dinner, with two easy fixes."
              className="aspect-[1600/1062] w-full rounded-card object-cover"
            />
            <Caption>Real message from the app, example account, sent after three weeks of meals. The photo is illustrative.</Caption>
          </figure>
        }
      >
        <Heading id="why-heading" eyebrow="Why it works" title="Most apps count what you ate. PrepIt tells you what to change." />
        <Body>
          Totals on their own rarely change a habit. Your nutritionist reads your weeks, finds the pattern behind how you
          feel and turns it into one small step that fits how you already eat.
        </Body>
        <Bullets
          items={[
            ["One focus at a time,", "with two small swaps to try"],
            ["A check-in every week", "on how it went"],
            ["After a few weeks, it speaks up", "when it spots a pattern"],
          ]}
        />
      </Split>
    </Section>
  );
}

// ---------------------------------------------------------------- 4. Energy, Satiety and Mood

const SCORES = [
  { name: "Energy", color: "bg-energy", text: "tells you whether today's meals are likely to keep you going. If it's low, your nutritionist suggests what to add next." },
  { name: "Satiety", color: "bg-satiety", text: "tells you whether a meal is likely to keep you full. Use it to build meals that last until the next one." },
  { name: "Mood", color: "bg-mood", text: "shows how your eating lines up with feeling steady. Use it to see what your better days have in common." },
];

/** Rings over the screen's +34, +4 and +11, as percentages of the composite. */
const RING_MARKS = [
  { left: "87.4%", top: "46.2%" },
  { left: "87.6%", top: "51.9%" },
  { left: "87.5%", top: "56.8%" },
];

export function SignalsSection() {
  return (
    <Section id="signals" labelledBy="signals-heading" analyticsName="signals">
      <Split
        reverse
        media={
          <figure className="grid gap-3">
            <div className="relative mx-auto aspect-[1600/2000] max-h-[720px] overflow-hidden rounded-card">
              <LandingPhoto
                name="signals-breakfast"
                widths={[640, 1400]}
                sizes="(min-width: 900px) 50vw, 100vw"
                alt="Overnight oats with sliced apple and almonds, a coffee and a jug of milk on a wooden table, with a phone beside them showing how the breakfast scored: Energy +34, Satiety +4, Mood +11."
                className="h-full w-full object-cover"
              />
              {RING_MARKS.map((mark) => (
                <span
                  key={mark.top}
                  aria-hidden
                  className="pointer-events-none absolute z-[2] aspect-square w-[4.4%] -translate-x-1/2 -translate-y-1/2 rounded-full border-[2.5px] border-accent shadow-[0_0_0_2px_rgb(0_0_0/0.25)]"
                  style={mark}
                />
              ))}
              <span
                aria-hidden
                className="absolute right-[3%] top-[74%] z-[2] max-w-[46%] rounded-[14px] border border-annotation-border bg-annotation-label px-3 py-2 text-[13px] leading-tight text-ink shadow-[0_10px_24px_-14px_rgb(26_26_46/0.4)]"
              >
                <b className="block text-[15px] text-accent-text">This breakfast</b>
                Energy +34, Satiety +4, Mood +11
              </span>
            </div>
            <Caption>Real app screen from an example account. Estimates, not a medical measurement.</Caption>
          </figure>
        }
      >
        <Heading id="signals-heading" eyebrow="Energy, Satiety and Mood" title="Know which meals keep you going." />
        <Body>Every meal you log gets three scores from 0 to 100, each with the reason in plain words. No wearable needed.</Body>
        <ul className="grid gap-3">
          {SCORES.map((score) => (
            <li
              key={score.name}
              className="grid grid-cols-[12px_minmax(0,1fr)] items-baseline gap-x-3 rounded-[18px] bg-surface px-4 py-3.5 leading-snug text-ink-secondary"
            >
              <i aria-hidden className={`block h-3 w-3 translate-y-px rounded-full ${score.color}`} />
              <span>
                <b className="text-ink">{score.name}</b> {score.text}
              </span>
            </li>
          ))}
        </ul>
        <p className="text-small font-bold text-ink-muted">Estimates, not a medical measurement.</p>
      </Split>
    </Section>
  );
}

// ---------------------------------------------------------------- 5. meal plans

export function PlansSection({ market }: { market: WebMarket }) {
  return (
    <Section id="plans" labelledBy="plans-heading" analyticsName="plans" className="[&>div]:pt-0">
      <Split
        media={
          <figure className="relative grid gap-3">
            <div className="aspect-[1600/1062] overflow-hidden rounded-card">
              <LandingPhoto
                name="plans-prep"
                widths={[768, 1600]}
                sizes="(min-width: 900px) 50vw, 100vw"
                alt="Overhead, a week's meals going into glass containers: chicken grain bowls, a salmon traybake and a lentil curry with rice."
                className="h-full w-full object-cover"
              />
            </div>
            <div className="relative -mt-16 grid grid-cols-2 items-start gap-3.5 px-[3%] sm:-mt-24 sm:px-[4%]">
              <ScreenCard tag="Change it by asking">
                <ScreenCrop
                  src="/landing/screen-plan-swap.webp"
                  width={804}
                  height={940}
                  ratio="804 / 380"
                  top={0.6965}
                  alt="In the chat about the plan, the user asks: can you suggest some alternatives? The nutritionist replies: which of these sounds best?"
                />
              </ScreenCard>
              <ScreenCard tag="One list for the week" className="mt-10">
                <ScreenCrop
                  src="/landing/screen-grocery-list.webp"
                  width={804}
                  height={1748}
                  ratio="804 / 450"
                  top={1.556}
                  alt="The plan's grocery list, fresh produce section: apple 450 g and avocado 140 g with tick boxes, above Copy and Share buttons."
                />
              </ScreenCard>
            </div>
            <Caption>Real app screens from an example account. Costs are estimates.</Caption>
          </figure>
        }
      >
        <Heading id="plans-heading" eyebrow="Meal plans and groceries" title="Your week planned, your shopping listed." />
        <Body>
          Ask for up to seven days of meals built around the food you already eat, your goal and your budget, with
          cooking steps and a cost estimate.
        </Body>
        <Bullets
          items={[
            ["One grocery list", "for the whole plan"],
            ["Priced before you shop,", "with a lower cost option"],
            ["Changes when you ask:", "“swap Thursday's dinner”"],
          ]}
        />
        <LandingCta market={market} placement="plans" className="w-fit" />
      </Split>
    </Section>
  );
}

// ---------------------------------------------------------------- 6. logging

const WAYS = [
  { title: "Type it", text: "“Chicken wrap and a flat white”", icon: <path d="M4 5h12M10 5v11" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /> },
  {
    title: "Say it",
    text: "A voice note, Siri or the Action button",
    icon: (
      <>
        <rect x="7.5" y="2.5" width="5" height="9" rx="2.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
        <path d="M4.5 9.5a5.5 5.5 0 0 0 11 0M10 15v2.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </>
    ),
  },
  {
    title: "Snap it",
    text: "A photo of your plate",
    icon: (
      <>
        <path d="M3 6.5h3l1.5-2h5L14 6.5h3v9H3z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        <circle cx="10" cy="11" r="2.8" fill="none" stroke="currentColor" strokeWidth="1.6" />
      </>
    ),
  },
];

export function LoggingSection() {
  return (
    <Section id="tell-it" labelledBy="logging-heading" analyticsName="logging">
      <Split
        reverse
        media={
          <div className="relative grid place-items-center py-3">
            <div aria-hidden className="absolute inset-x-[8%] inset-y-[6%] bg-[radial-gradient(closest-side,rgb(255_100_79/0.16),transparent),radial-gradient(closest-side_at_70%_65%,rgb(245_204_119/0.2),transparent)]" />
            <DeviceFrame
              className="relative [--device-w:290px]"
              video={appVideo("03-log-typed", "Screen recording: a meal typed in plain words lands on the day with its nutrition worked out.")}
            />
          </div>
        }
      >
        <Heading id="logging-heading" eyebrow="Logging meals" title="No searching. No weighing." />
        <Body>
          Tell your nutritionist what you ate the way you&apos;d tell a friend. It works out the rest from real sources,
          and the meal is on your day straight away.
        </Body>
        <div className="mt-1 grid gap-3.5">
          {WAYS.map((way) => (
            <div key={way.title} className="grid grid-cols-[44px_minmax(0,1fr)] items-start gap-3.5">
              <span className="grid h-11 w-11 place-items-center rounded-[14px] border border-line bg-surface">
                <svg viewBox="0 0 20 20" className="h-5 w-5" aria-hidden>
                  {way.icon}
                </svg>
              </span>
              <div>
                <b className="block">{way.title}</b>
                <span className="text-[16px] text-ink-secondary">{way.text}</span>
              </div>
            </div>
          ))}
        </div>
      </Split>
    </Section>
  );
}

// ---------------------------------------------------------------- 7. message or voice note

const SAYS = [
  ["Two glasses of water so far", "Water logged"],
  ["That pasta was a small bowl", "Log fixed"],
  ["Plan next week, and keep it cheap", "A few questions, then your plan"],
];

export function JustAskSection() {
  return (
    <Section id="just-ask" labelledBy="ask-heading" analyticsName="just-ask" className="[&>div]:pt-0">
      <Split
        media={
          <figure className="relative grid gap-3">
            <div className="aspect-[1600/1062] overflow-hidden rounded-card">
              <LandingPhoto
                name="voice-park"
                widths={[768, 1600]}
                sizes="(min-width: 900px) 50vw, 100vw"
                alt="Walking home through a park after a run, a woman records a voice note on her phone."
                className="h-full w-full object-cover [object-position:62%_45%]"
              />
            </div>
            <ScreenCard tag="A voice note, logged" className="relative -mt-[90px] ml-[4%] w-[82%] sm:-mt-[150px] sm:w-[min(56%,300px)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/landing/screen-voice-note.webp"
                width={804}
                height={1036}
                loading="lazy"
                decoding="async"
                className="h-auto w-full rounded-[15px]"
                alt="A voice note says: I just had a chicken burrito bowl with rice, black beans, guac and salsa for dinner, can you log it? The reply says it's a solid dinner with about 59 grams of protein, above a card with 674 kcal and a Log it button."
              />
            </ScreenCard>
            <Caption>Real app screens from an example account. The photo is illustrative.</Caption>
          </figure>
        }
      >
        <Heading id="ask-heading" eyebrow="Message or voice note" title="Most things take one message." />
        <Body>Log a meal, fix a log, change a target or plan your week. Type it or send a voice note, then tap to confirm.</Body>
        <ul className="mt-1 grid gap-2.5">
          {SAYS.map(([said, result]) => (
            <li key={said} className="flex flex-wrap justify-between gap-x-3 gap-y-1 rounded-[18px] bg-surface px-3.5 py-3">
              <q className="font-medium leading-snug text-ink">{said}</q>
              <span className="flex items-center gap-1.5 text-[13px] text-ink-muted">
                <span className="text-accent-text"><Tick /></span>
                {result}
              </span>
            </li>
          ))}
        </ul>
      </Split>
    </Section>
  );
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

// ---------------------------------------------------------------- 9. we know how it goes

export function WeKnowSection({ market, prices }: { market: WebMarket; prices: Prices }) {
  const chargeAnswer =
    market === "web"
      ? `You pay ${prices.free} today, we email a reminder on day 4, and you pay nothing if you cancel before day 8.`
      : `The first ${TRIAL_DAYS} days are free, and you pay nothing if you cancel in your iPhone's settings at least 24 hours before they end.`;
  return (
    <Section id="we-know" labelledBy="know-heading" analyticsName="we-know">
      <div className="grid items-start gap-x-[72px] gap-y-7 min-[900px]:grid-cols-2">
        <div className="flex flex-col gap-5">
          <Heading id="know-heading" eyebrow="We know how it goes" title="Tracking always starts well. Then it gets annoying." />
          <Body>
            Searching a database for the chilli you made, weighing rice before work, screens of numbers and nothing
            telling you what to change. PrepIt takes that part away.
          </Body>
        </div>
        <Bullets
          items={[
            ["Tried apps before?", "Here a meal is one sentence, and your nutritionist does the working out."],
            ["Busy day? Nothing breaks.", "Add meals later, even the whole day in the evening."],
            ["Worried about a surprise charge?", chargeAnswer],
          ]}
        />
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
