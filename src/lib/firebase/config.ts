import type { FirebaseOptions } from "firebase/app";

/**
 * Firebase web config for website sign-in (PRE-264). The website signs people
 * in to the same Firebase project as the app, so a web account is the same
 * Firebase user (same uid) the app gets on the iPhone.
 *
 * Set per deployment (Vercel → Environment Variables):
 * - NEXT_PUBLIC_FIREBASE_API_KEY
 * - NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
 * - NEXT_PUBLIC_FIREBASE_PROJECT_ID
 * - NEXT_PUBLIC_FIREBASE_APP_ID
 * - NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID (optional)
 *
 * Local dev and Vercel previews fall back to the `fresca-dev` web app (the
 * same values as fresca_app lib/firebase_options.dart). A production deploy
 * never falls back: without its own values sign-in is switched off, so it can
 * never sign real visitors in to the dev project.
 */
const DEV_PROJECT: FirebaseOptions = {
  apiKey: "AIzaSyDOPWvKFRfkoxqPYT8YVewmNInhv_ty8q4",
  authDomain: "fresca-dev.firebaseapp.com",
  projectId: "fresca-dev",
  appId: "1:764630790288:web:1cb684d569cdd41293a815",
  messagingSenderId: "764630790288",
};

/** True on the production deploy (Vercel exposes NEXT_PUBLIC_VERCEL_ENV to the browser). */
export function isProductionDeploy(): boolean {
  const vercelEnv = process.env.NEXT_PUBLIC_VERCEL_ENV;
  if (vercelEnv) return vercelEnv === "production";
  return process.env.NODE_ENV === "production";
}

export function getFirebaseConfig(): FirebaseOptions | null {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY?.trim();
  const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN?.trim();
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.trim();
  const appId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID?.trim();

  if (apiKey && authDomain && projectId && appId) {
    return {
      apiKey,
      authDomain,
      projectId,
      appId,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID?.trim() || undefined,
    };
  }
  return isProductionDeploy() ? null : DEV_PROJECT;
}

/**
 * Sign in with Apple needs a Services ID grouped with the app's App ID, set up
 * in Apple Developer and Firebase (PRE-264). Until then the Apple button stays
 * hidden; set NEXT_PUBLIC_APPLE_SIGN_IN_ENABLED=true once it works.
 */
export function isAppleSignInEnabled(): boolean {
  return process.env.NEXT_PUBLIC_APPLE_SIGN_IN_ENABLED === "true";
}
