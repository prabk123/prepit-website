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
  identifyFunnelUser,
  trackWebPaywallDismissed,
  trackWebPaywallSkipped,
  trackWebPaywallView,
  trackWebPurchaseSuccess,
} from "@/lib/funnelAnalytics";
import FunnelHeader from "@/features/onboarding/components/FunnelHeader";

export default function PaywallPage() {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"loading" | "presenting" | "dismissed" | "error">(
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
      identifyFunnelUser(user.uid, { email: user.email });
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
        setStatus("presenting");
        await new Promise((resolve) => requestAnimationFrame(resolve));
        const target = containerRef.current;
        if (!target) return;
        await presentPaywall(user.uid, {
          htmlTarget: target,
          customerEmail: user.email ?? undefined,
          onBack: (closePaywall) => closePaywall(),
        });
        if (cancelled) return;
        const purchased = await hasPremiumEntitlement(user.uid);
        if (purchased) {
          trackWebPurchaseSuccess();
        } else {
          trackWebPaywallDismissed();
        }
        router.replace("/start/welcome");
      } catch (error) {
        if (cancelled) return;
        trackWebPaywallDismissed();
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

  if (status === "error" || status === "dismissed") {
    return (
      <div className="flex h-dvh flex-col bg-[var(--funnel-bg)] text-[var(--text-primary)]">
        <FunnelHeader progress={1} showProgress={false} onBack={() => router.push("/start")} />
        <main className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center px-4 pb-8">
          <h1 className="font-clash text-[28px] font-semibold leading-8 tracking-tight text-[var(--text-primary)]">
            Unlock PrepIt
          </h1>
          <p className="mt-2 text-base leading-[1.5] text-[var(--text-secondary)]">
            Subscribe to save your plan and use PrepIt on your phone.
          </p>
          {message ? (
            <p className="mt-4 text-sm text-[var(--text-secondary)]">{message}</p>
          ) : null}
          <div className="mt-6 space-y-3">
            <button
              type="button"
              className="h-12 w-full rounded-2xl bg-[var(--primary)] text-base font-bold text-[var(--on-primary)]"
              onClick={() => window.location.reload()}
            >
              Show paywall again
            </button>
            <button
              type="button"
              className="h-12 w-full rounded-2xl border border-[var(--border)] text-base font-bold"
              onClick={() => {
                trackWebPaywallSkipped();
                router.push("/start/welcome");
              }}
            >
              Continue without subscribing
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="relative h-dvh bg-[var(--funnel-bg)] text-[var(--text-primary)]">
      <div className="absolute inset-0 flex items-center justify-center">
        <p className="text-sm text-[var(--text-secondary)]">Loading your plan...</p>
      </div>
      <div ref={containerRef} className="web-paywall-root absolute inset-0 z-10 overflow-auto" />
    </div>
  );
}
