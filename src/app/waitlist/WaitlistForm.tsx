"use client";

import { useState, type FormEvent } from "react";
import { PRIMARY_BUTTON_CLASS } from "@/components/ui/buttons";
import { CONTACT_HONEYPOT_FIELD, CONTACT_LIMITS } from "@/lib/contact";
import { LANDING_EVENTS, trackLandingEvent } from "@/lib/landingAnalytics";

const inputClass =
  "h-14 w-full min-w-0 rounded-icon border border-line-strong bg-page px-4 text-body text-ink placeholder:text-ink-faint transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus";

/** `place`: a region name (like Quebec) when the visitor was sent here from checkout for their region. */
export default function WaitlistForm({ place }: { place?: string }) {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setStatus("sending");
    const response = await fetch("/api/waitlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: form.get("email"),
        [CONTACT_HONEYPOT_FIELD]: form.get(CONTACT_HONEYPOT_FIELD),
      }),
    }).catch(() => null);
    const ok = Boolean(response?.ok);
    setStatus(ok ? "sent" : "error");
    trackLandingEvent(LANDING_EVENTS.waitlistSubmit, "waitlist", {
      result: ok ? "ok" : "error",
      waitlist_region: place ?? null,
      status: response?.status ?? null,
    });
  }

  if (status === "sent") {
    return (
      <p role="status" className="text-body text-ink-secondary">
        You&apos;re on the list. We&apos;ll email you when PrepIt is {place ? `available in ${place}` : "in your country"}.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full flex-col gap-4 text-left">
      <label htmlFor="waitlist-email" className="text-small font-medium text-ink-secondary">
        Email
      </label>
      <input
        id="waitlist-email"
        name="email"
        type="email"
        required
        autoComplete="email"
        maxLength={CONTACT_LIMITS.email}
        className={inputClass}
      />
      <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <input name={CONTACT_HONEYPOT_FIELD} tabIndex={-1} autoComplete="off" />
      </div>
      <button type="submit" disabled={status === "sending"} className={PRIMARY_BUTTON_CLASS}>
        {status === "sending" ? "Joining…" : "Join the waitlist"}
      </button>
      {status === "error" && (
        <p role="alert" className="text-small text-error">
          That didn&apos;t go through. Please try again.
        </p>
      )}
      <p className="text-small text-ink-muted">We&apos;ll only use your email to tell you when PrepIt launches where you are.</p>
    </form>
  );
}
