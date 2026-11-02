import type { ReactNode } from "react";
import AppStoreLink from "@/components/AppStoreLink";
import LandingCta from "@/components/landing/LandingCta";
import type { LandingSurfaceName } from "@/components/landing/LandingSurface";
import { landingCopy } from "@/components/landing/LandingSections";
import Reveal from "@/components/landing/v9/Reveal";
import { V9Photo, V9Screen } from "@/components/landing/v9/V9Photo";
import WhoItsFor from "@/components/landing/v9/WhoItsFor";
import LoopVideo, { LoopVideoToggle, LoopVideoToggleScope } from "@/components/media/LoopVideo";
import type { WebMarket } from "@/lib/markets";
import { type Prices, TRIAL_DAYS, WEB_REMINDER_EMAIL_LIVE } from "@/lib/pricing";

/**
 * Landing v9 on /try, part 1 (PRE-432): Charlie's final page from the hero
 * film through Ask Nutritionist, rebuilt on the site's tokens and components.
 * Copy is from the handoff's docs/landing-copy.md; app screens are real
 * captures from the example account, photos are the handoff's own.
 */

// ---------------------------------------------------------------- pieces

/** A small uppercase label with an orange dot: plain, or as a black pill over media. */
export function DotTag({ children, pill }: { children: ReactNode; pill?: boolean }) {
  return (
    <span
      className={`inline-flex w-fit items-center gap-1.5 text-[11px] font-bold uppercase leading-none tracking-[0.1em] ${
        pill ? "rounded-full bg-primary px-2.5 py-1.5 text-on-primary" : "text-ink"
      }`}
    >
      <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-accent" />
      {children}
    </span>
  );
}

export function Chip({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-line bg-surface/70 px-3 py-1.5 text-[13px] font-medium leading-tight text-ink">
      {children}
    </span>
  );
}

