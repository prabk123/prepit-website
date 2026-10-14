import { initPostHog } from "@/lib/posthogInit";
import {
  PREPIT_ANALYTICS_CONSENT_COOKIE,
  PREPIT_GEO_COOKIE,
  readCookie,
} from "@/lib/cookies";

// Outside the UK and EEA PostHog starts now. Inside, CookieConsent starts it
// after "Accept optional cookies"; until then nothing is stored or sent.
const geo = readCookie(PREPIT_GEO_COOKIE);
const hasConsent = readCookie(PREPIT_ANALYTICS_CONSENT_COOKIE) === "granted";

if (geo === "non-eu" || hasConsent) {
  initPostHog();
}
