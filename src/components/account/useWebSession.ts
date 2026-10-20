"use client";

import type { User } from "firebase/auth";
import { useCallback, useEffect, useRef, useState } from "react";
import { completeRedirectSignIn, SignInError, watchUser, type SignInFailure } from "@/lib/firebase/auth";
import { fetchAccountSummary, PrepItApiError, type AccountSummary } from "@/lib/prepitApi";
import { identifyWebUser } from "@/lib/webFunnelAnalytics";

export type WebSession =
  | { status: "loading" }
  | { status: "signedOut"; redirectError: SignInFailure | null }
  | { status: "signedIn"; user: User; account: AccountState };

export type AccountState =
  | { status: "loading" }
  | { status: "ready"; summary: AccountSummary }
  | { status: "error"; code: string };

/**
 * The visitor's Firebase sign-in and, once signed in, their PrepIt account
 * from `GET /account`. Shared by the sign-in, checkout and account pages.
 */
export function useWebSession(): { session: WebSession; reloadAccount: () => void } {
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [redirectError, setRedirectError] = useState<SignInFailure | null>(null);
  // The account answer for one uid and reload; any other key reads as loading.
  const [account, setAccount] = useState<{ key: string; state: AccountState } | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const lastUid = useRef<string | null>(null);

  useEffect(() => {
    completeRedirectSignIn().catch((error: unknown) => {
      if (error instanceof SignInError && error.code !== "cancelled") setRedirectError(error.code);
    });
    return watchUser(setUser);
  }, []);

  const uid = user?.uid ?? null;

  useEffect(() => {
    if (!uid) return;
    if (lastUid.current !== uid) {
      lastUid.current = uid;
      identifyWebUser(uid);
    }
    let cancelled = false;
    const key = `${uid}:${reloadKey}`;
    fetchAccountSummary()
      .then((summary) => {
        if (!cancelled) setAccount({ key, state: { status: "ready", summary } });
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        const code =
          error instanceof PrepItApiError ? (error.code ?? `http_${error.status}`) : "unknown";
        setAccount({ key, state: { status: "error", code } });
      });
    return () => {
      cancelled = true;
    };
  }, [uid, reloadKey]);

  const reloadAccount = useCallback(() => setReloadKey((key) => key + 1), []);

  let session: WebSession;
  if (user === undefined) session = { status: "loading" };
  else if (user === null) session = { status: "signedOut", redirectError };
  else {
    const current = account?.key === `${user.uid}:${reloadKey}` ? account.state : null;
    session = { status: "signedIn", user, account: current ?? { status: "loading" } };
  }

  return { session, reloadAccount };
}
