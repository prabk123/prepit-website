"use client";

import type { User } from "firebase/auth";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import SignInButtons from "@/components/account/SignInButtons";
import SectionHeading from "@/components/ui/SectionHeading";
import { PRIMARY_BUTTON_CLASS, SECONDARY_BUTTON_CLASS, TEXT_BUTTON_CLASS } from "@/components/ui/buttons";
import { answerConnectRequest, fetchConnectRequest, type ConnectRequest } from "@/lib/connector/connectApi";
import {
  clientKindFromHost,
  CONNECTOR_READS,
  parseInteractionUid,
  type ConnectBlockedReason,
} from "@/lib/connector/connectParams";
import { providerOf, signOutOfWebsite, watchUser } from "@/lib/firebase/auth";
import { identifyWebUser, resetWebUser, trackWebFunnelEvent, WEB_FUNNEL_EVENTS } from "@/lib/webFunnelAnalytics";

const PROVIDER_NAMES = { google: "Google", apple: "Apple" } as const;

/** Draft wording for the internal release; PRE-503 settles the final consent text. */
const BLOCKED_COPY: Record<ConnectBlockedReason, { title: string; lead: string }> = {
  flag_off: {
    title: "Not available yet",
    lead: "Connecting AI apps to PrepIt isn't available on your account yet.",
  },
  no_subscription: {
    title: "You need a PrepIt subscription",
    lead: "Connecting an AI app needs an active PrepIt subscription or free trial.",
  },
  no_account: {
    title: "Finish setting up PrepIt first",
    lead: "There's no PrepIt account for this sign-in yet. Finish setting up in the PrepIt app, then connect again. If you use PrepIt with a different Google or Apple account, sign out and use that one.",
  },
  deleted: {
    title: "Your account is scheduled for deletion",
    lead: "Open the PrepIt app and restore your account to connect an AI app.",
  },
  disabled: {
    title: "Not available right now",
    lead: "Connecting AI apps isn't available right now. Please try again later.",
  },
  unknown: {
    title: "This account can't connect",
    lead: "PrepIt can't connect this account right now. If something looks wrong, email support@tryprepit.app.",
  },
};

type Load =
  | { status: "loading" }
  | { status: "ready"; request: ConnectRequest }
  | { status: "error" };

type Answer =
  | { status: "idle" }
  | { status: "sending"; choice: "allow" | "cancel" }
  | { status: "redirecting"; choice: "allow" | "cancel" }
  | { status: "blocked"; reason: ConnectBlockedReason; redirectTo: string | null }
  | { status: "expired" }
  | { status: "error"; choice: "allow" | "cancel" };

function Tick() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden className="mt-0.5 shrink-0 text-accent">
      <path d="M4.5 10.5l3.5 3.5 7.5-8" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function subscribeToNothing() {
  return () => {};
}

/** The request id from `?interaction=`, read once per render on the client. */
function readInteractionUid(): string | null {
  return parseInteractionUid(new URLSearchParams(window.location.search).get("interaction"));
}

/**
 * The sign-in and consent page an AI app (Claude at launch) sends people to
 * when they connect PrepIt (PRE-507). The OAuth server (fresca_backend
 * PRE-504) owns the request; this page signs the person in with Google or
 * Apple and answers Allow or Cancel for this browser's request.
 */
