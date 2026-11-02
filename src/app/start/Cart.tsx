"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import EmailInUseNotice from "@/components/account/EmailInUseNotice";
import SignInButtons, { useSignIn } from "@/components/account/SignInButtons";
import { BridgeFooter, BridgeHeader, BridgeProgress } from "@/components/bridge/BridgeParts";
import FaqAccordion from "@/components/pricing/FaqAccordion";
import { AppleLogo } from "@/components/ui/AppStoreButton";
import { PRIMARY_BUTTON_CLASS } from "@/components/ui/buttons";
import { isAppleSignInEnabled } from "@/lib/firebase/config";
import { isInAppBrowser } from "@/lib/firebase/auth";
import type { BridgeHandoff } from "@/lib/funnel/bridgeHandoff";
import { cartDates, cartTermsParts, cartWho, type CartMarket } from "@/lib/funnel/cart";
import { isCartEmailPlanEnabled, showCartEmailPlan } from "@/lib/funnel/cartLead";
import type { BridgeSource } from "@/lib/funnel/params";
import type { ExistingProvider } from "@/lib/prepitApi";
import { WEB_REMINDER_EMAIL_LIVE } from "@/lib/pricing";
import { WEB_BILLING_SELLER_NAMES } from "@/lib/revenuecat/sellers";
import { trackWebFunnelEvent, WEB_FUNNEL_EVENTS } from "@/lib/webFunnelAnalytics";
import CartEmailPlan from "./CartEmailPlan";

/**
 * The cart (PRE-437): `/start` before sign-in, from Charlie's cart v6.1 (web
 * funnel v9). The order is fixed by the design: the free consultation and
 * $0 today, the plan card, the next step with both prices, sign-in, the four
 * risk reducers and the terms, then trust, three questions, "Not ready? Email
 * me my plan" (quiz only, PRE-439) and the footer.
 * The plan itself is picked on RevenueCat's paywall after sign-in, on this
 * same page (StartBridge renders Checkout), so there's no plan picker here.
 * On a wide screen the order sits in a sticky column on the right; on a phone
 * a sticky bar offers the first sign-in button once the in-page one scrolls away.
 */

type CartProps = {
  from: BridgeSource;
  context: Record<string, string | null>;
  handoff: BridgeHandoff | null;
  market: CartMarket;
  /** The visitor's country from the server's geo header, for "Email me my plan" (PRE-439). */
  country?: string | null;
  today: Date;
  /** After sign-in, while the account and answers are saved: the button's own "Saving your plan…". */
  saving: boolean;
  /** The signed-in email already signs in to PrepIt another way. */
  emailInUse?: { existingProvider: ExistingProvider; onSignOut: () => void } | null;
};

function Icon({ children }: { children: ReactNode }) {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      {children}
    </svg>
  );
}

const ICONS = {
  zero: (
    <Icon>
      <rect x="3" y="6" width="18" height="12" rx="2.5" />
      <path d="M3 10h18M7 15h3" />
    </Icon>
  ),
  mail: (
    <Icon>
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 8 3 8H3s3-1 3-8" />
      <path d="M10 20a2 2 0 0 0 4 0" />
    </Icon>
  ),
  cancel: (
    <Icon>
      <circle cx="12" cy="12" r="9" />
      <path d="M9 9l6 6M15 9l-6 6" />
    </Icon>
  ),
  plan: (
    <Icon>
      <rect x="4" y="4" width="16" height="16" rx="3" />
      <path d="M8 12l3 3 5-6" />
    </Icon>
  ),
};

/** "$0 today" as the biggest number, with the reminder and first payment dates beside it. */
function ZeroToday({ zero, dates }: { zero: string; dates: ReturnType<typeof cartDates> }) {
  return (
    <div
      role="group"
      aria-label="What you pay"
      className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-5 rounded-tile border border-line bg-surface px-5 py-4"
    >
      <p className="flex flex-col font-display text-[60px] font-medium leading-[0.9] tracking-[-0.025em] text-ink tabular-nums">
        {zero}
        <span className="mt-2 font-sans text-[12px] font-bold uppercase leading-none tracking-[0.12em]">today</span>
      </p>
      <div className="flex flex-col gap-2.5 border-l border-line pl-5 text-[13px] leading-snug text-ink-muted">
        {WEB_REMINDER_EMAIL_LIVE && (
          <span>
            <b className="block text-small font-bold text-ink">Reminder email</b>
            {dates.reminderShort}
          </span>
        )}
        <span>
          <b className="block text-small font-bold text-ink">First payment {dates.chargeShort}</b>
          Only if you keep PrepIt
        </span>
      </div>
    </div>
  );
}

