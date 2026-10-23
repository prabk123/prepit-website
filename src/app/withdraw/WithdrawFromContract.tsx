"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import SignInButtons from "@/components/account/SignInButtons";
import { useWebSession } from "@/components/account/useWebSession";
import SectionHeading from "@/components/ui/SectionHeading";
import { PRIMARY_BUTTON_CLASS, SECONDARY_BUTTON_CLASS, TEXT_BUTTON_CLASS } from "@/components/ui/buttons";
import { withdrawalWording } from "@/lib/contractWithdrawal";
import { providerOf, signOutOfWebsite } from "@/lib/firebase/auth";
import { confirmWithdrawal, fetchWithdrawalStatus, type WithdrawalStatus } from "@/lib/prepitApi";
import { resetWebUser, trackWebFunnelEvent, WEB_FUNNEL_EVENTS } from "@/lib/webFunnelAnalytics";

const PROVIDER_NAMES = { google: "Google", apple: "Apple" } as const;

type Eligible = Extract<WithdrawalStatus, { state: "eligible" }>;

type Step =
  | { kind: "loading" }
  | { kind: "error" }
  | { kind: "status"; status: WithdrawalStatus }
  | { kind: "confirm" | "sending" | "sendFailed" | "inProgress"; status: Eligible }
  | { kind: "done"; requestedAt: string; refunded: boolean; emailSent: boolean };

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" });
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, { dateStyle: "long", timeStyle: "short" });
}

