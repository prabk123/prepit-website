# Web2App funnel — dashboard setup

These steps are done in vendor consoles, not in this repo. The site reads the env vars below at build/runtime.

## RevenueCat Web Billing

1. In the same RevenueCat project as iOS/Android, add a **Web Billing** app.
2. Connect **Stripe** (use Stripe test mode with the sandbox public key while developing).
3. Create web products (monthly / annual) and attach them to the existing **`premium`** entitlement.
4. Put those products in the offering used by the web paywall (or mark that offering current).
5. Design a web paywall in the Paywall editor. Enable Express checkout / Apple Pay if available.
6. Copy the Web Billing public API keys:
   - Sandbox: `rcb_sb_...`
   - Production: `rcb_...`

## Firebase Auth (same project as the app: `fresca-dev`)

1. Authorized domains: add `tryprepit.app` and `www.tryprepit.app` (plus any Vercel preview host you need).
2. Google sign-in is already enabled for the app. Confirm the Web client ID is present.
3. Apple sign-in on web: create an Apple **Services ID** with return URL
   `https://fresca-dev.firebaseapp.com/__/auth/handler`, then enter it on the Firebase Apple provider.
4. Web app config values already exist in `fresca_app/lib/firebase_options.dart` (`DefaultFirebaseOptions.web`).

## Vercel / local env

Set these on the website project (and in a local `.env.local`, which is gitignored):

```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=fresca-dev.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=fresca-dev
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=fresca-dev.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=764630790288
NEXT_PUBLIC_FIREBASE_APP_ID=1:764630790288:web:1cb684d569cdd41293a815
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-17FLLM4ZC0
NEXT_PUBLIC_REVENUECAT_WEB_API_KEY=
NEXT_PUBLIC_API_BASE_URL=https://api.tryprepit.app
NEXT_PUBLIC_ANALYTICS_ENABLED=true
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=https://b.tryprepit.app
NEXT_PUBLIC_POSTHOG_UI_HOST=https://eu.posthog.com
NEXT_PUBLIC_META_PIXEL_ID=
```

Use the sandbox RevenueCat key and a staging API URL while testing.

## Analytics (PostHog + Meta)

Website product events use the same names as the app, plus `platform: web` and (on funnel events) `signup_source: web`. After login the site identifies PostHog with the Firebase UID so RevenueCat `rc_*` events join the same person.

**PostHog (RevenueCat dashboard → Integrations → PostHog)**

1. Use the **EU** region (or self-hosted `https://b.tryprepit.app` if that is the ingest host).
2. Project API key = the same `NEXT_PUBLIC_POSTHOG_KEY` / `POSTHOG_PROJECT_API_KEY`.
3. Keep subscription events on the integration (`rc_initial_purchase_event`, `rc_trial_started_event`, …). Do not also send purchase events from the website or webhook.

**Meta Ads (RevenueCat dashboard → Integrations → Meta Ads)**

1. Prefer **Conversions API**. Add production Dataset ID + CAPI token.
2. Add sandbox Dataset ID + token for test purchases.
3. Event mapping: Trial Started → `StartTrial`; Trial Converted / Initial Purchase / Renewal → `Subscribe`.
4. Report **gross** revenue.
5. Once a sandbox web purchase shows a Meta delivery row on the RevenueCat customer, turn off the backend `processWebPurchaseMetaCapi` path so events are not double-counted.

The website Pixel (`NEXT_PUBLIC_META_PIXEL_ID`) is for `PageView`, `CompleteRegistration`, `InitiateCheckout`, and `AppStoreClick` only. Do not fire Pixel `Purchase` / `Subscribe`.

The website writes `$email`, `$posthogUserId`, UTMs, and `_fbp` / `_fbc` onto the RevenueCat customer before the web paywall so the Meta integration can match web checkout.
