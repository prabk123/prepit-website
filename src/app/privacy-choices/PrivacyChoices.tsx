"use client";

import Link from "next/link";
import { useEffect, useRef, useSyncExternalStore } from "react";
import SectionHeading from "@/components/ui/SectionHeading";
import { PRIMARY_BUTTON_CLASS, SECONDARY_BUTTON_CLASS } from "@/components/ui/buttons";
import {
  COOKIE_MAX_AGE_ONE_YEAR,
  expireClientCookie,
  PREPIT_PRIVACY_OPT_OUT_COOKIE,
  setClientCookie,
} from "@/lib/cookies";
import { forgetAttribution } from "@/lib/funnel/attributionStore";
import { sharingOptOut } from "@/lib/privacyChoices";
import type { SharingOptOut } from "@/lib/privacySharing";
import { registerVisitorMarket } from "@/lib/landingAnalytics";
import { trackWebFunnelEvent, WEB_FUNNEL_EVENTS } from "@/lib/webFunnelAnalytics";

/**
 * Turns sharing off now, not only from the next page: stops a pixel already on
 * this page from sending (Meta's `consent revoke`), drops the kept campaign
 * details and removes the pixel's browser and click id cookies.
 */
function stopSharingNow() {
  setClientCookie(PREPIT_PRIVACY_OPT_OUT_COOKIE, "1", COOKIE_MAX_AGE_ONE_YEAR);
  if (typeof window.fbq === "function") window.fbq("consent", "revoke");
  forgetAttribution();
  expireClientCookie("_fbp");
  expireClientCookie("_fbc");
}

/** The page re-reads the choice after a button press; nothing else changes it while it is open. */
const listeners = new Set<() => void>();
function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
function choiceChanged() {
  for (const listener of listeners) listener();
}

const linkClass = "text-ink underline decoration-accent underline-offset-4 hover:text-accent-text";

export default function PrivacyChoices() {
  // undefined while rendering on the server, so the server HTML is the same for everyone.
  const optOut = useSyncExternalStore<SharingOptOut | undefined>(subscribe, sharingOptOut, () => undefined);
  const viewTracked = useRef(false);

  useEffect(() => {
    if (viewTracked.current) return;
    viewTracked.current = true;
    trackWebFunnelEvent(WEB_FUNNEL_EVENTS.privacyChoicesView, { opted_out: sharingOptOut() ?? "none" });
  }, []);

  function optOutNow() {
    // Sent first: once opted out the event still goes to PostHog, which isn't sharing.
    trackWebFunnelEvent(WEB_FUNNEL_EVENTS.privacyChoiceChange, { choice: "opt_out" });
    stopSharingNow();
    choiceChanged();
    registerVisitorMarket();
  }

  function optBackIn() {
    expireClientCookie(PREPIT_PRIVACY_OPT_OUT_COOKIE);
    trackWebFunnelEvent(WEB_FUNNEL_EVENTS.privacyChoiceChange, { choice: "opt_in" });
    choiceChanged();
    registerVisitorMarket();
    // Measurement comes back straight away, unless GPC still applies: a pixel
    // revoked earlier on this page is granted again, otherwise it loads now.
    if (sharingOptOut() === null) {
      if (typeof window.fbq === "function") window.fbq("consent", "grant");
      else window.prepitLoadMetaPixel?.();
    }
  }

  return (
    <div className="flex w-full flex-col gap-6">
      <SectionHeading
        as="h1"
        size="title"
        align="center"
        title="Your Privacy Choices"
        lead="We don't sell your personal data for money. On our website, the Meta Pixel and the details we pass on with a purchase help us see whether our ads work. California and some other US states call this “sharing” for advertising, and you can turn it off."
      />

      <p className="text-small text-ink-secondary text-pretty">
        Opting out turns off the Meta Pixel and the ad details we pass on with a purchase, in this browser. We
        never share your food, health or body data for advertising, with or without this choice.
      </p>

      <div aria-live="polite" className="flex flex-col gap-4">
        {optOut === "gpc" && (
          <p className="text-body font-medium text-ink">
            Your browser sends Global Privacy Control, so you&apos;re already opted out. Nothing else to do.
          </p>
        )}
        {optOut === "choice" && (
          <>
            <p className="text-body font-medium text-ink">You&apos;ve opted out of sharing in this browser.</p>
            <button type="button" className={SECONDARY_BUTTON_CLASS} onClick={optBackIn}>
              Turn sharing back on
            </button>
          </>
        )}
        {optOut === null && (
          <button type="button" className={PRIMARY_BUTTON_CLASS} onClick={optOutNow}>
            Opt out of sharing
          </button>
        )}
      </div>

      <p className="text-small text-ink-muted text-pretty">
        Your choice is saved in this browser. If you clear its cookies or use another browser or device, opt out
        there too, or turn on Global Privacy Control, which we honour. More in our{" "}
        <Link href="/privacy-policy" className={linkClass}>
          Privacy Policy
        </Link>{" "}
        and{" "}
        <Link href="/cookie-policy" className={linkClass}>
          Cookie Policy
        </Link>
        .
      </p>
    </div>
  );
}
