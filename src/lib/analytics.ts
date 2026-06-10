/** Matches the mobile app's ANALYTICS_ENABLED opt-in pattern. */
export function isAnalyticsEnabled(): boolean {
  return process.env.NEXT_PUBLIC_ANALYTICS_ENABLED === "true";
}

export function isPostHogEnabled(): boolean {
  return isAnalyticsEnabled() && Boolean(process.env.NEXT_PUBLIC_POSTHOG_KEY?.trim());
}