const SESSIONS = [
  { title: "Getting to know you", when: "Today · about 5 minutes", body: "Your routine, your goal and what a normal day looks like." },
  { title: "What I’ve noticed so far", when: "After 3 days of meals", body: "The patterns in your meals, and one focus you pick together." },
  { title: "Week-in-review", when: "Around day 7", body: "A review of your week, and a custom meal plan for the next one." },
];

/** The one-bite still with the visitor's "For…" line, what they said, the three sessions and (quiz) their targets. */
function PlanCard({ from, handoff }: { from: BridgeSource; handoff: BridgeHandoff | null }) {
  const who = cartWho(from, handoff?.startingPoint);
  const summary = from === "quiz" ? handoff?.planSummary : undefined;
  const targets = [
    summary?.calories ? `${summary.calories.toLocaleString("en-US")} kcal` : null,
    summary?.proteinGrams ? `${summary.proteinGrams} g protein` : null,
  ].filter(Boolean);
  return (
    <section aria-labelledby="cart-plan" className="overflow-hidden rounded-tile border border-line bg-surface">
      <div className="relative h-[150px] bg-[#eadccf] lg:h-[240px]">
        <Image
          src="/cart/one-bite-1080.webp"
          alt="Seven spoons, each holding one bite of a different everyday food, on cream"
          fill
          priority
          sizes="(min-width: 1024px) 600px, 100vw"
          className="object-cover object-[50%_20%] dark:brightness-[0.8] dark:saturate-[0.92]"
        />
        <p className="absolute bottom-3 left-3 max-w-[calc(100%-24px)] whitespace-nowrap rounded-[12px] border border-white/60 bg-surface/80 px-3 py-2 font-display text-[16px] font-medium leading-tight text-ink backdrop-blur-md">
          {who.line}
        </p>
      </div>
      <div className="flex flex-col gap-3 px-[18px] pb-[18px] pt-4">
        {who.said && <p className="text-[15px] italic leading-relaxed text-ink-secondary">{who.said}</p>}
        <p className="text-eyebrow font-bold uppercase tracking-[0.12em]">
          <span className="text-gradient-brand">Your free consultation</span>
        </p>
        <h2 id="cart-plan" className="font-display text-[19px] font-medium leading-tight text-ink text-balance">
          3 short chats with your nutritionist.
        </h2>
        <ol aria-label="Your three consultation sessions" className="flex flex-col">
          {SESSIONS.map((session, index) => (
            <li key={session.title} className="relative grid grid-cols-[28px_minmax(0,1fr)] gap-3 pb-3.5 last:pb-0">
              {index < SESSIONS.length - 1 && <span aria-hidden className="absolute bottom-0 left-[13.5px] top-7 w-px bg-line-strong" />}
              <span
                aria-hidden
                className={`grid h-7 w-7 place-items-center rounded-full font-display text-[13px] font-semibold ${
                  index === 0 ? "bg-primary text-on-primary" : "bg-surface text-ink shadow-[inset_0_0_0_1.5px_var(--color-ink)]"
                }`}
              >
                {index + 1}
              </span>
              <div>
                <b className="block text-[15px] font-bold text-ink">{session.title}</b>
                <span className="mt-0.5 block text-[11px] font-bold uppercase leading-snug tracking-[0.08em] text-ink-muted">
                  {session.when}
                </span>
                <p className="mt-1 text-small leading-snug text-ink-secondary">{session.body}</p>
              </div>
            </li>
          ))}
        </ol>
        {targets.length > 0 && (
          <div className="flex flex-wrap justify-between gap-x-2.5 gap-y-1.5 border-t border-line pt-2.5 text-[13px] text-ink-muted">
            <span>Saved to your account when you continue</span>
            <b className="font-bold text-ink tabular-nums">{targets.join(" · ")}</b>
          </div>
        )}
      </div>
    </section>
  );
}

