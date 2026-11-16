"use client";

import { useState, useSyncExternalStore } from "react";
import { SECONDARY_BUTTON_CLASS } from "@/components/ui/buttons";
import { openAppSchemeUrl } from "@/lib/appStore";
import { trackWebFunnelEvent, WEB_FUNNEL_EVENTS } from "@/lib/webFunnelAnalytics";

const noSubscribe = () => () => {};
const isIPhone = () => /iPhone|iPod/i.test(navigator.userAgent);

/**
 * "Open PrepIt" on an iPhone (PRE-567): opens the app with the sign-in sheet
 * already up and their Google or Apple button first, so they never see Get
 * Started. It uses the app's own prepit:// link: an https /open link from
 * this page stays in Safari, because iOS keeps links to the site you're on
 * in the browser. Nothing shows on other devices, which use the QR code.
 */
export default function OpenAppLink({ provider }: { provider: "google" | "apple" | null }) {
  // False in the server render and while hydrating, then the real answer.
  const iPhone = useSyncExternalStore(noSubscribe, isIPhone, () => false);
  // Still on this page a moment after the tap: the app probably isn't installed yet.
  const [stillHere, setStillHere] = useState(false);

  if (!iPhone) return null;

  const open = () => {
    trackWebFunnelEvent(WEB_FUNNEL_EVENTS.handoffOpenApp, { provider, link: "app_scheme" });
    setStillHere(false);
    // iOS's "Open in PrepIt?" prompt blurs the page and opening the app
    // hides it; either means the tap did something, so no hint.
    let timer = 0;
    const cancel = () => {
      window.clearTimeout(timer);
      window.removeEventListener("blur", cancel);
      window.removeEventListener("pagehide", cancel);
      document.removeEventListener("visibilitychange", cancel);
    };
    timer = window.setTimeout(() => {
      cancel();
      if (document.visibilityState === "visible" && document.hasFocus()) setStillHere(true);
    }, 2500);
    window.addEventListener("blur", cancel);
    window.addEventListener("pagehide", cancel);
    document.addEventListener("visibilitychange", cancel);
  };

  return (
    <div className="flex flex-col gap-2">
      <a href={openAppSchemeUrl(provider)} className={SECONDARY_BUTTON_CLASS} onClick={open}>
        Open PrepIt
      </a>
      <p role="status" className="text-small text-ink-muted">
        {stillHere
          ? "Nothing happened? Download PrepIt first (step 1), then come back and tap Open PrepIt."
          : "Once it’s installed, come back here and tap this. Sign in opens for you."}
      </p>
    </div>
  );
}