/** A real app capture floating on the page, as the app's own card. */
export function Glass({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={`overflow-hidden rounded-[18px] bg-white p-1 shadow-[var(--shadow-v9-card)] ring-1 ring-black/5 ${className ?? ""}`}>
      <div className="overflow-hidden rounded-[14px]">{children}</div>
    </div>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="text-[12px] font-bold uppercase leading-none tracking-[0.12em] text-ink-muted">{children}</p>;
}

/** Label, headline and the one supporting line of a section. */
export function Head({ id, label, title, lead, center }: { id: string; label: string; title: ReactNode; lead: ReactNode; center?: boolean }) {
  return (
    <div className={`flex flex-col gap-4 ${center ? "items-center text-center" : ""}`}>
      <Eyebrow>{label}</Eyebrow>
      <h2 id={id} className="font-display text-chapter text-ink text-balance">
        {title}
      </h2>
      <p className="max-w-[34em] text-lead text-ink-secondary text-pretty">{lead}</p>
    </div>
  );
}

/** Text beside media from 900 px, text first below. `reverse` puts the media on the left. */
export function Split({ text, media, reverse, align = "center" }: { text: ReactNode; media: ReactNode; reverse?: boolean; align?: "center" | "end" }) {
  return (
    <div className={`grid gap-x-16 gap-y-10 min-[900px]:grid-cols-2 ${align === "end" ? "min-[900px]:items-end" : "items-center"}`}>
      <div className={`flex min-w-0 flex-col gap-6 ${reverse ? "min-[900px]:order-2" : ""}`}>{text}</div>
      <div className="min-w-0">{media}</div>
    </div>
  );
}

/**
 * Empty targets at the top of a section, so links to an older page's
 * anchors (the homepage before v9, PRE-444) still land on the matching part.
 */
export function AnchorAliases({ ids }: { ids?: string[] }) {
  return ids?.map((alias) => <span key={alias} id={alias} aria-hidden className="absolute left-0 top-0" />);
}

/** One section of the page, with the name it reports to `home_section_viewed`. */
export function V9Section({
  id,
  name,
  labelledBy,
  band,
  className,
  aliases,
  children,
}: {
  id: string;
  name: string;
  labelledBy: string;
  band?: boolean;
  className?: string;
  /** Older anchors that should land here too (see AnchorAliases). */
  aliases?: string[];
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      data-section-name={name}
      className={`relative w-full overflow-hidden text-ink ${band ? "v9-band" : "bg-page"} ${className ?? ""}`}
    >
      <AnchorAliases ids={aliases} />
      <div className="mx-auto w-full max-w-content px-gutter py-section">{children}</div>
    </section>
  );
}

// ---------------------------------------------------------------- 1. hero film

/**
 * On the homepage (`home`, PRE-444) the hero also offers the App Store
 * straight away, for people who arrive already sold, where the website
 * sells (elsewhere the main button is already the App Store or the
 * waitlist); on /try every button goes to the cart. `surface` must match the
 * page's LandingSurfaceProvider.
 */
export function V9Hero({ market, prices, surface = "try" }: { market: WebMarket; prices: Prices; surface?: LandingSurfaceName }) {
  const web = market === "web";
  const filmId = `${surface}-hero-film`;
  const { reassure } = landingCopy(market, prices);
  return (
    <section
      id="hero"
      aria-labelledby="hero-heading"
      data-section-name="hero"
      className="theme-dark relative isolate flex min-h-[min(calc(100svh-64px),860px)] w-full flex-col justify-end overflow-hidden bg-page pt-16 text-ink min-[900px]:min-h-[min(calc(100svh-64px),760px)] min-[900px]:justify-center"
    >
      {/* The still first, so the hero paints before the film loads, and stays under reduced motion. */}
      <picture>
        <source media="(min-width: 900px)" srcSet="/landing/v9/hero-poster-wide-1600.avif" type="image/avif" />
        <source media="(min-width: 900px)" srcSet="/landing/v9/hero-poster-wide-1600.webp" type="image/webp" />
        <source srcSet="/landing/v9/hero-poster-portrait-720.avif" type="image/avif" />
        <img
          src="/landing/v9/hero-poster-portrait-720.webp"
          alt=""
          width={720}
          height={1280}
          fetchPriority="high"
          decoding="async"
          className="absolute inset-0 -z-20 h-full w-full object-cover"
        />
      </picture>
      {/*
        One film per shape. The hidden one never loads: LoopVideo fetches its
        poster and plays only once it is on screen, and its poster is the same
        file the still above already loaded. Each film's pause button is drawn
        above the copy (LoopVideoToggleScope), so it can always be tapped.
      */}
      <LoopVideoToggleScope>
        <div className="absolute inset-0 -z-10 min-[900px]:hidden">
          <LoopVideo
            className="v9-hero-film"
            mp4="/landing/v9/hero-film-portrait.mp4"
            poster="/landing/v9/hero-poster-portrait-720.avif"
            width={720}
            height={1280}
            label=""
            analyticsId={filmId}
          />
        </div>
        <div className="v9-hero-toggle absolute bottom-3 right-3 z-10 min-[900px]:hidden">
          <LoopVideoToggle />
        </div>
      </LoopVideoToggleScope>
      <LoopVideoToggleScope>
        <div className="absolute inset-0 -z-10 hidden min-[900px]:block">
          <LoopVideo
            className="v9-hero-film"
            mp4="/landing/v9/hero-film-wide.mp4"
            poster="/landing/v9/hero-poster-wide-1600.avif"
            width={1600}
            height={900}
            label=""
            analyticsId={filmId}
          />
        </div>
        <div className="v9-hero-toggle absolute bottom-4 right-4 z-10 hidden min-[900px]:block">
          <LoopVideoToggle />
        </div>
      </LoopVideoToggleScope>
      <div aria-hidden className="v9-hero-scrim pointer-events-none absolute inset-0 -z-10" />

      <div className="relative mx-auto w-full max-w-content px-gutter pb-[calc(28px+env(safe-area-inset-bottom,0px))] pt-24 min-[900px]:py-20">
        <div className="flex max-w-[560px] flex-col gap-5">
          <p className="text-[12px] font-bold uppercase leading-none tracking-[0.12em] text-ink-secondary">Your AI nutritionist</p>
          <h1 id="hero-heading" className="font-display text-hero text-ink text-balance">
            The nutritionist for <span className="landing-underline">everyone.</span>
          </h1>
          <p className="max-w-[30em] text-lead text-ink-secondary text-pretty">
            It learns your meals, spots the pattern and plans your week.
          </p>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-[13px] font-medium leading-tight text-white">
              {web ? `${TRIAL_DAYS} days free · ${prices.free} today` : `${TRIAL_DAYS} days free`}
            </span>
            <span className="rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-[13px] font-medium leading-tight text-white">
              iPhone
            </span>
          </div>
          <LandingCta market={market} placement="hero" className="w-fit max-[599px]:flex max-[599px]:w-full max-[599px]:justify-center" />
          {surface === "home" && market === "web" && (
            <p className="text-small text-ink-secondary">
              Already sure?{" "}
              <AppStoreLink
                trackingSource="home-hero-app-store"
                data-cta="home_hero_app_store"
                className="font-medium text-ink underline underline-offset-4 hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus"
              >
                Download it from the App Store
              </AppStoreLink>
            </p>
          )}
          <p className="text-[13px] leading-snug text-ink-secondary max-[899px]:pr-14">
            {web ? `${WEB_REMINDER_EMAIL_LIVE ? "Reminder email on day 4. " : ""}Cancel before day 8, pay nothing.` : `${reassure.strong} ${reassure.rest}`}
          </p>
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------- 2. however you eat

export function HoweverYouEatSection() {
  return (
    <V9Section id="however-you-eat" name="however-you-eat" labelledBy="eat-heading" band>
      <Split
        text={
          <Head
            id="eat-heading"
            label="However you eat"
            title={
              <>
                Spoon people.
                <br />
                Fork people.
                <br />
                Spork people.
              </>
            }
            lead="Early starts, late dinners, busy weekends. Your nutritionist starts there."
          />
        }
        media={
          <Reveal>
            <V9Photo
              name="fork-row"
              widths={[760, 1200]}
              width={1200}
              height={867}
              sizes="(min-width: 900px) 560px, 100vw"
              alt="Seven forks and spoons from seven different kitchens."
              className="h-auto w-full rounded-[24px]"
            />
          </Reveal>
        }
      />
    </V9Section>
  );
}

// ---------------------------------------------------------------- 3. who it's for

export function WhoItsForSection() {
  return (
    <section id="who-its-for" aria-label="Who it’s for" data-section-name="who-its-for" className="relative w-full overflow-hidden bg-page pb-section pt-section text-ink">
      <WhoItsFor />
    </section>
  );
}

// ---------------------------------------------------------------- 4. "I'll start Monday"

export function StartMondaySection() {
  return (
    <V9Section id="start-monday" name="start-monday" labelledBy="monday-heading" band>
      <Reveal className="flex flex-col items-center gap-6 text-center">
        <Eyebrow>Everyone’s said it</Eyebrow>
        <h2 id="monday-heading" className="font-display text-[clamp(56px,36px+5.2vw,128px)] leading-[0.98] tracking-[-0.02em] text-ink">
          “I’ll start <span className="v9-strike">Monday.</span>”
        </h2>
        <p className="font-display text-[clamp(36px,26px+2.6vw,72px)] leading-none tracking-[-0.01em] text-ink">
          <span className="landing-underline">Tonight</span> works.
        </p>
        <p className="max-w-[26em] text-body text-ink-secondary text-pretty">
          No fresh start needed. Tell your nutritionist what you had for dinner. That’s day 1.
        </p>
      </Reveal>
    </V9Section>
  );
}

// ---------------------------------------------------------------- 5. 01 say it

/** The app's voice note bubble: play, waveform, length and the transcript under it. */
function VoiceNote() {
  const bars = [6, 10, 14, 9, 16, 12, 18, 11, 7, 13, 17, 10, 15, 8, 12, 16, 9, 6, 11, 14, 8, 12];
  return (
    <div className="w-full max-w-[300px] rounded-[18px] bg-[#d9d3cd] px-3.5 py-3 text-[#1a1a2e]" role="img" aria-label="A 4-second voice note: Chicken wrap with hummus and salad for lunch.">
      <div className="flex items-center gap-3">
        <span aria-hidden className="grid h-8 w-8 flex-none place-items-center rounded-full bg-[#1a1a2e] text-white">
          <svg viewBox="0 0 16 16" className="h-3 w-3" aria-hidden>
            <path d="M4 2.6v10.8a1 1 0 0 0 1.5.86l9-5.4a1 1 0 0 0 0-1.72l-9-5.4A1 1 0 0 0 4 2.6Z" fill="currentColor" />
          </svg>
        </span>
        <span aria-hidden className="flex h-5 flex-1 items-center gap-[3px]">
          {bars.map((h, i) => (
            <i key={i} className="w-[2px] rounded-full bg-[#1a1a2e]/45" style={{ height: h }} />
          ))}
        </span>
        <span className="text-[13px] tabular-nums text-[#4d4d59]">00:04</span>
      </div>
      <p className="mt-2 text-[13px] leading-snug text-[#5c5c68]">Chicken wrap with hummus and salad for lunch</p>
    </div>
  );
}

export function SayItSection() {
  return (
    <V9Section id="say-it" name="say-it" labelledBy="say-heading">
      <Split
        align="end"
        text={
          <Head
            id="say-heading"
            label="01 · Say it"
            title="Logged before you’ve put your fork down."
            lead="Type it, say it or snap it. It’s logged in seconds."
          />
        }
        media={
          <div className="flex flex-col gap-10">
            <Reveal className="flex flex-col gap-3">
              <DotTag>Type it</DotTag>
              <Glass className="w-[min(100%,377px)]">
                <V9Screen name="say-field-oats" width={754} height={112} alt="The Log Meal field with “overnight oats with apple and cinnamon” typed in, and the send arrow." />
              </Glass>
              <Glass className="-mt-1 ml-auto w-[min(88%,313px)] min-[900px]:ml-[34%]">
                <V9Screen name="see-row-oats" width={626} height={247} alt="7:45 AM, protein overnight oats with apple and cinnamon, 357 kcal, Energy +35, Satiety +8, Mood +12." />
              </Glass>
            </Reveal>
            <Reveal className="flex flex-col gap-3" delay={80}>
              <DotTag>Say it</DotTag>
              <VoiceNote />
              <Glass className="-mt-1 ml-auto w-[min(88%,313px)] min-[900px]:ml-[34%]">
                <V9Screen name="say-row-wrap" width={626} height={247} alt="12:30 PM, chicken wrap with hummus and salad, 462 kcal, Energy +20, Satiety +16, Mood +15." />
              </Glass>
            </Reveal>
            <Reveal className="flex flex-col gap-3" delay={160}>
              <DotTag>Snap it</DotTag>
              <div className="flex items-center gap-3">
                <Glass className="w-[min(30%,120px)] flex-none">
                  <V9Screen name="say-snap-burrito" width={414} height={544} alt="A photo of a chicken burrito bowl with rice, black beans, guacamole and pico de gallo." />
                </Glass>
                <Glass className="w-[min(70%,313px)]">
                  <V9Screen name="say-row-burrito" width={626} height={206} alt="12:47 PM, homemade chicken burrito bowl, 529 kcal, Energy -11, Satiety -1, Mood +18." />
                </Glass>
              </div>
            </Reveal>
          </div>
        }
      />
    </V9Section>
  );
}

// ---------------------------------------------------------------- 6. 02 see it

export function SeeItSection({ aliases }: { aliases?: string[] } = {}) {
  const why = [
    { tag: "Energy 84", name: "see-why-energy-oats", w: 740, h: 293, offset: "", alt: "One breakfast's Energy, up 34: Morning protein provides a steady power supply to your day. Enjoy these oats with a side of chia seeds or almonds." },
    { tag: "Satiety 96", name: "see-why-satiety", w: 732, h: 295, offset: "min-[480px]:ml-[14%]", alt: "How it's shaped, Protein: protein grams and protein share of calories are the largest lift to Satiety. 155 g, 42% of kcal from protein, plus 23.6." },
    { tag: "Mood 87", name: "see-why-mood", w: 732, h: 337, offset: "min-[480px]:ml-[4%]", alt: "How it's shaped, Ultra-processed pattern: heavier ultra-processed patterns in yesterday's log lower Mood in line with observational research links. 0% of calories from ultra-processed, plus 22." },
  ];
  return (
    <V9Section id="see-it" name="see-it" labelledBy="see-heading" aliases={aliases}>
      <Split
        reverse
        text={
          <Head
            id="see-heading"
            label="02 · See it"
            title="Three numbers that aren’t calories."
            lead="Energy, Satiety and Mood, each 0 to 100, with the reason in plain words."
          />
        }
        media={
          <div className="flex flex-col gap-5">
            <Reveal>
              <Glass className="w-[min(100%,420px)]">
                <V9Screen name="see-rings" width={741} height={337} alt="PrepIt's three rings: Energy 84, Satiety 96, Mood 87." />
              </Glass>
            </Reveal>
            {why.map((item, index) => (
              <Reveal key={item.name} delay={(index + 1) * 90} className={`relative w-[min(100%,380px)] pt-3 ${item.offset}`}>
                <span className="absolute left-3 top-0 z-[1]">
                  <DotTag pill>{item.tag}</DotTag>
                </span>
                <Glass>
                  <V9Screen name={item.name} width={item.w} height={item.h} alt={item.alt} />
                </Glass>
              </Reveal>
            ))}
          </div>
        }
      />
    </V9Section>
  );
}

// ---------------------------------------------------------------- 7. 03 it notices

export function ItNoticesSection({ aliases }: { aliases?: string[] } = {}) {
  return (
    <V9Section id="it-notices" name="it-notices" labelledBy="notices-heading" band aliases={aliases}>
      <Split
        text={
          <>
            <Head
              id="notices-heading"
              label="03 · It notices"
              title="It notices what we miss."
              lead="First patterns after about 3 days of meals. Bigger ones after a few weeks."
            />
            <div className="flex flex-wrap gap-2">
              <Chip>1 focus each week</Chip>
              <Chip>Weekly Check-in</Chip>
              <Chip>Max 1 message daily</Chip>
            </div>
          </>
        }
        media={
          <Reveal className="relative pb-[42%] min-[900px]:pb-24">
            <V9Photo
              name="eggcups"
              widths={[560, 880]}
              width={880}
              height={1093}
              sizes="(min-width: 900px) 420px, 80vw"
              alt="Twenty-one egg cups in three rows of seven. Only three hold an egg."
              className="h-auto w-[82%] rounded-[24px] min-[900px]:w-[78%]"
            />
            <div className="absolute bottom-0 right-0 w-[min(78%,330px)]">
              <span className="absolute -top-3 left-4 z-[1]">
                <DotTag pill>After 3 weeks</DotTag>
              </span>
              <Glass>
                <V9Screen
                  name="msg-protein-light"
                  width={659}
                  height={544}
                  alt="A message from the nutritionist: protein under target on 18 of 21 logged days, about 127 grams a day against 158. Most of the gap is at dinner. Two easy fixes that don’t change what you cook."
                />
              </Glass>
            </div>
          </Reveal>
        }
      />
    </V9Section>
  );
}

// ---------------------------------------------------------------- 8. 04 it plans

export function ItPlansSection({ market, aliases }: { market: WebMarket; aliases?: string[] }) {
  return (
    <V9Section id="it-plans" name="it-plans" labelledBy="plans-heading" aliases={aliases}>
      <Split
        reverse
        text={
          <>
            <Head
              id="plans-heading"
              label="04 · It plans"
              title="Your week, planned. Your shopping, listed."
              lead="Up to 7 days, from food you already eat. Change any meal by asking."
            />
            <div className="flex flex-wrap gap-2">
              <Chip>Up to 7 days</Chip>
              <Chip>1 grocery list</Chip>
              <Chip>Cost estimate</Chip>
              <Chip>“Swap Thursday&apos;s dinner”</Chip>
            </div>
            <LandingCta market={market} placement="plans" className="w-fit" />
          </>
        }
        media={
          <Reveal className="relative pb-[30%] min-[900px]:pb-28">
            <V9Photo
              name="packed-lunches"
              widths={[640, 1000]}
              width={1000}
              height={1000}
              sizes="(min-width: 900px) 520px, 100vw"
              alt="Six packed lunches from above: a bento of sandwiches and grapes, chicken with rice and broccoli, a sandwich in paper with an apple, pasta salad, yogurt with berries, a bagel."
              className="ml-auto h-auto w-[92%] rounded-[24px]"
            />
            <Glass className="absolute bottom-0 left-0 w-[min(62%,300px)]">
              <V9Screen
                name="ui-grocery"
                width={764}
                height={951}
                alt="A PrepIt grocery list by aisle: wholemeal tortilla, eggs, feta, Greek yogurt, apple, avocado, with amounts."
              />
            </Glass>
          </Reveal>
        }
      />
    </V9Section>
  );
}

// ---------------------------------------------------------------- 9. ask nutritionist

function YouSaid({ children }: { children: ReactNode }) {
  return (
    <div className="flex max-w-[40rem] flex-col gap-2">
      <p className="text-[12px] font-bold uppercase tracking-[0.1em] text-ink-muted">You · typed</p>
      <p className="font-display text-[clamp(24px,20px+1vw,32px)] leading-[1.18] text-ink text-pretty">{children}</p>
    </div>
  );
}

function NutritionistSaid({ children }: { children: ReactNode }) {
  return (
    <div className="ml-auto flex w-[88%] max-w-[34rem] flex-col gap-2 min-[900px]:w-1/2">
      <p className="text-[12px] font-bold uppercase tracking-[0.1em]">
        <span className="text-gradient-brand">Your nutritionist</span>
      </p>
      <div className="flex flex-col gap-3 text-lead text-ink-secondary text-pretty">{children}</div>
    </div>
  );
}

export function AskNutritionistSection() {
  return (
    <V9Section id="ask-nutritionist" name="ask-nutritionist" labelledBy="ask-heading" band>
      <div className="flex flex-col gap-12">
        <Head id="ask-heading" label="Ask Nutritionist" title="Talk it through." lead="A real back and forth, any hour. It suggests. You decide." />
        <div className="flex flex-col gap-8">
          <Reveal>
            <YouSaid>“What’s a good high-protein breakfast for tomorrow?”</YouSaid>
          </Reveal>
          <Reveal delay={120}>
            <NutritionistSaid>
              <p>
                …avocado toast with two eggs or a quick frittata with smoked salmon both hit over 30g of protein easily. Do you
                want to stick with the overnight oats, or swap to something else?
              </p>
            </NutritionistSaid>
          </Reveal>
          <Reveal>
            <YouSaid>“Love that. Just grabbed a chicken burrito bowl with rice, black beans, guac and salsa for dinner”</YouSaid>
          </Reveal>
          <Reveal delay={120}>
            <NutritionistSaid>
              <p>Great pick, that’s about 59g of protein.</p>
              <p>Here’s what I’ve got. Tap Log it to add it to dinner.</p>
            </NutritionistSaid>
          </Reveal>
        </div>
        <div className="flex flex-col gap-4 border-t border-line-strong pt-5">
          {/* The chat's Log it card button, shown, not pressable here. */}
          <span className="inline-flex w-fit items-center gap-2 rounded-full bg-primary px-3.5 py-2 text-small font-bold leading-none text-on-primary">
            <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-accent" />
            Log it
          </span>
          <p className="flex flex-wrap gap-x-6 gap-y-1 text-small text-ink-secondary">
            <span>
              <b className="text-ink">Type it,</b> say it in a voice note, or send a photo.
            </span>
            <b className="text-ink">Any hour.</b>
            <b className="text-ink">A coach, not a doctor.</b>
          </p>
        </div>
      </div>
    </V9Section>
  );
}