/** "Choose your plan on the next page." and both prices as plain text, by seller. */
function NextStep({ market }: { market: CartMarket }) {
  const p = market.prices;
  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex flex-wrap items-center gap-2.5">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.08em] text-on-primary">
          <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-accent" />
          Next step
        </span>
        <h2 className="font-display text-[21px] font-medium leading-tight text-ink">Choose your plan on the next page.</h2>
      </div>
      <p className="text-small text-ink-secondary">
        Nothing to pay today.{" "}
        {p ? "These are the prices if you keep PrepIt after your free week." : "You’ll see the price before you start."}
      </p>
      {p && (
        <ul aria-label="Prices after the free week" className="flex flex-col border-t border-line">
          <li className="flex items-baseline justify-between gap-3 border-b border-line py-2.5 text-[15px] text-ink-secondary">
            <b className="font-bold text-ink">Annual</b>
            <span className="text-right tabular-nums">
              <b className="font-semibold text-ink">{p.annualPerMonth} a month</b>
              <small className="block text-[13px] text-ink-muted">billed yearly at {p.annual}</small>
            </span>
          </li>
          <li className="flex items-baseline justify-between gap-3 border-b border-line py-2.5 text-[15px] text-ink-secondary">
            <b className="font-bold text-ink">Monthly</b>
            <span className="text-right tabular-nums">
              <b className="font-semibold text-ink">{p.monthly} a month</b>
              <small className="block text-[13px] text-ink-muted">billed monthly</small>
            </span>
          </li>
        </ul>
      )}
    </div>
  );
}

const LEGAL_LINK = "underline underline-offset-4 hover:text-ink";

/** The dated terms sentence, per market: the pieces from `cartTermsParts` (lib/funnel/cart.ts, tested there). */
function Terms({ market, today }: { market: CartMarket; today: Date }) {
  return (
    <p className="mt-1.5 text-[13px] leading-snug text-ink-muted">
      {cartTermsParts(market, today, WEB_REMINDER_EMAIL_LIVE).map((part, index) =>
        part.agree ? (
          <span key={index}>
            {" "}
            By continuing you agree to the{" "}
            <Link href="/terms-and-conditions" className={LEGAL_LINK}>
              Terms
            </Link>{" "}
            and{" "}
            <Link href="/subscription-policy" className={LEGAL_LINK}>
              Subscription Policy
            </Link>
            .
          </span>
        ) : part.strong ? (
          <b key={index} className="font-bold text-ink">
            {part.text}
          </b>
        ) : (
          <span key={index}>{part.text}</span>
        ),
      )}
    </p>
  );
}

/** The four risk reducers, the renewal line and the full terms behind a tap. */
function RiskReducers({ market, today }: { market: CartMarket; today: Date }) {
  const dates = cartDates(today);
  const p = market.prices;
  const rows = [
    { icon: ICONS.zero, title: `${p?.free ?? "Nothing"} today`, body: "Your free 7 days start now. Nothing is charged today." },
    WEB_REMINDER_EMAIL_LIVE
      ? { icon: ICONS.mail, title: "A reminder before you pay", body: `We email you on ${dates.reminderShort}, 4 days before any charge.` }
      : null,
    { icon: ICONS.cancel, title: "Cancel any time", body: `Online, in a few taps. Cancel before ${dates.chargeShort} and you pay nothing.` },
    { icon: ICONS.plan, title: "Annual or monthly: your choice", body: "You pick on the next page, after you sign in." },
  ].filter((row) => row !== null);
  return (
    <div className="flex flex-col gap-3">
      <ul aria-label="What to expect" className="flex flex-col gap-3">
        {rows.map((row) => (
          <li key={row.title} className="grid grid-cols-[36px_minmax(0,1fr)] items-start gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-surface-raised text-ink">{row.icon}</span>
            <span className="flex flex-col text-small text-ink-secondary">
              <b className="font-bold text-ink">{row.title}</b>
              {row.body}
            </span>
          </li>
        ))}
      </ul>
      <div className="text-[13px] leading-snug text-ink-muted">
        {p
          ? `Then ${p.annual} a year or ${p.monthly} a month from ${dates.chargeMonthDay}, renewing until you cancel. Prices in ${p.currencyName}. `
          : `Then the plan you choose, from ${dates.chargeMonthDay}, renewing until you cancel. `}
        <details className="inline [&[open]]:block">
          <summary className="inline cursor-pointer font-medium text-ink underline underline-offset-4">Full subscription terms</summary>
          <Terms market={market} today={today} />
        </details>
      </div>
    </div>
  );
}

