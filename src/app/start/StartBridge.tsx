"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import EmailInUseNotice from "@/components/account/EmailInUseNotice";
import SignInButtons from "@/components/account/SignInButtons";
import { useSaveWebSignup } from "@/components/account/useSaveWebSignup";
import { useWebSession } from "@/components/account/useWebSession";
import BridgeSteps from "@/components/account/BridgeSteps";
import SectionHeading from "@/components/ui/SectionHeading";
import { PRIMARY_BUTTON_CLASS } from "@/components/ui/buttons";
import Checkout from "@/app/checkout/Checkout";
import { signOutOfWebsite } from "@/lib/firebase/auth";
import { readBridgeHandoff, type BridgeHandoff } from "@/lib/funnel/bridgeHandoff";
import { parseBridgeSource, parseFunnelId } from "@/lib/funnel/params";
import { parsePlanId, PLANS, TRIAL_DAYS } from "@/lib/pricing";
import { resetWebUser, trackWebFunnelEvent, WEB_FUNNEL_EVENTS } from "@/lib/webFunnelAnalytics";

/**
 * The bridge (PRE-323) for the landing page and the quiz: a header for where
 * they came from, sign in with Google or Apple, the quiz's answers saved to
 * their account, then the RevenueCat paywall (the checkout page's), which
 * goes on to "You're in" (/welcome).
 */
export default function StartBridge() {
  const params = useSearchParams();
  const from = parseBridgeSource(params.get("from"));
  const plan = parsePlanId(params.get("plan"));
  const funnelId = parseFunnelId(params.get("funnel"));
  const context = useMemo(() => ({ funnel_id: funnelId, plan, from }), [funnelId, plan, from]);

  const { session, reloadAccount } = useWebSession();
  const save = useSaveWebSignup(session, funnelId, reloadAccount);
  // The quiz's answers live in this browser. useSearchParams keeps this page
  // out of the server render, so reading storage here can't mismatch.
  const [handoff] = useState<BridgeHandoff | null>(() => readBridgeHandoff());
  const viewTracked = useRef(false);
  const signInTracked = useRef<string | null>(null);

  useEffect(() => {
    if (viewTracked.current) return;
    viewTracked.current = true;
    trackWebFunnelEvent(WEB_FUNNEL_EVENTS.bridgeView, context);
  }, [context]);

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
  }, [session, summary, context, handoff]);

  async function signOut() {
    await signOutOfWebsite();
    resetWebUser();
  }

  const name = session.status === "signedIn" ? session.user.displayName?.split(" ")[0] || handoff?.firstName : handoff?.firstName;
  const welcomeBack = Boolean(summary && (summary.hasUsedTrial || summary.hasAccount) && !summary.isSubscribed);
  const planLine = plan
    ? welcomeBack
      ? `${PLANS[plan].label} plan: ${PLANS[plan].price} a ${PLANS[plan].period}.`
      : `${PLANS[plan].label} plan: ${TRIAL_DAYS} days free, then ${PLANS[plan].price} a ${PLANS[plan].period}.`
    : null;

  const header = welcomeBack ? (
    <SectionHeading
      as="h1"
      size="title"
      align="center"
      title={name ? `Welcome back, ${name}` : "Welcome back"}
      lead={
        summary?.hasUsedTrial
          ? "You've had your free week, so your plan starts today. Choose a plan to pick up where you left off."
          : "Your PrepIt account is ready. Choose a plan to keep using it."
      }
    />
  ) : from === "quiz" ? (
    <SectionHeading
      as="h1"
      size="title"
      align="center"
      eyebrow={`${TRIAL_DAYS} days free`}
      title={name ? `Your plan is ready, ${name}` : "Your plan is ready"}
      lead="Create your login to unlock it. Use the Google or Apple account you'll sign in with on your iPhone."
    />
  ) : (
    <SectionHeading
      as="h1"
      size="title"
      align="center"
      eyebrow={`${TRIAL_DAYS} days free`}
      title="Start your free week"
      lead="Use the Google or Apple account you'll sign in with on your iPhone. Your subscription comes with it."
    />
  );

  if (session.status === "loading") {
    return <p className="text-body text-ink-secondary">Loading…</p>;
  }

  if (session.status === "signedOut") {
    return (
      <>
        <BridgeSteps current={0} />
        {header}
        {planLine && <p className="text-small font-medium text-ink">{planLine}</p>}
        <SignInButtons context={context} loginHint={handoff?.email} />
        <p className="text-small text-ink-muted">
          By continuing you agree to our{" "}
          <Link href="/terms-and-conditions" className="underline underline-offset-4 hover:text-ink">
            Terms
          </Link>{" "}
          and{" "}
          <Link href="/privacy-policy" className="underline underline-offset-4 hover:text-ink">
            Privacy Policy
          </Link>
          .
        </p>
      </>
    );
  }

  if (session.account.status === "error") {
    return (
      <>
        <SectionHeading
          as="h1"
          size="title"
          align="center"
          title="We couldn't check your account"
          lead="Please try again in a moment."
        />
        <button type="button" className={PRIMARY_BUTTON_CLASS} onClick={reloadAccount}>
          Try again
        </button>
      </>
    );
  }

  if (summary?.emailInUse) {
    return (
      <EmailInUseNotice
        existingProvider={summary.emailInUse.existingProvider}
        purpose="your subscription goes to the right account"
        onSignOut={() => void signOut()}
      />
    );
  }

  if (!summary || save !== "done") {
    return (
      <>
        <BridgeSteps current={1} />
        <p role="status" className="text-body text-ink-secondary">
          {save === "saving" && handoff ? "Saving your answers…" : "Checking your account…"}
        </p>
      </>
    );
  }

  // Signed in with the account answer: the paywall. Anyone already
  // subscribed (from any store) goes straight on to "You're in".
  return (
    <>
      <BridgeSteps current={1} />
      {header}
      <Checkout />
    </>
  );
}
