"use client";

import posthog from "posthog-js";
import { isPostHogEnabled } from "@/lib/analytics";

function capture(event: string, properties?: Record<string, unknown>) {
  if (typeof window === "undefined" || !isPostHogEnabled()) return;
  posthog.capture(event, properties);
}

export function trackOnboardingStart() {
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
}

export function trackWebPaywallView() {
  capture("web_paywall_view");
}

export function trackWebPurchaseSuccess() {
  capture("web_purchase_success");
}

export function trackMetaInitiateCheckout() {
  if (typeof window === "undefined" || typeof window.fbq !== "function") return;
  window.fbq("track", "InitiateCheckout");
}
