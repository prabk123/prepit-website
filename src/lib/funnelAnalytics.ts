"use client";

import posthog from "posthog-js";
import { isPostHogEnabled } from "@/lib/analytics";
import { attributionProperties } from "@/lib/attribution";
import {
  initMetaAdvancedMatching,
  trackMetaCompleteRegistration,
  trackMetaInitiateCheckout,
} from "@/lib/metaPixel";

const ONBOARDING_START_KEY = "prepit.onboardingStartTracked";

function capture(event: string, properties?: Record<string, unknown>) {
  if (typeof window === "undefined" || !isPostHogEnabled()) return;
  posthog.capture(event, {
    platform: "web",
    signup_source: "web",
    ...attributionProperties(),
    ...properties,
  });
}

export function identifyFunnelUser(
  userId: string,
  extras?: { email?: string | null; method?: string },
) {
  if (typeof window === "undefined" || !userId) return;

  if (isPostHogEnabled()) {
    posthog.identify(userId, {
      platform: "web",
      signup_source: "web",
      ...(extras?.email ? { email: extras.email } : {}),
      ...(extras?.method ? { signup_method: extras.method } : {}),
    });
  }

  initMetaAdvancedMatching({
    email: extras?.email ?? undefined,
    externalId: userId,
  });
}

export function trackOnboardingStart() {
  if (typeof window === "undefined") return;
  try {
    if (sessionStorage.getItem(ONBOARDING_START_KEY) === "1") return;
    sessionStorage.setItem(ONBOARDING_START_KEY, "1");
  } catch {
    // Still fire once per page load if storage is unavailable.
  }
  capture("onboarding_start");
}

export function trackOnboardingStepView(stepName: string) {
  capture("onboarding_step_view", { step_name: stepName });
}

export function trackOnboardingStepComplete(stepName: string, value?: string) {
  capture("onboarding_step_complete", {
    step_name: stepName,
    ...(value !== undefined ? { value } : {}),
  });
}

export function trackOnboardingSkip(stepName: string) {
  capture("onboarding_skip", { step_name: stepName });
}

export function trackOnboardingComplete() {
  capture("onboarding_complete");
}

export function trackAuthSignupView() {
  capture("auth_signup_view", { source: "onboarding" });
}

export function trackAuthSignupSuccess(method: string) {
  capture("auth_signup_success", { method });
  trackMetaCompleteRegistration(method);
}

export function trackWebPaywallView() {
  capture("web_paywall_view");
  trackMetaInitiateCheckout();
}

export function trackWebPurchaseSuccess() {
  capture("web_purchase_success");
}

export function trackWebPaywallDismissed() {
  capture("web_paywall_dismissed");
}

export function trackWebPaywallSkipped() {
  capture("web_paywall_skipped");
}

export function trackWebWelcomeView() {
  capture("web_welcome_view");
}

