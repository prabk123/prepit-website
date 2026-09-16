"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  consumeRedirectResult,
  isFirebaseConfigured,
  waitForAuthUser,
} from "@/lib/firebase";
import {
  hasPremiumEntitlement,
  isRevenueCatConfigured,
  presentPaywall,
} from "@/lib/revenuecat";
import {
  trackMetaInitiateCheckout,
  trackWebPaywallView,
  trackWebPurchaseSuccess,
} from "@/lib/funnelAnalytics";
import FunnelHeader from "@/features/onboarding/components/FunnelHeader";

export default function PaywallPage() {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "dismissed" | "error">(
    "loading",
  );
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      if (!isFirebaseConfigured()) {
        setStatus("error");
        setMessage("Sign-in is not configured yet.");
        return;
      }
      await consumeRedirectResult();
      const user = await waitForAuthUser();
      if (!user) {
        router.replace("/start");
        return;
      }
      if (!isRevenueCatConfigured()) {
        setStatus("error");
        setMessage("Payments are not configured yet.");
        return;
      }
      try {
        const premium = await hasPremiumEntitlement(user.uid);
        if (cancelled) return;
        if (premium) {
          router.replace("/start/welcome");
          return;
        }
        trackWebPaywallView();
        trackMetaInitiateCheckout();
        setStatus("ready");
        await new Promise((resolve) => requestAnimationFrame(resolve));
        const target = containerRef.current;
        if (!target) return;
        await presentPaywall(user.uid, target);
        if (cancelled) return;
        trackWebPurchaseSuccess();
        router.replace("/start/welcome");
      } catch (error) {
        if (cancelled) return;
        setStatus("dismissed");
        setMessage(
          error instanceof Error
            ? error.message
            : "Checkout closed. You can subscribe here or in the app.",
        );
      }
    }
    void run();
    return () => {
      cancelled = true;
    };
  }, [router]);

  return (
    <div className="flex min-h-screen flex-col bg-[var(--funnel-bg)] text-[var(--text-primary)]">
      <FunnelHeader progress={1} showProgress={false} onBack={() => router.push("/start")} />
      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col px-4 pb-8 pt-4">
        <h1 className="font-clash text-[28px] font-semibold leading-8 tracking-tight text-[var(--text-primary)]">
          Unlock PrepIt
        </h1>
        <p className="mt-2 text-base leading-[1.5] text-[var(--text-secondary)]">
          Subscribe to save your plan and use PrepIt on your phone.
        </p>
        <div ref={containerRef} className="mt-6 min-h-[420px] w-full" />
        {status === "loading" ? (
          <p className="mt-4 text-sm text-[var(--text-secondary)]">Loading your plan...</p>
        ) : null}
        {status === "error" || status === "dismissed" ? (
          <div className="mt-4 space-y-3">
            {message ? <p className="text-sm text-[var(--text-secondary)]">{message}</p> : null}
            <button
              type="button"
              className="h-12 w-full rounded-xl bg-[var(--primary)] text-sm font-semibold text-[var(--on-primary)]"
              onClick={() => window.location.reload()}
            >
              Show paywall again
            </button>
            <button
              type="button"
              className="h-12 w-full rounded-xl border border-[var(--border)] text-sm font-semibold"
              onClick={() => router.push("/start/welcome")}
            >
              Continue without subscribing
            </button>
          </div>
        ) : null}
      </main>
    </div>
  );
}
