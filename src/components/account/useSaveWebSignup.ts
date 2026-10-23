"use client";

import { useEffect, useRef, useState } from "react";
import type { WebSession } from "@/components/account/useWebSession";
import { clearBridgeHandoff, readBridgeHandoff, readWebSessionId } from "@/lib/funnel/bridgeHandoff";
import { readAttribution } from "@/lib/funnel/attributionStore";
import { PrepItApiError, saveWebSignupProfile } from "@/lib/prepitApi";
import { trackWebFunnelEvent, WEB_FUNNEL_EVENTS } from "@/lib/webFunnelAnalytics";

export type WebSignupSave = {
  status: "waiting" | "saving" | "done";
  /** This page's save made the account from the quiz's answers. */
  accountCreated: boolean;
};

/**
 * Starts (or finishes) the web sign-up for anyone signed in with no account
 * yet, once per uid: the funnel, how they found us, the quiz session id
 * (PRE-327) and, when the quiz left answers for the bridge (PRE-323), those
 * answers with `createAccount`, so the account exists before they pay.
 * Without answers no account is made and the app asks the questions.
 *
 * Someone who already has an account only sends the quiz session id (so the
 * email gate's lead is matched and its follow-ups stop), without holding the
 * page. Their answers are dropped: the account they have wins.
 *
 * `status` is "done" once there is nothing (more) to save, so a page can hold the
 * paywall until the account answer is final. A failed save never blocks
 * checkout; the purchase still belongs to the Firebase uid.
 */
export function useSaveWebSignup(
  session: WebSession,
  funnelId: string,
  reloadAccount: () => void,
): WebSignupSave {
  const [savedFor, setSavedFor] = useState<string | null>(null);
  const [createdFor, setCreatedFor] = useState<string | null>(null);
  const startedFor = useRef<string | null>(null);

  const uid = session.status === "signedIn" ? session.user.uid : null;
  const account = session.status === "signedIn" ? session.account : null;
  const summary = account?.status === "ready" ? account.summary : null;
  const needsSave = Boolean(summary && !summary.hasAccount && !summary.emailInUse);
  const hasAccount = Boolean(summary?.hasAccount);

  useEffect(() => {
    if (session.status !== "signedIn" || !uid || !summary || startedFor.current === uid) return;
    if (hasAccount) {
      startedFor.current = uid;
      // Old answers must not reach the next person to sign in on this browser.
      clearBridgeHandoff();
      const webSessionId = readWebSessionId();
      if (webSessionId) {
        void saveWebSignupProfile({ funnelId, createAccount: false, webSessionId }).catch(() => {
          // The lead stays unmatched; its follow-ups stop when it expires.
        });
      }
      return;
    }
    if (!needsSave) return;
    startedFor.current = uid;
    const handoff = readBridgeHandoff();
    // The backend prefers the quiz's name over the sign-in's, so only send it
    // when the sign-in has none (Apple sends a name only the first time).
    const firstName = session.user.displayName?.trim() ? undefined : handoff?.firstName;
    const user = handoff?.user || firstName ? { ...handoff?.user, ...(firstName ? { firstName } : {}) } : undefined;
    void saveWebSignupProfile({
      funnelId: handoff?.funnelId ?? funnelId,
      funnelVersion: handoff?.funnelVersion,
      answers: handoff?.answers,
      user,
      settings: handoff?.settings,
      healthConsent: handoff?.healthConsent,
      attribution: readAttribution(),
      createAccount: Boolean(handoff),
      webSessionId: readWebSessionId(),
    })
      .then((result) => {
        if (result.hasAccount) clearBridgeHandoff();
        if (handoff) {
          trackWebFunnelEvent(WEB_FUNNEL_EVENTS.bridgeAnswersSaved, {
            funnel_id: handoff.funnelId,
            health_consent: Boolean(handoff.healthConsent),
            account_created: result.accountCreated,
            not_created_reason: result.accountNotCreatedReason,
          });
        }
        // The account now exists: read it again so checkout sees it.
        if (result.accountCreated) {
          setCreatedFor(uid);
          reloadAccount();
        }
      })
      .catch((error: unknown) => {
        const status = error instanceof PrepItApiError ? error.status : 0;
        if (handoff) {
          trackWebFunnelEvent(WEB_FUNNEL_EVENTS.bridgeAnswersSaved, {
            funnel_id: handoff.funnelId,
            account_created: false,
            not_created_reason: status === 409 ? "email_in_use" : "error",
            status,
          });
        }
        // The account this would create belongs to another sign-in: the
        // account answer explains that, and the answers stay for that one.
        if (status === 409) {
          reloadAccount();
          return;
        }
        // Not saved: the app asks the questions instead, and the answers
        // must not follow the next sign-in on this browser.
        clearBridgeHandoff();
      })
      .finally(() => setSavedFor(uid));
  }, [session, uid, summary, needsSave, hasAccount, funnelId, reloadAccount]);

  const accountCreated = uid !== null && createdFor === uid;
  if (!uid || !summary) return { status: "waiting", accountCreated };
  if (!needsSave) return { status: "done", accountCreated };
  return { status: savedFor === uid ? "done" : "saving", accountCreated };
}
