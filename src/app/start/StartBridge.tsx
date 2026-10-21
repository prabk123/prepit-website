"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import Checkout from "@/app/checkout/Checkout";
import EmailInUseNotice from "@/components/account/EmailInUseNotice";
import SignInButtons from "@/components/account/SignInButtons";
import { useSaveWebSignup } from "@/components/account/useSaveWebSignup";
import { useWebSession } from "@/components/account/useWebSession";
import {
  Assurances,
  BridgeAlert,
  BridgeFooter,
  BridgeHead,
  BridgeHeader,
  BridgeProgress,
  ConsultationShots,
  DueSummary,
  FreeWeekTimeline,
  PlanChooser,
  QuizPlanCard,
  SUPPORT_EMAIL,
  TrialTerms,
} from "@/components/bridge/BridgeParts";
import SignedInChip from "@/components/bridge/SignedInChip";
import FaqAccordion from "@/components/pricing/FaqAccordion";
import { PRIMARY_BUTTON_CLASS, TEXT_BUTTON_CLASS } from "@/components/ui/buttons";
import { openAppUrl } from "@/lib/appStore";
import { providerOf, signOutOfWebsite } from "@/lib/firebase/auth";
import { readBridgeHandoff, writeBridgeVisit, type BridgeHandoff } from "@/lib/funnel/bridgeHandoff";
import { parseBridgeSource, parseFunnelId, type BridgeSource } from "@/lib/funnel/params";
import { parsePlanId, type PlanId } from "@/lib/pricing";
import { trackSignupRegistration } from "@/lib/metaPixel";
import { resetWebUser, trackWebFunnelEvent, WEB_FUNNEL_EVENTS } from "@/lib/webFunnelAnalytics";

function faqItems(from: BridgeSource) {
  return [
    {
      id: "bridge-when-pay",
      question: "When do I pay?",
      answer:
        "Not today. We email you a reminder on day 4. If you keep PrepIt after your free 7 days, your first payment is on day 8, and it renews until you cancel.",
    },
    {
      id: "bridge-cancel",
      question: "How do I cancel?",
      answer: "Online, any time, at tryprepit.app/account. Cancel before day 8 and you pay nothing.",
    },
    {
      id: "bridge-get-app",
      question: "How do I get PrepIt on my iPhone?",
      answer: `Next you’ll download PrepIt from the App Store and sign in with the same Apple or Google account. ${
        from === "quiz" ? "Your plan and free week are already there, so you skip the setup." : "Your free week is already on it."
      }`,
    },
    {
      id: "bridge-why-apple-google",
      question: "Why Apple or Google?",
      answer: `It keeps ${from === "quiz" ? "your plan, your trial" : "your trial"} and the app on one account, with no password to make. With Apple you can keep your email private.`,
    },
    {
      id: "bridge-medical",
      question: "Is this medical advice?",
      answer: "No. PrepIt is a coach, not a doctor. For medical conditions, talk to a professional.",
    },
  ];
}

