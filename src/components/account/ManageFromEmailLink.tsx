"use client";

import { useEffect, useRef, useState } from "react";
import SectionHeading from "@/components/ui/SectionHeading";
import { PRIMARY_BUTTON_CLASS, TEXT_BUTTON_CLASS } from "@/components/ui/buttons";
import { createBillingManagementUrlFromLink } from "@/lib/prepitApi";
import { trackWebFunnelEvent, WEB_FUNNEL_EVENTS } from "@/lib/webFunnelAnalytics";

/** Kept apart from the quiz emails' token (`useEmailToken`'s default key). */
export const MANAGE_LINK_STORAGE_KEY = "prepit.manageSubscriptionToken";

/** "Sign in instead", or an expired link: the tab stops reusing the token. */
export function forgetManageLinkToken() {
  try {
    window.sessionStorage.removeItem(MANAGE_LINK_STORAGE_KEY);
  } catch {
    // Storage blocked: nothing was kept.
  }
}

/** Where a subscription from a store is managed, for the account page with or without sign-in. */
export const STORE_NOTICES = {
  app_store: {
    title: "Your subscription is with Apple",
    lead: "You subscribed in the App Store, so Apple manages it. On your iPhone, open Settings, tap your name, then Subscriptions, then PrepIt.",
  },
  play_store: {
    title: "Your subscription is with Google Play",
    lead: "Google Play manages it. Open the Play Store app, tap your profile picture, then Payments & subscriptions, then Subscriptions.",
  },
} as const;

type State =
  | { status: "idle" }
  | { status: "opening" }
  | { status: "none"; store: string | null }
  | { status: "error" };

/**
 * The account page opened from a website subscription email (PRE-353). The
 * link's signed token stands in for sign-in, so one tap opens RevenueCat's
 * billing page for the subscription the email was about, whichever company's
 * billing it was bought through. It never signs anyone in. An old or changed
 * link, or "Sign in instead", goes back to the sign-in page.
 */
export default function ManageFromEmailLink({
  token,
  onSignIn,
}: {
  token: string;
  /** `expired`: the link was refused, so the sign-in page says why. */
  onSignIn: (reason: "chosen" | "expired") => void;
}) {
  const [state, setState] = useState<State>({ status: "idle" });
  const viewTracked = useRef(false);

  useEffect(() => {
    if (viewTracked.current) return;
    viewTracked.current = true;
    trackWebFunnelEvent(WEB_FUNNEL_EVENTS.manageSubscriptionView, { via: "email_link" });
  }, []);

  async function openPortal() {
    setState({ status: "opening" });
    try {
      const result = await createBillingManagementUrlFromLink(token);
      if (result.kind === "portal") {
        trackWebFunnelEvent(WEB_FUNNEL_EVENTS.manageSubscriptionPortalOpen, { via: "email_link", outcome: "opened" });
        window.location.assign(result.url);
        return;
      }
      if (result.kind === "invalid") {
        trackWebFunnelEvent(WEB_FUNNEL_EVENTS.manageSubscriptionPortalOpen, { via: "email_link", outcome: "invalid_link" });
        onSignIn("expired");
        return;
      }
      trackWebFunnelEvent(WEB_FUNNEL_EVENTS.manageSubscriptionPortalOpen, {
        via: "email_link",
        outcome: "no_web_subscription",
        store: result.store,
      });
      setState({ status: "none", store: result.store });
    } catch {
      trackWebFunnelEvent(WEB_FUNNEL_EVENTS.manageSubscriptionPortalOpen, { via: "email_link", outcome: "error" });
      setState({ status: "error" });
    }
  }

  const signInInstead = (
    <button type="button" className={TEXT_BUTTON_CLASS} onClick={() => onSignIn("chosen")}>
      Sign in instead
    </button>
  );

  if (state.status === "none") {
    const notice = state.store === "app_store" || state.store === "play_store" ? STORE_NOTICES[state.store] : null;
    return (
      <>
        <SectionHeading
          as="h1"
          size="title"
          align="center"
          title={notice?.title ?? "No website subscription to manage"}
          lead={
            notice?.lead ??
            "There's no active subscription from our website for this link. It may have already ended. Sign in to check, or email support@tryprepit.app."
          }
        />
        {signInInstead}
      </>
    );
  }

  const opening = state.status === "opening";
  return (
    <>
      <SectionHeading
        as="h1"
        size="title"
        align="center"
        title="Manage your subscription"
        lead="Change your plan, update your card or cancel on the billing page."
      />
      <button type="button" className={PRIMARY_BUTTON_CLASS} disabled={opening} onClick={() => void openPortal()}>
        {opening ? "Opening…" : state.status === "error" ? "Try again" : "Manage subscription"}
      </button>
      <p role="status" aria-live="polite" className={state.status === "error" ? "text-small text-error" : "sr-only"}>
        {state.status === "error" ? "We couldn't open the billing page. Please try again." : ""}
      </p>
      {signInInstead}
    </>
  );
}
