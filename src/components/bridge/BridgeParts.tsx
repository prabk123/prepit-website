import Link from "next/link";
import type { ReactNode } from "react";
import DeviceFrame from "@/components/device/DeviceFrame";
import LongLogo from "@/components/ui/LongLogo";
import { appCapture } from "@/lib/captures";
import type { BridgeSource } from "@/lib/funnel/params";
import { TRIAL_DAYS } from "@/lib/pricing";

/**
 * The pieces of the shared bridge (PRE-323) and the "You're in" page
 * (PRE-325), from the bridge design. No prices here: the plans and amounts
 * are RevenueCat's paywall, in the buyer's currency (PRE-375).
 */

export const SUPPORT_EMAIL = "support@tryprepit.app";

/** Day 1 is today; the reminder email goes on day 4 and the first charge on day 8. */
export function trialDay(day: number, from = new Date()): Date {
  const date = new Date(from);
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + day - 1);
  return date;
}

export const shortDate = (date: Date) =>
  date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
export const longDate = (date: Date) =>
  date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

/** A white card on the page, the site's tile radius. */
export function BridgeCard({ children, className, labelledBy }: { children: ReactNode; className?: string; labelledBy?: string }) {
  return (
    <section aria-labelledby={labelledBy} className={`flex flex-col gap-4 rounded-tile border border-line bg-surface p-5 ${className ?? ""}`}>
      {children}
    </section>
  );
}