/** The short wait after sign-in while the account and answers are saved. */
function SavingPlan({ from, provider }: { from: BridgeSource; provider: string | null }) {
  const steps = ["Account ready", ...(from === "quiz" ? ["Quiz answers saved to your plan"] : []), "Checking your free week"];
  return (
    <div role="status" className="flex flex-col items-center gap-4 py-10 text-center">
      <h1 className="font-display text-title text-ink">{from === "quiz" ? "Saving your plan" : "Checking your account"}</h1>
      {provider && <p className="text-small text-ink-muted">Signed in with {provider}</p>}
      <ul className="flex flex-col gap-2 text-left text-small text-ink-secondary">
        {steps.map((step) => (
          <li key={step} className="flex items-center gap-2">
            <span aria-hidden className="h-2 w-2 animate-pulse rounded-full bg-primary motion-reduce:animate-none" />
            {step}
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * The shared bridge (PRE-323), from the bridge design, for the landing page
 * and the quiz: one page whose header follows `from`. Before sign-in it shows
 * the dated free week, the plans, what's due today and the sign-in buttons.
 * After sign-in the quiz's answers are saved to the account, then members
 * get their own page, people who had a trial get "Welcome back", and
 * everyone else goes on to RevenueCat's checkout and then "You're in".
 */
export default function StartBridge() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const from = parseBridgeSource(params.get("from"));
  const funnelId = parseFunnelId(params.get("funnel"));
  const plan: PlanId = parsePlanId(params.get("plan")) ?? "annual";
  const context = useMemo(() => ({ funnel_id: funnelId, plan, from }), [funnelId, plan, from]);

  const { session, reloadAccount } = useWebSession();
  const save = useSaveWebSignup(session, funnelId, reloadAccount);
  // The quiz's answers live in this browser. useSearchParams keeps this page
  // out of the server render, so reading storage here can't mismatch.
  const [handoff, setHandoff] = useState<BridgeHandoff | null>(() => readBridgeHandoff());
  // PrepIt is iPhone-only: Android visitors stop before any card is taken.
  const [android] = useState(() => typeof navigator !== "undefined" && /Android/i.test(navigator.userAgent));
  const [androidContinue, setAndroidContinue] = useState(false);
  const [today] = useState(() => new Date());
  const viewTracked = useRef(false);
  const signInTracked = useRef<string | null>(null);

  useEffect(() => {
    if (viewTracked.current) return;
    viewTracked.current = true;
    trackWebFunnelEvent(WEB_FUNNEL_EVENTS.bridgeView, { ...context, has_quiz_answers: handoff !== null, android });
  }, [context, handoff, android]);

  const account = session.status === "signedIn" ? session.account : null;
  const summary = account?.status === "ready" ? account.summary : null;

  // One sign-up result per signed-in uid on this page.
  useEffect(() => {
    if (session.status !== "signedIn" || !summary || signInTracked.current === session.user.uid) return;
    signInTracked.current = session.user.uid;
    if (summary.emailInUse) {
      trackWebFunnelEvent(WEB_FUNNEL_EVENTS.signInFailed, {
        ...context,
        reason: "email_in_use",
        existing_provider: summary.emailInUse.existingProvider,
      });
      return;
    }
    trackWebFunnelEvent(WEB_FUNNEL_EVENTS.signupSuccess, {
      ...context,
      has_account: summary.hasAccount,
      is_subscribed: summary.isSubscribed,
      has_quiz_answers: handoff !== null,
    });
    // New to PrepIt (no app account yet): a registration for Meta, with no details.
    if (!summary.hasAccount) trackSignupRegistration(session.user.uid);
  }, [session, summary, context, handoff]);

  const accountError = account?.status === "error" ? account.code : null;
  useEffect(() => {
    if (accountError) trackWebFunnelEvent(WEB_FUNNEL_EVENTS.bridgeError, { ...context, code: accountError });
  }, [accountError, context]);

  // The "You're in" page after checkout reads this (Checkout owns the redirect).
  const atCheckout = Boolean(summary && !summary.isSubscribed && !summary.emailInUse && save.status === "done");
  const trial = !summary?.hasUsedTrial;
  useEffect(() => {
    if (atCheckout) writeBridgeVisit({ from, trial });
  }, [atCheckout, from, trial]);

  function choosePlan(next: PlanId) {
    const query = new URLSearchParams(params.toString());
    query.set("plan", next);
    router.replace(`${pathname}?${query}`, { scroll: false });
  }

  async function signOut(keepQuizAnswers = false) {
    await signOutOfWebsite({ keepQuizAnswers });
    if (!keepQuizAnswers) setHandoff(null);
    resetWebUser();
  }

  const name =
    (session.status === "signedIn" ? session.user.displayName?.trim().split(/\s+/)[0] : undefined) || handoff?.firstName;
  const provider = session.status === "signedIn" ? providerOf(session.user) : null;
  const providerName = provider === "apple" ? "Apple" : provider === "google" ? "Google" : null;
  const chip =
    session.status === "signedIn" ? (
      <SignedInChip provider={provider} email={session.user.email} onSignOut={() => void signOut()} />
    ) : null;

  const intro =
    from === "quiz" ? (
      <>
        <BridgeHead
          eyebrow="Your plan is ready"
          title={name ? `${name}, your free 7 days start today.` : "Your free 7 days start today."}
          lead="Your 3-session consultation with your AI nutritionist is included. You pay $0 today."
        />
        <QuizPlanCard name={name} summary={handoff?.planSummary} />
      </>
    ) : (
      <BridgeHead
        eyebrow="Your AI nutritionist"
        title="Your free 7 days start today."
        lead="Including a 3-session nutrition consultation with your AI nutritionist. You pay $0 today."
      />
    );

  if (session.status === "loading") {
    return (
      <>
        <BridgeHeader />
        <p className="text-body text-ink-secondary">Loading…</p>
      </>
    );
  }

  if (session.status === "signedOut" && android && !androidContinue) {
    return (
      <>
        <BridgeHeader />
        <BridgeProgress from={from} current="trial" />
        <BridgeHead
          eyebrow="Your AI nutritionist"
          title="PrepIt is on iPhone for now."
          lead="Android is coming soon. We won’t take a card for an app you can’t use yet."
        />
        <button type="button" className="w-fit text-left text-small text-ink-secondary" onClick={() => setAndroidContinue(true)}>
          Have an iPhone too? <u className="font-bold text-ink">Continue on this page</u>
        </button>
        <BridgeFooter />
      </>
    );
  }

  if (session.status === "signedOut" || summary?.emailInUse) {
    return (
      <>
        <BridgeHeader>
          <button
            type="button"
            className="text-small text-ink-secondary"
            onClick={() => document.getElementById("signin")?.scrollIntoView({ block: "start" })}
          >
            Already a member? <u className="font-bold text-ink">Sign in</u>
          </button>
        </BridgeHeader>
        <BridgeProgress from={from} current="trial" />
        {intro}
        <FreeWeekTimeline plan={plan} today={today} />
        <PlanChooser plan={plan} onChange={choosePlan} />
        <section id="signin" aria-labelledby="signin-heading" className="flex scroll-mt-28 flex-col gap-3">
          <h2 id="signin-heading" className="font-display text-title text-ink">
            Start my free 7 days
          </h2>
          <DueSummary plan={plan} today={today} />
          {summary?.emailInUse ? (
            <EmailInUseNotice
              existingProvider={summary.emailInUse.existingProvider}
              purpose={from === "quiz" ? "your plan and trial stay in one place" : "your trial stays in one place"}
              onSignOut={() => void signOut(true)}
            />
          ) : (
            <>
              <p className="text-small text-ink-secondary">
                Choose the account to save {from === "quiz" ? "your plan and trial" : "your free week"} to. You’ll sign
                in to the PrepIt app with the same one.
              </p>
              <SignInButtons context={context} loginHint={handoff?.email} />
            </>
          )}
          <TrialTerms plan={plan} today={today} />
        </section>
        <Assurances />
        <ConsultationShots />
        <section aria-labelledby="bridge-faq" className="flex flex-col gap-2">
          <h2 id="bridge-faq" className="font-display text-[21px] leading-tight text-ink">
            Questions
          </h2>
          <FaqAccordion items={faqItems(from)} trackingSource="bridge-faq" defaultOpenId="bridge-get-app" singleColumn />
        </section>
        <BridgeFooter />
      </>
    );
  }

  if (account?.status === "error") {
    return (
      <div className="flex flex-col items-center gap-4 py-10 text-center">
        <div className="self-stretch text-left">
          <BridgeHeader />
        </div>
        <h1 className="font-display text-title text-ink">We couldn’t start your free week</h1>
        <p className="text-small text-ink-secondary">
          Something went wrong on our side. You have not been charged{from === "quiz" ? ", and your plan is saved" : ""}.
        </p>
        <button type="button" className={PRIMARY_BUTTON_CLASS} onClick={reloadAccount}>
          Try again
        </button>
        <p className="text-small text-ink-muted">
          Still stuck? Email <span className="select-all font-bold text-ink">{SUPPORT_EMAIL}</span>.
        </p>
        {chip}
      </div>
    );
  }

  if (!summary || save.status !== "done") {
    return (
      <>
        <BridgeHeader />
        <SavingPlan from={from} provider={providerName} />
      </>
    );
  }

  // Already paying (any store): never a checkout.
  if (summary.isSubscribed) {
    return (
      <>
        <BridgeHeader />
        <BridgeHead
          eyebrow="Welcome back"
          title="You’re already a member."
          lead="Your PrepIt membership is active on this account. There’s nothing new to pay."
        >
          {chip}
        </BridgeHead>
        <a
          href={openAppUrl(provider)}
          className={PRIMARY_BUTTON_CLASS}
          onClick={() => trackWebFunnelEvent(WEB_FUNNEL_EVENTS.handoffOpenApp, { ...context, provider, member: true })}
        >
          Open PrepIt
        </a>
        <p className="text-small text-ink-muted">
          See your subscription at{" "}
          <a href="/account" className={TEXT_BUTTON_CLASS}>
            tryprepit.app/account
          </a>
          .
        </p>
        <BridgeFooter />
      </>
    );
  }

  const welcomeBack = summary.hasUsedTrial;
  return (
    <>
      <BridgeHeader />
      <BridgeProgress from={from} current="trial" />
      {welcomeBack ? (
        <BridgeHead
          eyebrow="Welcome back"
          title="Pick up where you left off."
          lead="You’ve had a free week before, so this time your plan starts today. Your account and past logs are still here."
        />
      ) : (
        <BridgeAlert tone="success" title={save.accountCreated ? "Your plan is saved." : "You’re signed in."}>
          Your free 7 days are one step away. Nothing was charged.
        </BridgeAlert>
      )}
      {/* Checkout names the signed-in account under the paywall, with Sign out. */}
      <div className="rounded-tile border border-line bg-surface p-4 sm:p-6">
        <div className="flex w-full flex-col items-center gap-6 text-center">
          <Checkout />
        </div>
      </div>
      <Assurances trial={!welcomeBack} />
      <BridgeFooter />
    </>
  );
}
