"use client";

import type { Auth, User } from "firebase/auth";
import { getFirebaseConfig, isProductionDeploy } from "@/lib/firebase/config";
import { clearBridgeHandoff } from "@/lib/funnel/bridgeHandoff";

/**
 * Website sign-in with Google or Apple through Firebase Auth (PRE-264).
 * Firebase loads only on the pages that sign people in, never on the
 * marketing pages, and only in the browser.
 */

export type SignInProvider = "google" | "apple";

/** Why a sign-in failed, as a fixed code (sent to analytics, never the message). */
export type SignInFailure =
  | "cancelled"
  | "popup_blocked"
  | "different_provider"
  | "network"
  | "unauthorized_domain"
  | "unavailable"
  | "unknown";

let authPromise: Promise<Auth> | null = null;

/** True when this deployment has a Firebase project to sign in to. */
export function isSignInAvailable(): boolean {
  return getFirebaseConfig() !== null;
}

function loadAuth(): Promise<Auth> {
  authPromise ??= (async () => {
    const config = getFirebaseConfig();
    if (!config) throw new SignInError("unavailable");
    const [{ initializeApp, getApps }, { getAuth, connectAuthEmulator }] = await Promise.all([
      import("firebase/app"),
      import("firebase/auth"),
    ]);
    const app = getApps()[0] ?? initializeApp(config);
    const auth = getAuth(app);
    // Local checks only (Playwright against the Firebase Auth emulator).
    const emulator = process.env.NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_URL?.trim();
    if (emulator && !isProductionDeploy()) connectAuthEmulator(auth, emulator, { disableWarnings: true });
    return auth;
  })();
  return authPromise;
}

export class SignInError extends Error {
  constructor(readonly code: SignInFailure) {
    super(code);
    this.name = "SignInError";
  }
}

function toFailure(error: unknown): SignInFailure {
  if (error instanceof SignInError) return error.code;
  const code = (error as { code?: unknown } | null)?.code;
  switch (code) {
    case "auth/popup-closed-by-user":
    case "auth/cancelled-popup-request":
    case "auth/user-cancelled":
      return "cancelled";
    case "auth/popup-blocked":
    case "auth/operation-not-supported-in-this-environment":
      return "popup_blocked";
    case "auth/account-exists-with-different-credential":
    case "auth/credential-already-in-use":
      return "different_provider";
    case "auth/network-request-failed":
      return "network";
    case "auth/unauthorized-domain":
      return "unauthorized_domain";
    default:
      return "unknown";
  }
}

async function providerFor(provider: SignInProvider, loginHint?: string) {
  const { GoogleAuthProvider, OAuthProvider } = await import("firebase/auth");
  if (provider === "google") {
    const google = new GoogleAuthProvider();
    // The quiz's email, so Google's picker starts on that account.
    google.setCustomParameters({ prompt: "select_account", ...(loginHint ? { login_hint: loginHint } : {}) });
    return google;
  }
  // Same provider id as the app's Sign in with Apple, so the same Apple ID
  // gives the same Firebase user once the Services ID is grouped with the app.
  // Apple sends the name only on the very first sign-in, and the website
  // doesn't keep it; save it here if a web flow ever needs the name.
  const apple = new OAuthProvider("apple.com");
  apple.addScope("email");
  apple.addScope("name");
  return apple;
}

/**
 * Signs in with a popup. There is no redirect fallback: with the auth domain
 * on firebaseapp.com (a different site), browsers that partition third-party
 * storage drop a redirect sign-in silently. A blocked popup shows a message
 * instead. A redirect needs the auth domain served from this site first
 * (proxy `/__/auth/*` and add it to the OAuth client's redirect URIs).
 */
export async function signInWith(provider: SignInProvider, options: { loginHint?: string } = {}): Promise<User> {
  const auth = await loadAuth();
  const { signInWithPopup } = await import("firebase/auth");
  const authProvider = await providerFor(provider, options.loginHint);
  try {
    const credential = await signInWithPopup(auth, authProvider);
    return credential.user;
  } catch (error) {
    throw new SignInError(toFailure(error));
  }
}

/** Calls `listener` with the signed-in user (or null) now and on every change. */
export function watchUser(listener: (user: User | null) => void): () => void {
  if (!isSignInAvailable()) {
    listener(null);
    return () => {};
  }
  let unsubscribe: (() => void) | null = null;
  let cancelled = false;
  void loadAuth().then(async (auth) => {
    const { onAuthStateChanged } = await import("firebase/auth");
    if (cancelled) return;
    unsubscribe = onAuthStateChanged(auth, listener);
  });
  return () => {
    cancelled = true;
    unsubscribe?.();
  };
}

/** A fresh Firebase ID token for the backend, or null when signed out. */
export async function getIdToken(): Promise<string | null> {
  if (!isSignInAvailable()) return null;
  const auth = await loadAuth();
  await auth.authStateReady();
  return auth.currentUser ? auth.currentUser.getIdToken() : null;
}

/**
 * Signs out of the website. The quiz's saved answers go too, so they never
 * reach the next person to sign in on this browser, unless `keepQuizAnswers`
 * (the "use your other account" step, where the same person signs straight
 * back in with Apple or Google).
 */
export async function signOutOfWebsite({ keepQuizAnswers = false }: { keepQuizAnswers?: boolean } = {}): Promise<void> {
  if (!keepQuizAnswers) clearBridgeHandoff();
  if (!isSignInAvailable()) return;
  const auth = await loadAuth();
  const { signOut } = await import("firebase/auth");
  await signOut(auth);
}

/** "google" or "apple" for the provider this Firebase user signed in with. */
export function providerOf(user: User): SignInProvider | null {
  for (const info of user.providerData) {
    if (info.providerId === "google.com") return "google";
    if (info.providerId === "apple.com") return "apple";
  }
  return null;
}

/**
 * Google refuses sign-in inside app webviews (Instagram, Facebook, TikTok…),
 * which is where most ad traffic lands. Those visitors are asked to open the
 * page in their browser first.
 */
export function isInAppBrowser(userAgent: string): boolean {
  return /FBAN|FBAV|FB_IAB|Instagram|TikTok|musical_ly|BytedanceWebview|Snapchat|LinkedInApp|Line\/|Twitter|Pinterest/i.test(
    userAgent,
  );
}

/**
 * A link that opens `url` in the phone's own browser from an in-app browser:
 * Safari's `x-safari-https` scheme on iOS (iOS 17 and later), an Android
 * intent with no package, which picks the default browser. Null elsewhere,
 * where copying the link is the fallback.
 */
export function systemBrowserUrl(url: string, userAgent: string): string | null {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }
  if (parsed.protocol !== "https:") return null;
  const rest = `${parsed.host}${parsed.pathname}${parsed.search}${parsed.hash}`;
  if (/iPhone|iPad|iPod/i.test(userAgent)) return `x-safari-https://${rest}`;
  if (/Android/i.test(userAgent)) return `intent://${parsed.host}${parsed.pathname}${parsed.search}#Intent;scheme=https;end`;
  return null;
}
