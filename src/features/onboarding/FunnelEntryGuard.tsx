"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  consumeRedirectResult,
  isFirebaseConfigured,
  waitForAuthUser,
} from "@/lib/firebase";
import { hasPremiumEntitlement, isRevenueCatConfigured } from "@/lib/revenuecat";
import { createAccountFromSavedState } from "@/features/onboarding/completeAccount";
import {
  trackAuthSignupSuccess,
  trackOnboardingComplete,
} from "@/lib/funnelAnalytics";
import OnboardingFlow from "@/features/onboarding/OnboardingFlow";

export default function FunnelEntryGuard() {
  const router = useRouter();
  const [ready, setReady] = useState(() => !isFirebaseConfigured());

  useEffect(() => {
    let cancelled = false;
    async function check() {
      if (!isFirebaseConfigured()) {
        setReady(true);
        return;
      }
      try {
        await consumeRedirectResult();
        const user = await waitForAuthUser();
        if (!user || cancelled) {
          if (!cancelled) setReady(true);
          return;
        }
        const result = await createAccountFromSavedState(user);
        if (cancelled) return;
        if (result !== "incomplete") {
          if (result === "created") {
            trackAuthSignupSuccess("oauth");
            trackOnboardingComplete();
          }
          if (isRevenueCatConfigured()) {
            const premium = await hasPremiumEntitlement(user.uid);
            router.replace(premium ? "/start/welcome" : "/start/plan");
            return;
          }
          router.replace("/start/plan");
          return;
        }
      } catch {
        // Stay on onboarding if account lookup fails.
      }
      if (!cancelled) setReady(true);
    }
    void check();
    return () => {
      cancelled = true;
    };
  }, [router]);

  if (!ready) {
    return <div className="min-h-screen bg-[var(--funnel-bg)]" />;
  }
  return <OnboardingFlow />;
}
