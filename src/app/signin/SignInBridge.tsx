"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import EmailInUseNotice from "@/components/account/EmailInUseNotice";
import SignInButtons from "@/components/account/SignInButtons";
import { useWebSession } from "@/components/account/useWebSession";
import AppStoreButton from "@/components/ui/AppStoreButton";
import SectionHeading from "@/components/ui/SectionHeading";
import { PRIMARY_BUTTON_CLASS, TEXT_BUTTON_CLASS } from "@/components/ui/buttons";
import { providerOf, signOutOfWebsite, type SignInProvider } from "@/lib/firebase/auth";
import { readAttribution } from "@/lib/funnel/attribution";
import { parseFunnelId, safeNextPath } from "@/lib/funnel/params";
import { saveWebSignupProfile } from "@/lib/prepitApi";
import { parsePlanId, PLANS, TRIAL_DAYS } from "@/lib/pricing";
import { resetWebUser, trackWebFunnelEvent, WEB_FUNNEL_EVENTS } from "@/lib/webFunnelAnalytics";

const PROVIDER_NAMES: Record<SignInProvider, string> = { google: "Google", apple: "Apple" };

export default function SignInBridge() {
  const params = useSearchParams();
  const router = useRouter();
  const plan = parsePlanId(params.get("plan"));
  const funnelId = parseFunnelId(params.get("funnel"));
  const checkoutPath = `/checkout?${new URLSearchParams({ ...(plan ? { plan } : {}), funnel: funnelId })}`;
  const nextPath = safeNextPath(params.get("next"), checkoutPath);
  const context = { funnel_id: funnelId, plan };

  const { session, reloadAccount } = useWebSession();
  const [justSignedIn, setJustSignedIn] = useState<SignInProvider | null>(null);
  const viewTracked = useRef(false);
  const successTracked = useRef(false);

  useEffect(() => {
    if (viewTracked.current) return;
    viewTracked.current = true;
    trackWebFunnelEvent(WEB_FUNNEL_EVENTS.bridgeView, context);
    // Only on the first render: the context comes from the URL.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const account = session.status === "signedIn" ? session.account : null;

  // Once a sign-in on this page has an account answer: record it, and send
  // someone with no subscription straight on to checkout.
  useEffect(() => {
    if (!justSignedIn || account?.status !== "ready") return;
    if (!successTracked.current) {
      successTracked.current = true;
      if (account.summary.emailInUse) {
        trackWebFunnelEvent(WEB_FUNNEL_EVENTS.signInFailed, {
          ...context,
          signup_method: justSignedIn,
          reason: "email_in_use",
          existing_provider: account.summary.emailInUse.existingProvider,
        });
        return;
      }
      trackWebFunnelEvent(WEB_FUNNEL_EVENTS.signupSuccess, {
        ...context,
        signup_method: justSignedIn,
        has_account: account.summary.hasAccount,
        is_subscribed: account.summary.isSubscribed,
      });
      // Someone new: start their web sign-up with the funnel and how they
      // found us, so the app knows to finish setting up and the purchase can
      // be traced to its campaign. No answers yet, so no account is made.
      if (!account.summary.hasAccount) {
        saveWebSignupProfile({ funnelId, attribution: readAttribution(), createAccount: false }).catch(() => {
          // Not worth stopping checkout for; the backend logs its own failures.
        });
      }
    }
    if (!account.summary.isSubscribed && !account.summary.hasAccount && !account.summary.emailInUse) {
      router.push(nextPath);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [justSignedIn, account]);

  async function signOut() {
    await signOutOfWebsite();
    resetWebUser();
    setJustSignedIn(null);
    successTracked.current = false;
  }

  if (session.status === "loading") {
    return <p className="text-body text-ink-secondary">Loading…</p>;
  }

  if (session.status === "signedOut") {
    const planLine = plan
      ? `${PLANS[plan].label} plan: ${TRIAL_DAYS} days free, then ${PLANS[plan].price} a ${PLANS[plan].period}.`
      : null;
    return (
      <>
        <SectionHeading
          as="h1"
          size="title"
          align="center"
          title="Create your PrepIt login"
          lead="Use the Google or Apple account you'll sign in with on your iPhone. Your subscription comes with it."
        />
        {planLine && <p className="text-small font-medium text-ink">{planLine}</p>}
        <SignInButtons context={context} onSignedIn={setJustSignedIn} />
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

  const provider = providerOf(session.user);
  const signedInAs = (
    // ph-no-capture keeps the email out of session recordings.
    <p className="ph-no-capture text-small text-ink-muted">
      Signed in{provider ? ` with ${PROVIDER_NAMES[provider]}` : ""}
      {session.user.email ? ` as ${session.user.email}` : ""}.{" "}
      <button type="button" className={TEXT_BUTTON_CLASS} onClick={() => void signOut()}>
        Not you? Sign out
      </button>
    </p>
  );

  if (session.account.status === "loading") {
    return (
      <>
        <SectionHeading as="h1" size="title" align="center" title="Checking your account…" />
        {signedInAs}
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
        {signedInAs}
      </>
    );
  }

  const { summary } = session.account;
  const appSignIn = provider ? ` with ${PROVIDER_NAMES[provider]}` : "";

  if (summary.emailInUse) {
    return (
      <EmailInUseNotice
        existingProvider={summary.emailInUse.existingProvider}
        purpose="your subscription goes to the right account"
        onSignOut={() => void signOut()}
      />
    );
  }

  if (summary.isSubscribed) {
    return (
      <>
        <SectionHeading
          as="h1"
          size="title"
          align="center"
          title="You already have PrepIt"
          lead={`Your subscription is active. Download the app and sign in${appSignIn} to pick up where you left off.`}
        />
        <div className="flex justify-center">
          <AppStoreButton trackingSource="signin-already-subscribed" />
        </div>
        {signedInAs}
      </>
    );
  }

  return (
    <>
      <SectionHeading
        as="h1"
        size="title"
        align="center"
        title={summary.hasAccount ? "You already have an account" : "You're signed in"}
        lead={
          summary.hasAccount
            ? `Your PrepIt account is ready. Choose a plan to keep using it, then sign in to the app${appSignIn}.`
            : "Next, choose your plan."
        }
      />
      <Link href={nextPath} className={PRIMARY_BUTTON_CLASS}>
        Continue
      </Link>
      {signedInAs}
    </>
  );
}
