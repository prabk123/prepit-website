"use client";

import type { Auth, User } from "firebase/auth";
import { getFirebaseConfig, isProductionDeploy } from "@/lib/firebase/config";

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

async function providerFor(provider: SignInProvider) {
  const { GoogleAuthProvider, OAuthProvider } = await import("firebase/auth");
  if (provider === "google") {
    const google = new GoogleAuthProvider();
    google.setCustomParameters({ prompt: "select_account" });
    return google;
  }
  // Same provider id as the app's Sign in with Apple, so the same Apple ID
  // gives the same Firebase user once the Services ID is grouped with the app.
  const apple = new OAuthProvider("apple.com");
  apple.addScope("email");
  apple.addScope("name");
  return apple;
}

/**
 * Signs in with a popup. Where popups can't open (some phone browsers), it
 * falls back to a full-page redirect, and the page picks the result up with
 * `completeRedirectSignIn` when it loads again.
 */
export async function signInWith(provider: SignInProvider): Promise<User> {
  const auth = await loadAuth();
  const { signInWithPopup, signInWithRedirect } = await import("firebase/auth");
  const authProvider = await providerFor(provider);
  try {
    const credential = await signInWithPopup(auth, authProvider);
    return credential.user;
  } catch (error) {
    const failure = toFailure(error);
    if (failure === "popup_blocked") {
      await signInWithRedirect(auth, authProvider);
      // The page navigates away; this promise never settles in practice.
      return new Promise<User>(() => {});
    }
    throw new SignInError(failure);
  }
}

/** Finishes a redirect sign-in started by `signInWith`, if there was one. */
export async function completeRedirectSignIn(): Promise<User | null> {
  if (!isSignInAvailable()) return null;
  const auth = await loadAuth();
  const { getRedirectResult } = await import("firebase/auth");
  try {
    const result = await getRedirectResult(auth);
    return result?.user ?? null;
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

export async function signOutOfWebsite(): Promise<void> {
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
