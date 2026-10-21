"use client";

import Link from "next/link";
import { useState } from "react";
import { useEmailToken } from "@/components/quiz/useEmailToken";
import { PRIMARY_BUTTON_CLASS, SECONDARY_BUTTON_CLASS } from "@/components/ui/buttons";
import { deleteLead, unsubscribeLead } from "@/lib/quiz/leadApi";
import { QUIZ_FUNNEL_ID } from "@/lib/quiz/quiz";
import { trackWebFunnelEvent, WEB_FUNNEL_EVENTS } from "@/lib/webFunnelAnalytics";

type Action = "unsubscribe" | "delete";
type State = { status: "idle" } | { status: "working"; action: Action } | { status: "done"; action: Action } | { status: "error"; action: Action };

const DONE: Record<Action, { title: string; body: string }> = {
  unsubscribe: {
    title: "You won't get these emails again",
    body: "We've stopped every email from the quiz to this address. Your saved plan is still there until it expires.",
  },
  delete: {
    title: "Your details are deleted",
    body: "We've deleted your email address and quiz answers, and we won't email this address from the quiz again.",
  },
};

/**
 * Stop the quiz's emails, or delete the address and answers, from the token
 * in an email's link (`POST /web-leads/unsubscribe` and `/delete`). Both act
 * on the whole address and say so. A PrepIt account, if there is one, is
 * managed in the app.
 */
export default function EmailPreferences() {
  const token = useEmailToken();
  const [state, setState] = useState<State>({ status: "idle" });

  const run = async (action: Action) => {
    if (!token) return;
    setState({ status: "working", action });
    try {
      await (action === "delete" ? deleteLead(token) : unsubscribeLead(token));
      setState({ status: "done", action });
      trackWebFunnelEvent(WEB_FUNNEL_EVENTS.leadPreferencesAction, { funnel_id: QUIZ_FUNNEL_ID, action });
    } catch {
      setState({ status: "error", action });
    }
  };

  if (token === undefined) {
    return <p className="text-body text-ink-secondary" role="status">Loading…</p>;
  }

  if (token === null) {
    return (
      <>
        <h1 className="font-display text-title text-ink text-balance">Open this page from your email</h1>
        <p className="text-body text-ink-secondary">
          Use the &ldquo;Email preferences&rdquo; link at the bottom of any email from the PrepIt quiz. For anything else, contact us.
        </p>
        <Link href="/contact" className={SECONDARY_BUTTON_CLASS}>
          Contact us
        </Link>
      </>
    );
  }

  if (state.status === "done") {
    return (
      <>
        <h1 className="font-display text-title text-ink text-balance" role="status">
          {DONE[state.action].title}
        </h1>
        <p className="text-body text-ink-secondary">{DONE[state.action].body}</p>
        <p className="text-small text-ink-muted">This doesn&apos;t change a PrepIt account, if you have one; that is managed in the app.</p>
      </>
    );
  }

  const working = state.status === "working";
  return (
    <>
      <h1 className="font-display text-title text-ink text-balance">Email preferences</h1>
      <p className="text-body text-ink-secondary">
        These choices cover every email from the PrepIt quiz to this address.
      </p>
      <div className="flex w-full flex-col gap-3">
        <button type="button" className={PRIMARY_BUTTON_CLASS} disabled={working} onClick={() => run("unsubscribe")}>
          {working && state.action === "unsubscribe" ? "Stopping…" : "Stop these emails"}
        </button>
        <button type="button" className={SECONDARY_BUTTON_CLASS} disabled={working} onClick={() => run("delete")}>
          {working && state.action === "delete" ? "Deleting…" : "Delete my details"}
        </button>
      </div>
      <p className="text-small text-ink-muted">
        Delete my details also removes your quiz answers and saved plan.
      </p>
      {state.status === "error" && (
        <p role="alert" className="text-small text-error">
          That didn&apos;t go through. Try again in a minute.
        </p>
      )}
    </>
  );
}