function faqItems(from: BridgeSource, market: CartMarket, dates: ReturnType<typeof cartDates>) {
  const p = market.prices;
  const reminder = WEB_REMINDER_EMAIL_LIVE ? ` We email you a reminder on ${dates.reminderShort}.` : "";
  const price = p ? `: ${p.annual} for a year or ${p.monthly} for a month, the plan you choose next` : ", for the plan you choose next";
  return [
    {
      id: "bridge-when-pay",
      question: "When do I pay?",
      answer: `Not today.${reminder} If you keep PrepIt after your free 7 days, your first payment is on ${dates.chargeShort}${price}.`,
    },
    {
      id: "bridge-cancel",
      question: "How do I cancel?",
      answer: `Online, any time, at tryprepit.app/account, or in the app under Profile, then Account & Subscription, then Manage. Cancel before ${dates.chargeShort} and you pay nothing.`,
    },
    {
      id: "bridge-get-app",
      question: "How do I get PrepIt on my iPhone?",
      answer: `Next you download PrepIt from the App Store and tap Sign in with the same Apple or Google account. ${
        from === "quiz" ? "Your plan and free week are already there." : "Your free week is already on it."
      }`,
    },
  ];
}

/**
 * The phone's sticky bar: "$0 today" and the first sign-in button, once the
 * in-page buttons are out of view. Apple when it's on; otherwise Google, or a
 * jump back to the buttons inside an in-app browser where Google can't sign in.
 */
function StickyBar({
  visible,
  zero,
  context,
  loginHint,
  inAppBrowser,
}: {
  visible: boolean;
  zero: string;
  context: Record<string, string | null>;
  loginHint?: string;
  inAppBrowser: boolean;
}) {
  const { busy, start, message } = useSignIn({ context, loginHint, cartEvents: true, fromSticky: true });
  const apple = isAppleSignInEnabled();
  const provider = apple ? "apple" : inAppBrowser ? null : "google";
  const label = provider === "apple" ? "Continue with Apple" : provider === "google" ? "Continue with Google" : "Start my free 7 days";
  return (
    <div
      data-cart-sticky
      aria-hidden={!visible}
      inert={!visible}
      className={`fixed inset-x-0 bottom-0 z-30 flex flex-col gap-2 border-t border-line bg-page px-4 pb-[calc(14px+env(safe-area-inset-bottom))] pt-2.5 transition-transform duration-300 motion-reduce:transition-none lg:hidden ${
        visible ? "translate-y-0" : "translate-y-[110%]"
      }`}
    >
      <p className="text-center text-[13px] text-ink-secondary">
        <b className="font-bold text-ink">{zero} today</b> · Free 7-day consultation
      </p>
      {message && <p className="text-center text-[13px] text-ink-secondary">{message}</p>}
      <button
        type="button"
        className={`${PRIMARY_BUTTON_CLASS} h-[50px]`}
        disabled={busy !== null}
        onClick={() =>
          provider ? void start(provider) : document.getElementById("signin")?.scrollIntoView({ block: "center" })
        }
      >
        {provider === "apple" && <AppleLogo />}
        {busy ? "Signing in…" : label}
      </button>
    </div>
  );
}

