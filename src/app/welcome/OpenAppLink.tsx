"use client";

import { TEXT_BUTTON_CLASS } from "@/components/ui/buttons";
import { openAppUrl } from "@/lib/appStore";
import { trackWebFunnelEvent, WEB_FUNNEL_EVENTS } from "@/lib/webFunnelAnalytics";

/**
 * For people who already have PrepIt on this iPhone: /open opens the app
 * (Universal Links, PRE-270) with their sign-in button first, and shows the
 * App Store on a phone without it.
 */
export default function OpenAppLink({ provider }: { provider: "google" | "apple" | null }) {
  return (
    <p className="text-small text-ink-muted">
      Already have PrepIt?{" "}
      <a
        href={openAppUrl(provider)}
        className={TEXT_BUTTON_CLASS}
        onClick={() => trackWebFunnelEvent(WEB_FUNNEL_EVENTS.handoffOpenApp, { provider })}
      >
        Open the app
      </a>
    </p>
  );
}
