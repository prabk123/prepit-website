import posthog from "posthog-js";
import { isPostHogEnabled } from "@/lib/analytics";

/** Custom PostHog event fired when a user taps an App Store download CTA. */
export const POSTHOG_APP_STORE_EVENT = "app_store_click";

export function trackPostHogAppStoreClick(source: string) {
  if (typeof window === "undefined" || !isPostHogEnabled()) return;

  posthog.capture(POSTHOG_APP_STORE_EVENT, { source });
}