export default function WithdrawFromContract({ country }: { country: string | null }) {
  const { session } = useWebSession();
  const wording = withdrawalWording(country);
  const [step, setStep] = useState<{ uid: string; step: Step } | null>(null);
  const [reload, setReload] = useState(0);
  const viewTrackedFor = useRef<string | null>(null);

  const uid = session.status === "signedIn" ? session.user.uid : null;
  const current: Step = step && step.uid === uid ? step.step : { kind: "loading" };

  useEffect(() => {
    if (!uid) return;
    let cancelled = false;
    fetchWithdrawalStatus()
      .then((status) => {
        if (cancelled) return;
        setStep({ uid, step: { kind: "status", status } });
        if (viewTrackedFor.current !== uid) {
          viewTrackedFor.current = uid;
          trackWebFunnelEvent(WEB_FUNNEL_EVENTS.withdrawalView, {
            state: status.state,
            in_trial: status.state === "eligible" ? status.inTrial : null,
          });
        }
      })
      .catch(() => {
        if (!cancelled) setStep({ uid, step: { kind: "error" } });
      });
    return () => {
      cancelled = true;
    };
  }, [uid, reload]);

  async function signOut() {
    await signOutOfWebsite();
    resetWebUser();
  }

  async function confirm(status: Eligible) {
    if (!uid) return;
    setStep({ uid, step: { kind: "sending", status } });
    try {
      const result = await confirmWithdrawal();
      trackWebFunnelEvent(WEB_FUNNEL_EVENTS.withdrawalConfirm, {
        outcome: result.outcome,
        refunded: result.outcome === "withdrawn" ? result.refunded : null,
      });
      if (result.outcome === "withdrawn") {
        setStep({ uid, step: { kind: "done", ...result } });
      } else if (result.outcome === "not_available") {
        setStep({ uid, step: { kind: "status", status: result.status } });
      } else {
        // Another tab is withdrawing right now: show that, then look again.
        setStep({ uid, step: { kind: "inProgress", status } });
        window.setTimeout(() => setReload((n) => n + 1), 4000);
      }
    } catch {
      trackWebFunnelEvent(WEB_FUNNEL_EVENTS.withdrawalConfirm, { outcome: "error", refunded: null });
      setStep({ uid, step: { kind: "sendFailed", status } });
    }
  }

  if (session.status === "loading") return <p className="text-body text-ink-secondary">Loading…</p>;

  if (session.status === "signedOut") {
    return (
      <>
        <SectionHeading
          as="h1"
          size="title"
          align="center"
          title={wording.title}
          lead={`If you bought PrepIt on our website in the last 14 days, you can ${wording.verb} your subscription here. Sign in with the Google or Apple account you subscribed with.`}
        />
        <SignInButtons context={{ page: "withdraw" }} />
      </>
    );
  }

  const provider = providerOf(session.user);
  const signedInAs = (
    <p className="ph-no-capture text-small text-ink-muted">
      Signed in{provider ? ` with ${PROVIDER_NAMES[provider]}` : ""}
      {session.user.email ? ` as ${session.user.email}` : ""}.{" "}
      <button type="button" className={TEXT_BUTTON_CLASS} onClick={() => void signOut()}>
        Sign out
      </button>
    </p>
  );
  const retry = () => {
    setStep(null);
    setReload((n) => n + 1);
  };

  if (current.kind === "loading") {
    return (
      <>
        <SectionHeading as="h1" size="title" align="center" title="Checking your subscription…" />
        {signedInAs}
      </>
    );
  }

  if (current.kind === "error" || (current.kind === "status" && current.status.state === "unavailable")) {
    return (
      <>
        <SectionHeading
          as="h1"
          size="title"
          align="center"
          title="We couldn't check your subscription"
          lead="Please try again in a moment. If it keeps happening, email support@tryprepit.app and say you want to withdraw: we'll treat the date of your email as the date you withdrew."
        />
        <button type="button" className={PRIMARY_BUTTON_CLASS} onClick={retry}>
          Try again
        </button>
        {signedInAs}
      </>
    );
  }

  if (current.kind === "done") {
    return (
      <>
        <SectionHeading
          as="h1"
          size="title"
          align="center"
          title={`We've received your ${wording.noun}`}
          lead={
            current.refunded
              ? "Your subscription has ended and we've refunded your payment in full to the card you paid with. Banks usually take 5 to 10 days to show it."
              : "You were still in your free trial, so you haven't been charged and won't be."
          }
        />
        <p className="text-body font-medium text-ink">Received {formatDateTime(current.requestedAt)}</p>
        <p className="text-small text-ink-muted">
          {current.emailSent
            ? "We've emailed you a confirmation with this date and time."
            : "We couldn't send the confirmation email. Keep this page, or email support@tryprepit.app and we'll send it."}
        </p>
        {signedInAs}
      </>
    );
  }

  if (current.kind === "inProgress") {
    return (
      <>
        <SectionHeading
          as="h1"
          size="title"
          align="center"
          title={`Your ${wording.noun} is already being processed`}
          lead="This page will update in a moment."
        />
        {signedInAs}
      </>
    );
  }

  if (current.kind === "confirm" || current.kind === "sending" || current.kind === "sendFailed") {
    const sending = current.kind === "sending";
    return (
      <>
        <SectionHeading
          as="h1"
          size="title"
          align="center"
          title={`Confirm your ${wording.noun}`}
          lead={
            current.status.inTrial
              ? "Your free trial won't turn into a paid subscription, so you won't be charged. This can't be undone."
              : "Your subscription ends now, you lose access to PrepIt, and we refund your payment in full. This can't be undone."
          }
        />
        <div className="flex w-full flex-col gap-3">
          <button
            type="button"
            className={PRIMARY_BUTTON_CLASS}
            disabled={sending}
            onClick={() => void confirm(current.status)}
          >
            {sending ? "Sending…" : current.kind === "sendFailed" ? "Try again" : wording.confirm}
          </button>
          <button
            type="button"
            className={SECONDARY_BUTTON_CLASS}
            disabled={sending}
            onClick={() => uid && setStep({ uid, step: { kind: "status", status: current.status } })}
          >
            Go back
          </button>
        </div>
        <p role="status" aria-live="polite" className={current.kind === "sendFailed" ? "text-small text-error" : "sr-only"}>
          {current.kind === "sendFailed"
            ? `We couldn't complete your ${wording.noun}. Please try again, or email support@tryprepit.app.`
            : ""}
        </p>
        {signedInAs}
      </>
    );
  }

  const status = current.status;

  if (status.state === "eligible") {
    return (
      <>
        <SectionHeading
          as="h1"
          size="title"
          align="center"
          title={wording.title}
          lead={
            status.inTrial
              ? "You're in your free trial. If you withdraw, it won't turn into a paid subscription and you won't be charged."
              : "If you withdraw, your subscription ends now and we refund your payment in full."
          }
        />
        <p className="text-small text-ink-muted">You can withdraw until {formatDate(status.windowEndsAt)}.</p>
        <button
          type="button"
          className={PRIMARY_BUTTON_CLASS}
          onClick={() => uid && setStep({ uid, step: { kind: "confirm", status } })}
        >
          Continue
        </button>
        {signedInAs}
      </>
    );
  }

  if (status.state === "withdrawn") {
    return (
      <>
        <SectionHeading
          as="h1"
          size="title"
          align="center"
          title={`Your ${wording.noun} is done`}
          lead={
            status.emailSent
              ? `We received it ${formatDateTime(status.requestedAt)} and emailed you a confirmation. There's nothing more to do.`
              : `We received it ${formatDateTime(status.requestedAt)}. There's nothing more to do. If you'd like a confirmation email, write to support@tryprepit.app.`
          }
        />
        {signedInAs}
      </>
    );
  }

  if (status.state === "not_offered") {
    return (
      <>
        <SectionHeading
          as="h1"
          size="title"
          align="center"
          title="Withdrawal isn't available for your subscription"
          lead="The 14-day right to withdraw is for subscriptions bought in the UK and EEA. You can cancel any time to stop your subscription renewing, and our refund policy explains the rest."
        />
        <Link href="/account" className={PRIMARY_BUTTON_CLASS}>
          Manage subscription
        </Link>
        {signedInAs}
      </>
    );
  }

  if (status.state === "expired") {
    return (
      <>
        <SectionHeading
          as="h1"
          size="title"
          align="center"
          title="The 14 days have passed"
          lead={`The time to withdraw ended on ${formatDate(status.windowEndedAt)}. You can still cancel any time to stop your subscription renewing.`}
        />
        <Link href="/account" className={PRIMARY_BUTTON_CLASS}>
          Manage subscription
        </Link>
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
        title="No website subscription to withdraw from"
        lead="There's no PrepIt subscription bought on our website on this account. If you subscribed in the App Store, ask Apple for a refund at reportaproblem.apple.com. If you subscribed with a different Google or Apple account, sign out and sign in with that one."
      />
      {signedInAs}
    </>
  );
}
