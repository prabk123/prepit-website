"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import EmailInUseNotice from "@/components/account/EmailInUseNotice";
import ManageFromEmailLink, {
  forgetManageLinkToken,
  MANAGE_LINK_STORAGE_KEY,
  STORE_NOTICES,
} from "@/components/account/ManageFromEmailLink";
import SignInButtons from "@/components/account/SignInButtons";
import { useEmailToken } from "@/components/quiz/useEmailToken";
import { useWebSession } from "@/components/account/useWebSession";
import SectionHeading from "@/components/ui/SectionHeading";
import { PRIMARY_BUTTON_CLASS, TEXT_BUTTON_CLASS } from "@/components/ui/buttons";
import { providerOf, signOutOfWebsite } from "@/lib/firebase/auth";
import { createBillingManagementUrl } from "@/lib/prepitApi";
import { subscriptionDateLine } from "@/lib/revenuecat/subscriptionDateLine";
import {
  loadPremiumDetails,
  webBillingSellerForReading,
  type PremiumDetails,
} from "@/lib/revenuecat/webBilling";
import { resetWebUser, trackWebFunnelEvent, WEB_FUNNEL_EVENTS } from "@/lib/webFunnelAnalytics";

const PROVIDER_NAMES = { google: "Google", apple: "Apple" } as const;

/** RevenueCat's view of the subscription; `unknown` when RevenueCat can't be asked from this deploy. */
type Details =
  | { status: "loading" }
  | { status: "ready"; premium: PremiumDetails | null }
  | { status: "unknown" };

function formatDate(date: Date): string {
  return date.toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" });
}

/**
 * An email's link carries a signed token (PRE-353): the billing page opens
 * from it with no sign-in. Without one, or after "Sign in instead" or an
 * expired link, the page asks for Google or Apple sign-in as before.
 */
export default function ManageSubscription() {
  const linkToken = useEmailToken(MANAGE_LINK_STORAGE_KEY);
  const [signInReason, setSignInReason] = useState<"chosen" | "expired" | null>(null);

  if (linkToken === undefined) return <p className="text-body text-ink-secondary">Loading…</p>;
  if (linkToken && !signInReason) {
    return (
      <ManageFromEmailLink
        token={linkToken}
        onSignIn={(reason) => {
          forgetManageLinkToken();
          setSignInReason(reason);
        }}
      />
    );
  }
  return <ManageAfterSignIn linkExpired={signInReason === "expired"} />;
}

