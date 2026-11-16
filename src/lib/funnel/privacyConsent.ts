/**
 * The health and AI consent box on the cart (PRE-533), the website's half of
 * PRE-532. One unticked box above the sign-in buttons, kept apart from the
 * terms (UK GDPR Article 9 explicit consent can't be bundled with them).
 *
 * The tick is kept in this tab (sessionStorage, for an hour at most) until the
 * visitor signs in, so it survives the sign-in round trip but never pre-ticks
 * the box for the next person on a shared browser. It is then sent with
 * `PATCH /web-signup/profile` as `privacyConsent`. The backend keeps it on the
 * pending profile and records it on the account (source `web`), so the app
 * doesn't ask again.
 *
 * The wording must match fresca_backend `src/data/privacyConsentWording.ts`
 * for the version sent, word for word: the backend stores its own copy of the
 * version's text as what the person agreed to. Never edit a version; add a new
 * one in the backend first.
 *
 * Kept free of React so it can be tested on its own.
 */

export const PRIVACY_CONSENT_VERSION = "health-ai-v1";

/** The box's sentence (`text` for health-ai-v1). */
export const PRIVACY_CONSENT_TEXT =
  "I agree PrepIt can use my health info, and share it with its AI and search providers, to coach me.";

/** What Learn more shows, paragraph by paragraph (`learnMoreBody` for health-ai-v1). */
export const PRIVACY_CONSENT_LEARN_MORE: readonly string[] = [
  "To estimate your nutrition and coach you, PrepIt uses what you tell it about your body, health, food and activity, and Apple Health data if you connect it. This is health data, which the law treats as sensitive.",
  "To reply to you, read meal photos and voice notes and build your plans, PrepIt sends this information to AI providers that work for us (Anthropic, OpenAI and Google through OpenRouter, and Deepgram), and food names to search providers to look up nutrition.",
  "You can withdraw your consent at any time in Settings, Privacy. PrepIt can't coach you without it.",
];

/** Shown when a sign-in button is pressed before the box is ticked. */
export const PRIVACY_CONSENT_NEEDED_MESSAGE = "Tick the box above to continue.";

export const PRIVACY_CONSENT_KEY = "prepit.privacyConsent";

/** Ticks older than this are dropped: long enough for a sign-in, short enough that an abandoned tick never stands in for someone else's. */
export const PRIVACY_CONSENT_MAX_AGE_MS = 60 * 60 * 1000;

export type StoredPrivacyConsent = { version: typeof PRIVACY_CONSENT_VERSION; givenAt: string };

/** The body the backend's `privacyConsentSchema` takes (no `source`: the web endpoint sets it). */
export type PrivacyConsentBody = {
  version: string;
  healthData: true;
  aiProviders: true;
  givenAt: string;
};

/** Parses a stored tick; anything stale, from another version or broken is dropped. Exported for tests. */
export function parsePrivacyConsent(raw: string | null, now = Date.now()): StoredPrivacyConsent | null {
  if (!raw) return null;
  try {
    const value = JSON.parse(raw) as Record<string, unknown>;
    if (value?.version !== PRIVACY_CONSENT_VERSION || typeof value.givenAt !== "string") return null;
    const time = Date.parse(value.givenAt);
    if (!Number.isFinite(time) || time > now + 60_000 || now - time > PRIVACY_CONSENT_MAX_AGE_MS) return null;
    return { version: PRIVACY_CONSENT_VERSION, givenAt: new Date(time).toISOString() };
  } catch {
    return null;
  }
}

/** What `PATCH /web-signup/profile` gets for a stored tick. */
export function privacyConsentBody(stored: StoredPrivacyConsent | null): PrivacyConsentBody | undefined {
  if (!stored) return undefined;
  return { version: stored.version, healthData: true, aiProviders: true, givenAt: stored.givenAt };
}

function storage(): Storage | null {
  try {
    return typeof window === "undefined" ? null : window.sessionStorage;
  } catch {
    return null;
  }
}

export function readPrivacyConsent(): StoredPrivacyConsent | null {
  try {
    return parsePrivacyConsent(storage()?.getItem(PRIVACY_CONSENT_KEY) ?? null);
  } catch {
    return null;
  }
}

/** Keeps the tick (with the time it was ticked) until sign-in. */
export function writePrivacyConsent(now = new Date()): void {
  try {
    const value: StoredPrivacyConsent = { version: PRIVACY_CONSENT_VERSION, givenAt: now.toISOString() };
    storage()?.setItem(PRIVACY_CONSENT_KEY, JSON.stringify(value));
  } catch {
    // Storage blocked: the app asks once instead.
  }
}

export function clearPrivacyConsent(): void {
  try {
    storage()?.removeItem(PRIVACY_CONSENT_KEY);
  } catch {
    // Nothing to clear.
  }
}
