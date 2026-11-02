import Link from "next/link";
import type { ReactNode } from "react";
import LongLogo from "@/components/ui/LongLogo";
import type { BridgeSource } from "@/lib/funnel/params";
import { WEB_REMINDER_EMAIL_LIVE } from "@/lib/pricing";

/**
 * The pieces of the shared bridge (PRE-323) and the "You're in" page
 * (PRE-325), from the bridge design. No prices here: the plans and amounts
 * are RevenueCat's paywall, in the buyer's currency (PRE-375).
 */

export const SUPPORT_EMAIL = "support@tryprepit.app";

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
        ...(WEB_REMINDER_EMAIL_LIVE ? [{ icon: ICONS.bell, label: "Reminder email on day 4" }] : []),
        { icon: ICONS.cancel, label: "Cancel online, any time" },
      ]
    : [
        { icon: ICONS.cancel, label: "Cancel online, any time" },
        { icon: ICONS.phone, label: "iPhone app" },
        { icon: ICONS.card, label: "Secure payment by Stripe" },
      ];
  return (
    <div className="flex flex-col gap-3">
      <ul className="grid gap-2" style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}>
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

/** `soldBy`: the company that bills this visitor (the cart, PRE-437). */
export function BridgeFooter({ soldBy }: { soldBy?: string } = {}) {
  return (
    <footer className="flex flex-col gap-2 border-t border-line pt-5 text-small text-ink-muted">
      {soldBy && <span>Sold by {soldBy}.</span>}
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