function ManageAfterSignIn({ linkExpired }: { linkExpired: boolean }) {
  const { session, reloadAccount } = useWebSession();
  const [details, setDetails] = useState<{ uid: string; details: Details } | null>(null);
  const [portal, setPortal] = useState<"idle" | "opening" | "none" | "error">("idle");
  // The uid the page view was counted for, so a different sign-in counts again.
  const viewTrackedFor = useRef<string | null>(null);

  const uid = session.status === "signedIn" ? session.user.uid : null;
  const current: Details = details && details.uid === uid ? details.details : { status: "loading" };

  useEffect(() => {
    if (!uid) return;
    let cancelled = false;
    const done = (next: Details) => {
      if (!cancelled) setDetails({ uid, details: next });
    };
    const seller = webBillingSellerForReading();
    if (!seller) {
      done({ status: "unknown" });
      return;
    }
    loadPremiumDetails(uid, seller)
      .then((premium) => done({ status: "ready", premium }))
      .catch(() => done({ status: "unknown" }));
    return () => {
      cancelled = true;
    };
  }, [uid]);

  const account = session.status === "signedIn" ? session.account : null;
  const summary = account?.status === "ready" ? account.summary : null;
  const place =
    current.status === "ready"
      ? (current.premium?.place ?? (summary?.isSubscribed ? "unknown" : "none"))
      : current.status === "unknown"
        ? summary?.isSubscribed
          ? "unknown"
          : "none"
        : null;
  const loadedPremium = current.status === "ready" ? current.premium : null;
  const inTrial = loadedPremium?.inTrial ?? null;
  const willRenew = loadedPremium?.willRenew ?? null;

  useEffect(() => {
    if (!uid || viewTrackedFor.current === uid || !summary || place === null) return;
    viewTrackedFor.current = uid;
    trackWebFunnelEvent(WEB_FUNNEL_EVENTS.manageSubscriptionView, {
      via: "sign_in",
      store: place,
      has_account: summary.hasAccount,
      in_trial: inTrial,
      will_renew: willRenew,
    });
  }, [uid, summary, place, inTrial, willRenew]);

  async function signOut() {
    await signOutOfWebsite();
    resetWebUser();
    setPortal("idle");
  }

  async function openPortal() {
    setPortal("opening");
    try {
      const url = await createBillingManagementUrl();
      trackWebFunnelEvent(WEB_FUNNEL_EVENTS.manageSubscriptionPortalOpen, {
        via: "sign_in",
        outcome: url ? "opened" : "no_web_subscription",
      });
      if (url) {
        window.location.assign(url);
        return;
      }
      setPortal("none");
    } catch {
      trackWebFunnelEvent(WEB_FUNNEL_EVENTS.manageSubscriptionPortalOpen, { via: "sign_in", outcome: "error" });
      setPortal("error");
    }
  }

  if (session.status === "loading") return <p className="text-body text-ink-secondary">Loading…</p>;

  if (session.status === "signedOut") {
    return (
      <>
        <SectionHeading
          as="h1"
          size="title"
          align="center"
          title={linkExpired ? "This link has expired" : "Manage your subscription"}
          lead={
            linkExpired
              ? "Sign in with the Google or Apple account you use in PrepIt to change or cancel your subscription."
              : "Sign in with the Google or Apple account you use in PrepIt to change or cancel a subscription you bought on our website."
          }
        />
        <SignInButtons context={{ page: "account" }} />
      </>
    );
  }

  const provider = providerOf(session.user);
  const signedInAs = (
    <p className="ph-no-capture text-small text-ink-muted">
      Signed in{provider ? ` with ${PROVIDER_NAMES[provider]}` : ""}
      {session.user.email ? ` as ${session.user.email}` : ""}.{" "}
      <button type="button" className={TEXT_BUTTON_CLASS} onClick={() => void signOut()}>
        Sign out
      </button>
    </p>
  );

  if (account?.status === "error") {
    return (
      <>
        <SectionHeading as="h1" size="title" align="center" title="We couldn't load your account" lead="Please try again in a moment." />
        <button type="button" className={PRIMARY_BUTTON_CLASS} onClick={reloadAccount}>
          Try again
        </button>
        {signedInAs}
      </>
    );
  }

  if (!summary || place === null) {
    return (
      <>
        <SectionHeading as="h1" size="title" align="center" title="Checking your subscription…" />
        {signedInAs}
      </>
    );
  }

  if (summary.emailInUse && place === "none") {
    return (
      <EmailInUseNotice
        existingProvider={summary.emailInUse.existingProvider}
        purpose="you see your subscription"
        onSignOut={() => void signOut()}
      />
    );
  }

  const dateLine = loadedPremium ? subscriptionDateLine(loadedPremium, formatDate) : null;

  if (place === "app_store") {
    return (
      <>
        <SectionHeading
          as="h1"
          size="title"
          align="center"
          title={STORE_NOTICES.app_store.title}
          lead={STORE_NOTICES.app_store.lead}
        />
        {dateLine && <p className="text-small text-ink-muted">{dateLine}</p>}
        {signedInAs}
      </>
    );
  }

  if (place === "play_store") {
    return (
      <>
        <SectionHeading
          as="h1"
          size="title"
          align="center"
          title={STORE_NOTICES.play_store.title}
          lead={STORE_NOTICES.play_store.lead}
        />
        {dateLine && <p className="text-small text-ink-muted">{dateLine}</p>}
        {signedInAs}
      </>
    );
  }

  if (place === "legacy_web") {
    return (
      <>
        <SectionHeading
          as="h1"
          size="title"
          align="center"
          title="Your subscription"
          lead="You subscribed on our website before our current billing page, so it can't be opened here. Email support@tryprepit.app to change or cancel it."
        />
        {dateLine && <p className="text-small text-ink-muted">{dateLine}</p>}
        {signedInAs}
      </>
    );
  }

  if (place === "none" || place === "other") {
    return (
      <>
        <SectionHeading
          as="h1"
          size="title"
          align="center"
          title={place === "none" ? "You don't have a subscription" : "Your subscription"}
          lead={
            place === "none"
              ? "There's no PrepIt subscription on this account. If you subscribed with a different Google or Apple account, sign out and sign in with that one."
              : "Your PrepIt access isn't something you can manage here. If something looks wrong, email support@tryprepit.app."
          }
        />
        {place === "none" && (
          <Link href="/checkout?funnel=account" className={PRIMARY_BUTTON_CLASS}>
            Get PrepIt
          </Link>
        )}
        {signedInAs}
      </>
    );
  }

  // A web subscription, or one we couldn't place: the portal decides.
  return (
    <>
      <SectionHeading
        as="h1"
        size="title"
        align="center"
        title="Your subscription"
        lead={
          place === "web"
            ? "You subscribed on our website. Change your plan, update your card or cancel on the billing page."
            : "Open the billing page to change or cancel a subscription you bought on our website."
        }
      />
      {dateLine && <p className="text-small text-ink-muted">{dateLine}</p>}
      <button type="button" className={PRIMARY_BUTTON_CLASS} disabled={portal === "opening"} onClick={() => void openPortal()}>
        {portal === "opening" ? "Opening…" : portal === "error" ? "Try again" : "Manage subscription"}
      </button>
      <p role="status" aria-live="polite" className={portal === "none" || portal === "error" ? "text-small text-error" : "sr-only"}>
        {portal === "none"
          ? place === "web"
            ? "We couldn't find the billing page for this subscription. Please try again, or email support@tryprepit.app."
            : "There's no website subscription on this account. If you subscribed on your iPhone, manage it in Settings, then your name, then Subscriptions."
          : portal === "error"
            ? "We couldn't open the billing page. Please try again."
            : ""}
      </p>
      {signedInAs}
    </>
  );
}