export default function Cart({ from, context, handoff, market, country = null, today, saving, emailInUse }: CartProps) {
  const dates = cartDates(today);
  const zero = market.prices?.free ?? "$0";
  const quiz = from === "quiz";
  const buttonsRef = useRef<HTMLDivElement>(null);
  const [stickyVisible, setStickyVisible] = useState(false);
  const [inAppBrowser] = useState(() => typeof navigator !== "undefined" && isInAppBrowser(navigator.userAgent));
  const viewTracked = useRef(false);

  useEffect(() => {
    if (viewTracked.current) return;
    viewTracked.current = true;
    trackWebFunnelEvent(WEB_FUNNEL_EVENTS.cartView, {
      ...context,
      entry: from,
      market: market.seller,
      has_quiz_answers: handoff !== null,
      in_app_browser: inAppBrowser,
    });
  }, [context, from, market.seller, handoff, inAppBrowser]);

  // The sticky bar shows once the in-page buttons are out of view (above or below).
  useEffect(() => {
    const target = buttonsRef.current;
    if (!target || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(([entry]) => setStickyVisible(!entry.isIntersecting), { threshold: 0 });
    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  const showSticky = stickyVisible && !saving && !emailInUse;
  // "Not ready? Email me my plan" (PRE-439): quiz entry, before sign-in, while the plan email can go out.
  const emailPlan = !saving && !emailInUse && handoff && showCartEmailPlan(from, handoff, isCartEmailPlanEnabled()) ? handoff : null;
  const left = "lg:col-start-1";

  return (
    <div className="mx-auto flex w-full max-w-[560px] flex-col gap-6 lg:max-w-[1040px]">
      <BridgeHeader>
        <button
          type="button"
          className="text-small text-ink-secondary"
          onClick={() => document.getElementById("signin")?.scrollIntoView({ block: "center" })}
        >
          Already a member? <u className="font-bold text-ink">Sign in</u>
        </button>
      </BridgeHeader>
      <BridgeProgress from={from} current="trial" />
      <div className="flex flex-col gap-6 lg:grid lg:grid-flow-row-dense lg:grid-cols-[minmax(0,1fr)_400px] lg:items-start lg:gap-x-10">
        <div className={`flex flex-col gap-3 ${left}`}>
          <p className="text-eyebrow font-bold uppercase tracking-[0.12em]">
            <span className="text-gradient-brand">{quiz ? "Your plan is ready" : "Your AI nutritionist"}</span>
          </p>
          <h1 className="font-display text-section text-ink text-balance">
            Start your free <span className="whitespace-nowrap">7&#8209;day</span> consultation.
          </h1>
        </div>
        <div className={left}>
          <ZeroToday zero={zero} dates={dates} />
        </div>
        <div className={left}>
          <PlanCard from={from} handoff={handoff} />
        </div>

        <aside
          aria-label="Start your free week"
          className="flex flex-col gap-5 lg:sticky lg:top-8 lg:col-start-2 lg:row-span-6 lg:row-start-1 lg:self-start lg:rounded-tile lg:border lg:border-line lg:bg-surface lg:p-6"
        >
          <p className="hidden text-small text-ink-secondary lg:block">
            <b className="font-bold text-ink">{zero} today</b> · Free 7-day consultation
          </p>
          <NextStep market={market} />
          <section id="signin" aria-labelledby="signin-heading" className="flex scroll-mt-28 flex-col gap-3">
            <h2 id="signin-heading" className="text-small font-medium text-ink">
              Sign in with the account you’ll use on your iPhone.
            </h2>
            <div ref={buttonsRef}>
              {emailInUse ? (
                <EmailInUseNotice
                  existingProvider={emailInUse.existingProvider}
                  purpose={quiz ? "your plan and trial stay in one place" : "your trial stays in one place"}
                  onSignOut={emailInUse.onSignOut}
                />
              ) : (
                <SignInButtons
                  context={context}
                  loginHint={handoff?.email}
                  cartEvents
                  savingLabel={saving ? "Saving your plan…" : null}
                />
              )}
            </div>
          </section>
          <RiskReducers market={market} today={today} />
        </aside>

        <div className={`flex flex-col gap-2 text-small text-ink-secondary ${left}`}>
          <ul className="flex flex-col gap-2">
            {["A coach, not a doctor.", "Card details go to Stripe, never to PrepIt."].map((line) => (
              <li key={line} className="grid grid-cols-[16px_minmax(0,1fr)] gap-2">
                <span aria-hidden className="mt-1.5 h-[5px] w-[9px] -rotate-45 border-b-2 border-l-2 border-ink" />
                {line}
              </li>
            ))}
          </ul>
          <p className="text-[13px] leading-snug text-ink-muted">
            Grounded in nutrition science and behaviour-change research (Mifflin et al., 1990; Michie et al., 2009).
          </p>
        </div>
        <section aria-labelledby="bridge-faq" className={`flex flex-col gap-2 ${left}`}>
          <h2 id="bridge-faq" className="font-display text-[21px] leading-tight text-ink">
            Questions
          </h2>
          <FaqAccordion items={faqItems(from, market, dates)} trackingSource="bridge-faq" singleColumn />
        </section>
        {emailPlan && (
          <div className={left}>
            <CartEmailPlan handoff={emailPlan} country={country} context={context} />
          </div>
        )}
        <div className={left}>
          <BridgeFooter soldBy={WEB_BILLING_SELLER_NAMES[market.seller]} />
        </div>
      </div>
      {/* Room for the sticky bar so it never covers the footer. */}
      <div aria-hidden className="h-24 lg:hidden" />
      <StickyBar
        visible={showSticky}
        zero={zero}
        context={context}
        loginHint={handoff?.email}
        inAppBrowser={inAppBrowser}
      />
    </div>
  );
}

