"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { visitorCountry } from "@/lib/landingAnalytics";
import { PRIVACY_CHOICES_PATH } from "@/lib/privacyChoices";
import { GPC_COUNTRY } from "@/lib/privacySharing";
import { trackWebFunnelEvent, WEB_FUNNEL_EVENTS } from "@/lib/webFunnelAnalytics";

const noSubscribe = () => () => {};

/**
 * "Your Privacy Choices" in the footer for US visitors (PRE-539), where the
 * Meta Pixel is on by default. UK and EEA visitors choose in the cookie
 * banner. Hidden while rendering on the server, so server HTML is the same
 * for everyone. The CCPA rules pair this label with the official opt-out
 * icon, so the icon sits beside it.
 */
export function FooterPrivacyChoicesLink({ className }: { className: string }) {
  const isUs = useSyncExternalStore(noSubscribe, () => visitorCountry() === GPC_COUNTRY, () => false);
  if (!isUs) return null;
  return (
    <Link
      href={PRIVACY_CHOICES_PATH}
      className={className}
      onClick={() => trackWebFunnelEvent(WEB_FUNNEL_EVENTS.privacyChoicesLinkClick, { placement: "footer" })}
    >
      Your Privacy Choices
    </Link>
  );
}
