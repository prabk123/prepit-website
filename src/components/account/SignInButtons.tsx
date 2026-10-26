"use client";

import { useEffect, useState } from "react";
import { AppleLogo } from "@/components/ui/AppStoreButton";
import { PRIMARY_BUTTON_CLASS, SECONDARY_BUTTON_CLASS } from "@/components/ui/buttons";
import { isAppleSignInEnabled } from "@/lib/firebase/config";
import {
  isInAppBrowser,
  isSignInAvailable,
  systemBrowserUrl,
  SignInError,
  signInAuthDomain,
  signInWith,
  type SignInFailure,
  type SignInProvider,
} from "@/lib/firebase/auth";
import { trackWebFunnelEvent, WEB_FUNNEL_EVENTS } from "@/lib/webFunnelAnalytics";

function GoogleLogo() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden>
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  );
}

/** The message shown for each failure. Cancelling shows nothing. */
export const SIGN_IN_FAILURE_MESSAGES: Record<SignInFailure, string | null> = {
  cancelled: "Sign-in was cancelled. Nothing was saved or charged. Try again, or use the other option.",
  popup_blocked: "Your browser blocked the sign-in window. Allow pop-ups for this site and try again.",
  different_provider:
    "This email already signs in to PrepIt another way. Try the other button, the one you use in the app.",
  network: "We couldn't reach the sign-in service. Check your connection and try again.",
  unauthorized_domain: "Sign-in isn't set up for this address yet.",
  unavailable: "Sign-in isn't available right now. Please try again later.",
  unknown: "Something went wrong signing you in. Please try again.",
};

/**
 * Sign in with Apple (when it's set up) and Google, the same two ways the app
 * signs people in. `context` is sent with the analytics events.
 */
export default function SignInButtons({
  context,
  onSignedIn,
  loginHint,
}: {
  context: Record<string, string | null>;
  onSignedIn?: (provider: SignInProvider) => void;
  /** An email to start Google's account picker on (the quiz's). */
  loginHint?: string;
}) {
  const [busy, setBusy] = useState<SignInProvider | null>(null);
  const [failure, setFailure] = useState<SignInFailure | null>(null);
  const [inAppBrowser, setInAppBrowser] = useState(false);
  const [browserUrl, setBrowserUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const inApp = isInAppBrowser(navigator.userAgent);
    setInAppBrowser(inApp);
    if (inApp) setBrowserUrl(systemBrowserUrl(window.location.href, navigator.userAgent));
  }, []);

  if (!isSignInAvailable()) {
    return <p className="text-body text-ink-secondary">{SIGN_IN_FAILURE_MESSAGES.unavailable}</p>;
  }

  async function start(provider: SignInProvider) {
    setBusy(provider);
    setFailure(null);
    trackWebFunnelEvent(WEB_FUNNEL_EVENTS.signInStart, {
      ...context,
      signup_method: provider,
      auth_domain: signInAuthDomain(),
    });
    try {
      await signInWith(provider, { loginHint });
      onSignedIn?.(provider);
    } catch (error) {
      const code = error instanceof SignInError ? error.code : "unknown";
      setFailure(code);
      // A closed popup is its own event, so failure counts stay comparable
      // with earlier weeks. It is also what a Google error page in the popup
      // (redirect_uri_mismatch) turns into once the visitor closes it.
      trackWebFunnelEvent(code === "cancelled" ? WEB_FUNNEL_EVENTS.signInCancelled : WEB_FUNNEL_EVENTS.signInFailed, {
        ...context,
        signup_method: provider,
        ...(code === "cancelled" ? {} : { reason: code }),
        auth_domain: signInAuthDomain(),
      });
    } finally {
      setBusy(null);
    }
  }

  async function copyLink() {
    trackWebFunnelEvent(WEB_FUNNEL_EVENTS.inAppBrowserEscape, { ...context, action: "copy_link" });
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  const message = failure ? SIGN_IN_FAILURE_MESSAGES[failure] : null;

  return (
    <div className="flex w-full flex-col gap-3">
      {isAppleSignInEnabled() && (
        <button
          type="button"
          className={PRIMARY_BUTTON_CLASS}
          disabled={busy !== null}
          onClick={() => void start("apple")}
        >
          <AppleLogo />
          {busy === "apple" ? "Signing in…" : "Continue with Apple"}
        </button>
      )}
      {inAppBrowser ? (
        <>
          {/* Google refuses sign-in inside app browsers: the button says what to do instead. */}
          <button type="button" className={`${SECONDARY_BUTTON_CLASS} h-auto min-h-14 flex-col gap-0 py-2`} disabled>
            <span className="inline-flex items-center gap-2.5">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-surface">
                <GoogleLogo />
              </span>
              Continue with Google
            </span>
            <span className="text-[12.5px] font-medium">
              {browserUrl?.startsWith("x-safari") ? "Open in Safari to use Google" : "Open in your browser to use Google"}
            </span>
          </button>
          <div role="status" className="flex flex-col gap-3 rounded-tile border border-energy bg-energy/20 p-4 text-left text-small text-ink-secondary">
            <p>
              <b className="font-bold text-ink">You&apos;re in this app&apos;s own browser.</b>{" "}
              {isAppleSignInEnabled() ? "Continue with Apple works here. " : ""}To use Google, open this page in{" "}
              {browserUrl?.startsWith("x-safari") ? "Safari" : "your browser"}
              {browserUrl ? "." : ": tap ••• at the top, then Open in external browser."}
            </p>
            <div className="flex flex-col gap-2 sm:flex-row">
              {browserUrl && (
                <a
                  href={browserUrl}
                  className={PRIMARY_BUTTON_CLASS}
                  onClick={() =>
                    trackWebFunnelEvent(WEB_FUNNEL_EVENTS.inAppBrowserEscape, { ...context, action: "open_browser" })
                  }
                >
                  {browserUrl.startsWith("x-safari") ? "Open in Safari" : "Open in your browser"}
                </a>
              )}
              <button type="button" className={SECONDARY_BUTTON_CLASS} onClick={() => void copyLink()}>
                {copied ? "Link copied" : "Copy page link"}
              </button>
            </div>
          </div>
        </>
      ) : (
        <button
          type="button"
          className={isAppleSignInEnabled() ? SECONDARY_BUTTON_CLASS : PRIMARY_BUTTON_CLASS}
          disabled={busy !== null}
          onClick={() => void start("google")}
        >
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-surface">
            <GoogleLogo />
          </span>
          {busy === "google" ? "Signing in…" : "Continue with Google"}
        </button>
      )}
      <p
        role="status"
        aria-live="polite"
        className={message ? `text-small ${failure === "cancelled" ? "text-ink-secondary" : "text-error"}` : "sr-only"}
      >
        {message ?? ""}
      </p>
    </div>
  );
}
