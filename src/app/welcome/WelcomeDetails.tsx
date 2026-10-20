"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import SectionHeading from "@/components/ui/SectionHeading";
import { trackWebFunnelEvent, WEB_FUNNEL_EVENTS } from "@/lib/webFunnelAnalytics";

const PROVIDER_NAMES = { google: "Google", apple: "Apple" } as const;

/** The heading and the sign-in hint, from the provider checkout passes along. */
export default function WelcomeDetails() {
  const params = useSearchParams();
  const raw = params.get("provider");
  const provider = raw === "google" || raw === "apple" ? raw : null;
  const pending = params.get("pending") === "1";
  const tracked = useRef(false);

  useEffect(() => {
    if (tracked.current) return;
    tracked.current = true;
    trackWebFunnelEvent(WEB_FUNNEL_EVENTS.handoffView, { provider, pending });
  }, [provider, pending]);

  const signIn = provider
    ? `Open it and tap Sign in, then Continue with ${PROVIDER_NAMES[provider]}, with the same account you used here.`
    : "Open it and sign in with the same Google or Apple account you used here.";

  return (
    <>
      <SectionHeading as="h1" size="title" align="center" title="You're in" lead={`Download PrepIt on your iPhone. ${signIn}`} />
      {pending && (
        <p className="text-small text-ink-muted">
          Your payment went through. It can take a minute for your subscription to show in the app.
        </p>
      )}
    </>
  );
}
