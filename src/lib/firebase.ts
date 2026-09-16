"use client";

import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  OAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  onAuthStateChanged,
  type Auth,
  type User,
} from "firebase/auth";

function firebaseConfig() {
  return {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  };
}

export function isFirebaseConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_FIREBASE_API_KEY?.trim());
}

let app: FirebaseApp | null = null;
let auth: Auth | null = null;

export function getFirebaseApp(): FirebaseApp {
  if (app) return app;
  app = getApps()[0] ?? initializeApp(firebaseConfig());
  return app;
}

export function getFirebaseAuth(): Auth {
  if (auth) return auth;
  auth = getAuth(getFirebaseApp());
  return auth;
}

export async function getIdToken(): Promise<string | null> {
  const user = getFirebaseAuth().currentUser;
  if (!user) return null;
  return user.getIdToken();
}

export function waitForAuthUser(timeoutMs = 2000): Promise<User | null> {
  const current = getFirebaseAuth().currentUser;
  if (current) return Promise.resolve(current);
  return new Promise((resolve) => {
    const unsub = onAuthStateChanged(getFirebaseAuth(), (user) => {
      window.clearTimeout(timer);
      unsub();
      resolve(user);
    });
    const timer = window.setTimeout(() => {
      unsub();
      resolve(getFirebaseAuth().currentUser);
    }, timeoutMs);
  });
}

function isPopupBlocked(error: unknown): boolean {
  const code = typeof error === "object" && error && "code" in error
    ? String((error as { code?: string }).code)
    : "";
  return (
    code === "auth/popup-blocked" ||
    code === "auth/popup-closed-by-user" ||
    code === "auth/cancelled-popup-request" ||
    code === "auth/operation-not-supported-in-this-environment"
  );
}

export async function consumeRedirectResult(): Promise<User | null> {
  try {
    const result = await getRedirectResult(getFirebaseAuth());
    return result?.user ?? null;
  } catch {
    return null;
  }
}

export async function signInWithGoogle(): Promise<User> {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(getFirebaseAuth(), provider);
    return result.user;
  } catch (error) {
    if (!isPopupBlocked(error)) throw error;
    await signInWithRedirect(getFirebaseAuth(), provider);
    throw new Error("REDIRECT_IN_PROGRESS");
  }
}

export async function signInWithApple(): Promise<User> {
  const provider = new OAuthProvider("apple.com");
  provider.addScope("email");
  provider.addScope("name");
  try {
    const result = await signInWithPopup(getFirebaseAuth(), provider);
    return result.user;
  } catch (error) {
    if (!isPopupBlocked(error)) throw error;
    await signInWithRedirect(getFirebaseAuth(), provider);
    throw new Error("REDIRECT_IN_PROGRESS");
  }
}

export function splitDisplayName(displayName: string | null | undefined): {
  firstName: string;
  lastName: string;
} {
  const parts = (displayName ?? "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 0) return { firstName: "", lastName: "" };
  if (parts.length === 1) return { firstName: parts[0], lastName: "" };
  return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
}