export default function ConnectConsent() {
  // undefined while rendering on the server; null when the query has no valid id.
  const uid = useSyncExternalStore(subscribeToNothing, readInteractionUid, () => undefined);
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [load, setLoad] = useState<{ key: string; load: Load } | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [answer, setAnswer] = useState<Answer>({ status: "idle" });
  const tracked = useRef<string | null>(null);

  useEffect(() => watchUser(setUser), []);

  const personUid = user?.uid ?? null;
  const loadKey = uid && personUid ? `${personUid}:${uid}:${reloadKey}` : null;

  useEffect(() => {
    if (!personUid) return;
    identifyWebUser(personUid);
  }, [personUid]);

  useEffect(() => {
    if (!loadKey || !uid) return;
    let cancelled = false;
    fetchConnectRequest(uid)
      .then((request) => {
        if (!cancelled) setLoad({ key: loadKey, load: { status: "ready", request } });
      })
      .catch(() => {
        if (!cancelled) setLoad({ key: loadKey, load: { status: "error" } });
      });
    return () => {
      cancelled = true;
    };
  }, [loadKey, uid]);

  const current: Load = load && load.key === loadKey ? load.load : { status: "loading" };
  const request = current.status === "ready" ? current.request : null;
  const client =
    request && request.kind !== "expired" ? clientKindFromHost(request.redirectHost) : null;

  // One page view per state the person actually sees.
  const viewState: string | null =
    uid === undefined || user === undefined
      ? null
      : uid === null
        ? "missing_request"
        : user === null
          ? "sign_in"
          : current.status === "loading"
            ? null
            : current.status === "error"
              ? "error"
              : request?.kind === "expired"
                ? "expired"
                : request?.kind === "blocked"
                  ? request.reason
                  : "ready";

  useEffect(() => {
    if (!viewState) return;
    const key = `${personUid ?? "anon"}:${viewState}`;
    if (tracked.current === key) return;
    tracked.current = key;
    trackWebFunnelEvent(WEB_FUNNEL_EVENTS.connectView, { state: viewState, client });
  }, [viewState, personUid, client]);

  const respond = useCallback(
    async (choice: "allow" | "cancel") => {
      if (!uid) return;
      setAnswer({ status: "sending", choice });
      try {
        const result = await answerConnectRequest(uid, choice === "allow" ? "approve" : "deny");
        if (result.outcome === "redirect") {
          trackWebFunnelEvent(WEB_FUNNEL_EVENTS.connectChoice, { choice, outcome: "redirected", client });
          setAnswer({ status: "redirecting", choice });
          window.location.assign(result.redirectTo);
          return;
        }
        if (result.outcome === "blocked") {
          trackWebFunnelEvent(WEB_FUNNEL_EVENTS.connectChoice, { choice, outcome: "blocked", reason: result.reason, client });
          setAnswer({ status: "blocked", reason: result.reason, redirectTo: result.redirectTo });
          return;
        }
        trackWebFunnelEvent(WEB_FUNNEL_EVENTS.connectChoice, { choice, outcome: "expired", client });
        setAnswer({ status: "expired" });
      } catch {
        trackWebFunnelEvent(WEB_FUNNEL_EVENTS.connectChoice, { choice, outcome: "error", client });
        setAnswer({ status: "error", choice });
      }
    },
    [uid, client],
  );

  async function signOut() {
    await signOutOfWebsite();
    resetWebUser();
    setAnswer({ status: "idle" });
    tracked.current = null;
  }

  if (uid === undefined || user === undefined) return <p className="text-body text-ink-secondary">Loading…</p>;

  if (uid === null) {
    return (
      <SectionHeading
        as="h1"
        size="title"
        align="center"
        title="Start from your AI app"
        lead="This page opens when you connect PrepIt from an AI app like Claude. Open the app, add PrepIt and choose Connect."
      />
    );
  }

  if (user === null) {
    return (
      <>
        <SectionHeading
          as="h1"
          size="title"
          align="center"
          title="Connect PrepIt"
          lead="Sign in with the Google or Apple account you use in PrepIt. Then you'll see what the AI app is asking to read."
        />
        <SignInButtons context={{ page: "connect" }} />
      </>
    );
  }

  const provider = providerOf(user);
  const signedInAs = (
    <p className="ph-no-capture text-small text-ink-muted">
      Signed in{provider ? ` with ${PROVIDER_NAMES[provider]}` : ""}
      {user.email ? ` as ${user.email}` : ""}.{" "}
      <button type="button" className={TEXT_BUTTON_CLASS} onClick={() => void signOut()}>
        Use another account
      </button>
    </p>
  );

  const expiredView = (
    <>
      <SectionHeading
        as="h1"
        size="title"
        align="center"
        title="This request has expired"
        lead="It was already answered, timed out, or was started in another browser. Go back to your AI app and connect PrepIt again from this browser."
      />
      {signedInAs}
    </>
  );

  if (answer.status === "expired") return expiredView;

  if (answer.status === "redirecting") {
    return (
      <>
        <SectionHeading
          as="h1"
          size="title"
          align="center"
          title={answer.choice === "allow" ? "Connected" : "Not connected"}
          lead="Taking you back to your AI app…"
        />
        <p role="status" aria-live="polite" className="sr-only">
          Taking you back to your AI app.
        </p>
      </>
    );
  }

  if (answer.status === "blocked") {
    const copy = BLOCKED_COPY[answer.reason];
    return (
      <>
        <SectionHeading as="h1" size="title" align="center" title={copy.title} lead={copy.lead} />
        {answer.redirectTo && (
          <a href={answer.redirectTo} className={SECONDARY_BUTTON_CLASS}>
            Back to your AI app
          </a>
        )}
        {signedInAs}
      </>
    );
  }

  if (current.status === "loading") {
    return (
      <>
        <SectionHeading as="h1" size="title" align="center" title="Checking the request…" />
        {signedInAs}
      </>
    );
  }

  if (current.status === "error") {
    return (
      <>
        <SectionHeading as="h1" size="title" align="center" title="We couldn't load this request" lead="Please try again in a moment." />
        <button type="button" className={PRIMARY_BUTTON_CLASS} onClick={() => setReloadKey((key) => key + 1)}>
          Try again
        </button>
        {signedInAs}
      </>
    );
  }

  const req = current.request;
  if (req.kind === "expired") return expiredView;

  const busy = answer.status === "sending";
  const errorLine =
    answer.status === "error"
      ? answer.choice === "allow"
        ? "We couldn't connect. Please try again."
        : "We couldn't send your answer. Please try again."
      : "";

  if (req.kind === "blocked") {
    const copy = BLOCKED_COPY[req.reason];
    return (
      <>
        <SectionHeading as="h1" size="title" align="center" title={copy.title} lead={copy.lead} />
        <div className="flex w-full flex-col gap-3">
          {req.reason === "no_subscription" && (
            <Link href="/checkout?funnel=account" className={PRIMARY_BUTTON_CLASS}>
              Get PrepIt
            </Link>
          )}
          <button type="button" className={SECONDARY_BUTTON_CLASS} disabled={busy} onClick={() => void respond("cancel")}>
            {busy ? "Going back…" : `Back to ${req.clientName}`}
          </button>
        </div>
        <p role="status" aria-live="polite" className={errorLine ? "text-small text-error" : "sr-only"}>
          {errorLine}
        </p>
        {signedInAs}
      </>
    );
  }

  return (
    <>
      <SectionHeading
        as="h1"
        size="title"
        align="center"
        title={`Allow ${req.clientName} to read your PrepIt data?`}
        lead={`${req.clientName} is asking to connect to your PrepIt account so it can answer questions about your nutrition.`}
      />
      <div className="flex w-full flex-col gap-3 text-left">
        <p className="text-small font-bold text-ink">It will be able to read:</p>
        <ul className="flex flex-col gap-2.5">
          {CONNECTOR_READS.map((item) => (
            <li key={item} className="flex gap-3 text-small text-ink-secondary">
              <Tick />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="w-full rounded-button border border-line bg-surface-raised p-4 text-left text-small text-ink-secondary">
        <p>
          <b className="font-bold text-ink">It can only read.</b>{" "}
          It can&apos;t log food, change your plans or goals, or edit your account. What you share is handled under {req.clientName}&apos;s own privacy terms once it has it.
        </p>
        <p className="mt-2">
          You can disconnect at any time on your{" "}
          <Link href="/account" className="font-medium text-ink underline underline-offset-4">
            account page
          </Link>{" "}
          or in {req.clientName}&apos;s settings.
        </p>
      </div>
      <div className="flex w-full flex-col gap-3">
        <button type="button" className={PRIMARY_BUTTON_CLASS} disabled={busy} onClick={() => void respond("allow")}>
          {answer.status === "sending" && answer.choice === "allow" ? "Connecting…" : "Allow"}
        </button>
        <button type="button" className={SECONDARY_BUTTON_CLASS} disabled={busy} onClick={() => void respond("cancel")}>
          {answer.status === "sending" && answer.choice === "cancel" ? "Cancelling…" : "Cancel"}
        </button>
      </div>
      <p role="status" aria-live="polite" className={errorLine ? "text-small text-error" : "sr-only"}>
        {errorLine}
      </p>
      {signedInAs}
    </>
  );
}
