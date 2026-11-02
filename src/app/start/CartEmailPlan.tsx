"use client";

import Link from "next/link";
import { useState } from "react";
import { FieldLabel, INPUT_CLASS } from "@/components/quiz/parts";
import { SECONDARY_BUTTON_CLASS } from "@/components/ui/buttons";
import { readAttribution } from "@/lib/funnel/attributionStore";
import type { BridgeHandoff } from "@/lib/funnel/bridgeHandoff";
import { cartLeadInput } from "@/lib/funnel/cartLead";
import { trackQuizLead } from "@/lib/metaPixel";
import { LeadApiError, saveLead } from "@/lib/quiz/leadApi";
import { isEmail, MARKETING_CONSENT_TEXT } from "@/lib/quiz/quiz";
import { getWebSessionId } from "@/lib/quiz/webSession";
import { trackWebFunnelEvent, WEB_FUNNEL_EVENTS } from "@/lib/webFunnelAnalytics";

type State = "closed" | "open" | "saving" | "invalid" | "failed" | "sent";

/**
 * "Not ready? Email me my plan" (PRE-439): a quiet link at the foot of the
 * quiz cart that opens a small email form with the optional, unticked
 * marketing box. It replaces the quiz's email gate. The lead carries the
 * quiz's answers from this browser, so signing in later (here or in the app)
 * picks them up. Nothing about the answers goes to Meta or into a URL.
 */
export default function CartEmailPlan({
  handoff,
  country,
  context,
}: {
  handoff: BridgeHandoff;
  country: string | null;
  context: Record<string, string | null>;
}) {
  const [state, setState] = useState<State>("closed");
  const [email, setEmail] = useState(handoff.email ?? "");
  const [marketingConsent, setMarketingConsent] = useState(false);
  const ok = isEmail(email);

  const open = () => {
    setState("open");
    trackWebFunnelEvent(WEB_FUNNEL_EVENTS.leaverEmailOpen, { ...context, entry: "quiz" });
    // After React shows the field.
    window.setTimeout(() => document.getElementById("cart-plan-email")?.focus(), 0);
  };

  const submit = async () => {
    if (!ok || state === "saving") return;
    setState("saving");
    const webSessionId = getWebSessionId();
    let errorStatus: number | undefined;
    let badEmail = false;
    let saved = false;
    if (webSessionId) {
      try {
        await saveLead(
          cartLeadInput({
            handoff,
            email,
            marketingConsent,
            consentText: MARKETING_CONSENT_TEXT,
            webSessionId,
            country,
            attribution: readAttribution(),
          }),
        );
        saved = true;
      } catch (error) {
        errorStatus = error instanceof LeadApiError ? error.status : 0;
        badEmail = error instanceof LeadApiError && error.status === 400 && /email/i.test(error.details ?? "");
      }
    } else {
      // Storage blocked: no session id to save the lead under.
      errorStatus = 0;
    }
    trackWebFunnelEvent(WEB_FUNNEL_EVENTS.leaverEmailSent, {
      ...context,
      entry: "quiz",
      saved,
      marketing_consent: marketingConsent,
      ...(errorStatus !== undefined ? { error_status: errorStatus } : {}),
    });
    if (saved) {
      // The same Meta Lead the email gate sent, with nothing in it.
      trackQuizLead();
      setState("sent");
      return;
    }
    // Only a refused address is theirs to fix.
    setState(badEmail ? "invalid" : "failed");
  };

  if (state === "closed") {
    return (
      <p className="text-small text-ink-secondary">
        Not ready?{" "}
        <button type="button" className="font-bold text-ink underline underline-offset-4" aria-expanded={false} onClick={open}>
          Email me my plan
        </button>
      </p>
    );
  }

  if (state === "sent") {
    return (
      <section aria-labelledby="cart-email-plan" className="flex flex-col gap-1.5 rounded-tile border border-line bg-surface px-5 py-4">
        <h2 id="cart-email-plan" className="font-display text-[19px] font-medium leading-tight text-ink">
          Your plan is on its way.
        </h2>
        <p role="status" className="text-small text-ink-secondary">
          We’ve emailed it to <b className="font-bold text-ink">{email.trim()}</b>. Your free week is here when you’re ready.
        </p>
      </section>
    );
  }

  return (
    <section aria-labelledby="cart-email-plan" className="flex flex-col gap-4 rounded-tile border border-line bg-surface px-5 py-4">
      <div className="flex flex-col gap-1">
        <h2 id="cart-email-plan" className="font-display text-[19px] font-medium leading-tight text-ink">
          Email me my plan
        </h2>
        <p className="text-small text-ink-secondary">We’ll send your plan so you can come back to it. No card, no account.</p>
      </div>
      <form
        noValidate
        className="flex flex-col gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          void submit();
        }}
      >
        <div>
          <FieldLabel htmlFor="cart-plan-email">Email</FieldLabel>
          <input
            id="cart-plan-email"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="you@example.com"
            className={INPUT_CLASS}
            value={email}
            aria-invalid={state === "invalid"}
            aria-describedby={state === "invalid" || state === "failed" ? "cart-plan-email-error" : undefined}
            onChange={(event) => {
              setEmail(event.target.value);
              if (state === "invalid" || state === "failed") setState("open");
            }}
          />
          {(state === "invalid" || state === "failed") && (
            <p id="cart-plan-email-error" role="alert" className="mt-1.5 text-small text-error">
              {state === "invalid" ? "Check your email address and try again." : "We couldn’t send it just now. Try again in a moment."}
            </p>
          )}
        </div>
        <label className="flex items-start gap-2.5 text-small text-ink-secondary">
          <input
            type="checkbox"
            className="mt-px size-5 flex-none accent-primary"
            checked={marketingConsent}
            onChange={(event) => setMarketingConsent(event.target.checked)}
          />
          {MARKETING_CONSENT_TEXT}
        </label>
        <button type="submit" className={SECONDARY_BUTTON_CLASS} disabled={!ok || state === "saving"}>
          {state === "saving" ? "Sending…" : "Email my plan"}
        </button>
      </form>
      <p className="text-[12.5px] leading-[1.45] text-ink-muted">
        We never sell your data. See our{" "}
        <Link className="text-ink-secondary underline" href="/privacy-policy">
          Privacy Policy
        </Link>
        .
      </p>
    </section>
  );
}
