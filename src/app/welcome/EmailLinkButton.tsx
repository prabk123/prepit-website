"use client";

import { useState } from "react";
import { SECONDARY_BUTTON_CLASS } from "@/components/ui/buttons";
import { trackWebFunnelEvent, WEB_FUNNEL_EVENTS } from "@/lib/webFunnelAnalytics";

/**
 * Desktop only, beside the QR code (PRE-438): asks for the App Store link by
 * email, for someone who'd rather open it on their phone later. The event is
 * the request; a PostHog workflow sends the email (APP_LINK_EMAIL_LIVE).
 */
export default function EmailLinkButton({ email, provider }: { email: string | null; provider: "google" | "apple" | null }) {
  const [sent, setSent] = useState(false);
  if (!email) return null;
  return (
    <div className="hidden flex-col gap-2 lg:flex">
      {sent ? (
        <p role="status" className="ph-no-capture text-small text-ink-secondary">
          On its way to <b className="font-bold text-ink">{email}</b>. Open it on your iPhone.
        </p>
      ) : (
        <button
          type="button"
          className={`${SECONDARY_BUTTON_CLASS} max-w-[320px]`}
          onClick={() => {
            setSent(true);
            trackWebFunnelEvent(WEB_FUNNEL_EVENTS.emailLinkRequested, { provider });
          }}
        >
          Email me the link
        </button>
      )}
    </div>
  );
}
