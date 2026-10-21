export const APP_STORE_ID = "6751211023";

export const APP_STORE_URL =
  `https://apps.apple.com/app/prepit-ai-nutritionist/id${APP_STORE_ID}`;

/**
 * The link that opens the PrepIt app on an iPhone that has it (Universal Links,
 * PRE-270) and shows /open with the App Store otherwise. Always the live
 * domain: only the domain in the app's associated domains opens the app.
 * `provider` puts that sign-in button first in the app.
 */
export function openAppUrl(provider?: "google" | "apple" | null): string {
  return `https://www.tryprepit.app/open${provider ? `?provider=${provider}` : ""}`;
}
