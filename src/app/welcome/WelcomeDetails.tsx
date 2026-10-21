"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import BridgeSteps from "@/components/account/BridgeSteps";
import SectionHeading from "@/components/ui/SectionHeading";
import { trackWebFunnelEvent, WEB_FUNNEL_EVENTS } from "@/lib/webFunnelAnalytics";

const PROVIDER_NAMES = { google: "Google", apple: "Apple" } as const;

/** The heading and the sign-in instructions, from the provider checkout passes along. */
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

  const providerName = provider ? PROVIDER_NAMES[provider] : null;

  return (
    <>
      <BridgeSteps current={2} />
      <SectionHeading
        as="h1"
        size="title"
        align="center"
        title="You're in"
        lead="PrepIt lives on your iPhone. Download it to meet your nutritionist."
      />
      <div className="flex w-full flex-col gap-2 rounded-tile bg-surface-raised p-5 text-left">
        <p className="text-body font-bold text-ink">
          {providerName ? `Sign in with ${providerName}` : "Sign in with the same account"}
        </p>
        <p className="text-small text-ink-secondary">
          {providerName
            ? `Open PrepIt, tap Sign in, then Continue with ${providerName}. Use the same ${providerName} account you used here: your subscription is on it.`
            : "Open PrepIt and sign in with the same Google or Apple account you used here: your subscription is on it."}
        </p>
      </div>
      {pending && (
        <p className="text-small text-ink-muted">
          Your payment went through. It can take a minute for your subscription to show in the app.
        </p>
      )}
    </>
  );
}