/** Progress: quiz visitors already have their plan, landing visitors start at the free trial. */
export function BridgeProgress({ from, current }: { from: BridgeSource; current: "trial" | "app" }) {
  const labels = from === "quiz" ? ["Plan ready", "Free trial", "Get the app"] : ["Free trial", "Get the app"];
  const active = labels.indexOf(current === "trial" ? "Free trial" : "Get the app");
  return (
    <ol
      aria-label="Progress"
      className="grid gap-1.5 text-[12px] font-medium text-ink-muted"
      style={{ gridTemplateColumns: `repeat(${labels.length}, minmax(0, 1fr))` }}
    >
      {labels.map((label, index) => {
        const state = index < active ? "done" : index === active ? "current" : "todo";
        return (
          <li key={label} aria-current={state === "current" ? "step" : undefined} className="flex flex-col gap-1.5">
            <span
              aria-hidden
              className={`h-1 rounded-full ${
                state === "done" ? "bg-primary" : state === "current" ? "bg-[linear-gradient(90deg,var(--color-primary)_35%,var(--color-line)_35%)]" : "bg-line"
              }`}
            />
            <span className={state === "todo" ? "" : "text-ink"}>
              {state === "done" && <span aria-hidden>✓ </span>}
              {label}
              {state === "done" && <span className="sr-only"> (done)</span>}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

/** Eyebrow, headline and lead, left-aligned as in the design. */
export function BridgeHead({
  eyebrow,
  title,
  lead,
  children,
}: {
  eyebrow: string;
  title: ReactNode;
  lead?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-eyebrow font-bold uppercase tracking-[0.12em]">
        <span className="text-gradient-brand">{eyebrow}</span>
      </p>
      <h1 className="font-display text-section text-ink text-balance">{title}</h1>
      {lead && <p className="text-lead text-ink-secondary text-pretty">{lead}</p>}
      {children}
    </div>
  );
}

/** The quiz's plan: chips and daily targets from their answers. */
export function QuizPlanCard({
  name,
  summary,
}: {
  name?: string;
  summary?: { tags?: string[]; calories?: number; proteinGrams?: number };
}) {
  return (
    <BridgeCard labelledBy="bridge-plan">
      <div className="flex items-baseline justify-between gap-3">
        <h2 id="bridge-plan" className="font-display text-[21px] leading-tight text-ink">
          {name ? `${name}’s plan` : "Your plan"}
        </h2>
        <span className="text-small text-ink-muted">From your answers</span>
      </div>
      {summary?.tags && (
        <ul className="flex flex-wrap gap-2">
          {summary.tags.map((tag) => (
            <li key={tag} className="rounded-full bg-surface-raised px-3 py-1 text-small text-ink-secondary">
              {tag}
            </li>
          ))}
        </ul>
      )}
      {(summary?.calories || summary?.proteinGrams) && (
        <div className="grid grid-cols-2 gap-3">
          {summary.calories && (
            <p className="flex flex-col text-small text-ink-muted">
              <b className="font-display text-title text-ink">{summary.calories.toLocaleString("en-US")}</b>kcal a day
            </p>
          )}
          {summary.proteinGrams && (
            <p className="flex flex-col text-small text-ink-muted">
              <b className="font-display text-title text-ink">{summary.proteinGrams} g</b>protein a day
            </p>
          )}
        </div>
      )}
      <p className="text-small text-ink-muted">Sign in and it’s waiting in the app, so you skip the setup.</p>
    </BridgeCard>
  );
}

/** The dated free week: nothing today, reminder on day 4, first charge on day 8. */
export function FreeWeekTimeline({ today }: { today: Date }) {
  const rows = [
    {
      day: "Today",
      date: trialDay(1, today),
      title: "Session 1: Getting to know you",
      body: "About 5 minutes in the app. Everything is unlocked, and there’s nothing to pay.",
    },
    {
      day: "Day 4",
      date: trialDay(4, today),
      title: "We email you a reminder",
      body: "4 days before any charge. Session 2 opens once you’ve logged about 3 days.",
    },
    {
      day: "Day 7",
      date: trialDay(7, today),
      title: "Session 3: Week-in-review",
      body: "Your first weekly check-in. Keep PrepIt, or cancel and pay nothing.",
    },
    {
      day: "Day 8",
      date: trialDay(8, today),
      title: "First payment",
      body: "For the plan you choose next, only if you keep PrepIt.",
    },
  ];
  return (
    <BridgeCard labelledBy="bridge-week">
      <h2 id="bridge-week" className="font-display text-[21px] leading-tight text-ink">
        Your free week
      </h2>
      <ol className="flex flex-col">
        {rows.map((row, index) => (
          <li key={row.day} className="relative grid grid-cols-[18px_76px_minmax(0,1fr)] gap-3 pb-4 last:pb-0">
            {index < rows.length - 1 && <span aria-hidden className="absolute left-[8px] top-4 h-full w-px bg-line-strong" />}
            <span
              aria-hidden
              className={`relative mt-1 h-[18px] w-[18px] rounded-full border-2 ${
                index === 0 ? "border-primary bg-primary" : index === rows.length - 1 ? "border-accent bg-surface" : "border-line-strong bg-surface"
              }`}
            />
            <span className="flex flex-col text-small text-ink-muted">
              <b className="font-bold text-ink">{row.day}</b>
              {shortDate(row.date)}
            </span>
            <span className="flex flex-col text-small text-ink-secondary">
              <b className="font-bold text-ink">{row.title}</b>
              {row.body}
            </span>
          </li>
        ))}
      </ol>
    </BridgeCard>
  );
}

/**
 * The one terms sentence under the buttons: first charge, renewal, reminder and
 * cancel deadline. The plan and its price come next, on the paywall (PRE-375).
 */
export function TrialTerms({ today }: { today: Date }) {
  const charge = longDate(trialDay(8, today));
  return (
    <p className="text-[13px] leading-snug text-ink-muted">
      Nothing to pay today. Free for {TRIAL_DAYS} days, then the plan you choose next, first charged on{" "}
      <b className="font-bold text-ink">{charge}</b> and renewing until you cancel. You’ll see the price in your currency
      before you start. We’ll email you a reminder on {longDate(trialDay(4, today))}. Cancel online any time before{" "}
      {charge} and you pay nothing. By continuing you agree to the{" "}
      <Link href="/terms-and-conditions" className="underline underline-offset-4 hover:text-ink">
        Terms
      </Link>{" "}
      and{" "}
      <Link href="/subscription-policy" className="underline underline-offset-4 hover:text-ink">
        Subscription Policy
      </Link>
      .
    </p>
  );
}

function Icon({ path }: { path: string }) {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 text-accent-text" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={path} />
    </svg>
  );
}

const ICONS = {
  card: "M3 8a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3zM3 10h18M7 15h3",
  bell: "M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15zM10 20a2 2 0 0 0 4 0",
  cancel: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM9 9l6 6M15 9l-6 6",
  phone: "M9.5 2.5h5A2.5 2.5 0 0 1 17 5v14a2.5 2.5 0 0 1-2.5 2.5h-5A2.5 2.5 0 0 1 7 19V5a2.5 2.5 0 0 1 2.5-2.5zM11 18.5h2",
};

/** Three reassurances and the iPhone-only line. */
export function Assurances({ trial = true }: { trial?: boolean }) {
  const items = trial
    ? [
        { icon: ICONS.card, label: "Nothing to pay today" },
        { icon: ICONS.bell, label: "Reminder email on day 4" },
        { icon: ICONS.cancel, label: "Cancel online, any time" },
      ]
    : [
        { icon: ICONS.cancel, label: "Cancel online, any time" },
        { icon: ICONS.phone, label: "iPhone app" },
        { icon: ICONS.card, label: "Secure payment by Stripe" },
      ];
  return (
    <div className="flex flex-col gap-3">
      <ul className="grid grid-cols-3 gap-2">
        {items.map((item) => (
          <li key={item.label} className="flex flex-col gap-1.5 rounded-tile border border-line bg-surface p-3 text-[13px] font-medium leading-tight text-ink-secondary">
            <Icon path={item.icon} />
            {item.label}
          </li>
        ))}
      </ul>
      {trial && (
        <p className="flex items-start gap-2 text-small text-ink-muted">
          <Icon path={ICONS.phone} />
          PrepIt is an iPhone app. Android is coming soon.
        </p>
      )}
    </div>
  );
}

/** Real app screens of the consultation. */
export function ConsultationShots() {
  return (
    <section aria-labelledby="bridge-shots" className="flex flex-col gap-4">
      <h2 id="bridge-shots" className="font-display text-[21px] leading-tight text-ink">
        Your consultation happens in the app
      </h2>
      <div className="grid grid-cols-2 gap-3">
        <figure className="flex flex-col items-center gap-2">
          <DeviceFrame
            className="[--device-w:100%]"
            capture={appCapture("02-chat-chart", "PrepIt app: the Nutritionist chat showing protein per day for the last week")}
          />
          <figcaption className="text-center text-[13px] text-ink-muted">Sessions 1 and 2 are a chat with your AI nutritionist</figcaption>
        </figure>
        <figure className="flex flex-col items-center gap-2">
          <DeviceFrame
            className="[--device-w:100%]"
            capture={appCapture("11-check-in-report", "PrepIt app: a weekly check-in report, Your steadiest week yet")}
          />
          <figcaption className="text-center text-[13px] text-ink-muted">Session 3 ends with your first weekly check-in</figcaption>
        </figure>
      </div>
    </section>
  );
}

/** Support, legal links. */
/**
 * The bridge pages' own short header (the site header is hidden there): the
 * logo and, on the right, `children` such as "Already a member? Sign in".
 * No App Store button, so nothing skips the sign-in.
 */
export function BridgeHeader({ children }: { children?: ReactNode }) {
  return (
    <header className="flex min-h-11 items-center justify-between gap-4">
      <Link
        href="/"
        className="flex h-11 items-center text-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus"
      >
        <LongLogo className="h-7 w-auto text-primary" />
      </Link>
      {children}
    </header>
  );
}

export function BridgeFooter() {
  return (
    <footer className="flex flex-col gap-2 border-t border-line pt-5 text-small text-ink-muted">
      <span>
        Questions? <span className="select-all font-medium text-ink">{SUPPORT_EMAIL}</span>
      </span>
      <span className="flex flex-wrap gap-x-3">
        <Link href="/terms-and-conditions" className="underline underline-offset-4 hover:text-ink">
          Terms
        </Link>
        <Link href="/privacy-policy" className="underline underline-offset-4 hover:text-ink">
          Privacy
        </Link>
        <Link href="/subscription-policy" className="underline underline-offset-4 hover:text-ink">
          Subscription Policy
        </Link>
      </span>
    </footer>
  );
}

/** A message by the buttons: info (neutral) or warn (amber). */
export function BridgeAlert({
  tone = "info",
  title,
  children,
  actions,
}: {
  tone?: "info" | "warn" | "success";
  title: ReactNode;
  children?: ReactNode;
  actions?: ReactNode;
}) {
  const toneClass =
    tone === "warn" ? "border-energy bg-energy/20" : tone === "success" ? "border-line bg-surface" : "border-line bg-surface";
  return (
    <div role="status" className={`flex flex-col gap-2 rounded-tile border p-4 text-left text-small text-ink-secondary ${toneClass}`}>
      <b className="font-bold text-ink">{title}</b>
      {children}
      {actions && <div className="flex flex-wrap gap-3">{actions}</div>}
    </div>
  );
}
