"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { CONTACT_HONEYPOT_FIELD, CONTACT_LIMITS } from "@/lib/contact";
import { trackContactFormSubmitted } from "@/lib/posthogAnalytics";

export type ContactKind = "contact" | "feedback";

type Field = "name" | "email" | "message";
type FieldErrors = Partial<Record<Field, string>>;
type Status = "idle" | "sending" | "sent" | "failed";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(values: Record<Field, string>): FieldErrors {
  const errors: FieldErrors = {};
  if (!values.name.trim()) errors.name = "Enter your name.";
  if (!values.email.trim()) errors.email = "Enter your email address.";
  else if (!EMAIL_PATTERN.test(values.email.trim())) errors.email = "Enter an email address like name@example.com.";
  if (!values.message.trim()) errors.message = "Enter a message.";
  else if (values.message.length > CONTACT_LIMITS.message)
    errors.message = `Keep your message under ${CONTACT_LIMITS.message.toLocaleString("en-US")} characters.`;
  return errors;
}

const inputClass =
  "w-full min-w-0 rounded-icon border bg-page px-4 text-body text-ink placeholder:text-ink-faint transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream";

function borderFor(error?: string) {
  return error ? "border-error" : "border-ink-faint hover:border-ink-muted";
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="text-small text-error">
      {message}
    </p>
  );
}

/**
 * The contact and feedback form. Errors show under each field and are tied to
 * it for screen readers; the sent message stays until the visitor starts a
 * new one.
 */
export default function ContactForm({ kind }: { kind: ContactKind }) {
  const isFeedback = kind === "feedback";
  const [values, setValues] = useState<Record<Field, string>>({ name: "", email: "", message: "" });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<Status>("idle");
  const formRef = useRef<HTMLFormElement>(null);
  const sentRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const focusNameOnReturn = useRef(false);

  // "Send another message" removes the button it sits on, so focus would drop
  // to the page; put it on Name instead.
  useEffect(() => {
    if (status === "idle" && focusNameOnReturn.current) {
      focusNameOnReturn.current = false;
      nameRef.current?.focus();
    }
  }, [status]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const name = e.target.name as Field;
    setValues((prev) => ({ ...prev, [name]: e.target.value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    const found = validate(values);
    setErrors(found);
    const firstInvalid = (["name", "email", "message"] as Field[]).find((field) => found[field]);
    if (firstInvalid) {
      trackContactFormSubmitted(kind, "invalid");
      formRef.current?.querySelector<HTMLElement>(`[name="${firstInvalid}"]`)?.focus();
      return;
    }

    setStatus("sending");
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: values.name.trim(),
          email: values.email.trim(),
          message: values.message.trim(),
          type: kind,
          [CONTACT_HONEYPOT_FIELD]:
            formRef.current?.querySelector<HTMLInputElement>(`[name="${CONTACT_HONEYPOT_FIELD}"]`)?.value ?? "",
        }),
      });

      if (!response.ok) {
        trackContactFormSubmitted(kind, "failed", response.status);
        setStatus("failed");
        return;
      }

      trackContactFormSubmitted(kind, "sent");
      setValues({ name: "", email: "", message: "" });
      setStatus("sent");
      requestAnimationFrame(() => {
        // Keep the card clear of the fixed header rather than snapping it to the top.
        sentRef.current?.focus({ preventScroll: true });
        sentRef.current?.scrollIntoView({ block: "center" });
      });
    } catch {
      trackContactFormSubmitted(kind, "failed");
      setStatus("failed");
    }
  }

  const card = "rounded-card border border-line bg-surface p-6 sm:p-10";

  if (status === "sent") {
    return (
      <div ref={sentRef} tabIndex={-1} role="status" className={`${card} flex flex-col items-start gap-6 outline-none`}>
        <span aria-hidden className="flex h-12 w-12 items-center justify-center rounded-control bg-surface-raised text-energy">
          <svg width="20" height="16" viewBox="0 0 15 12" fill="none">
            <path d="M1.5 6L5.5 10L13.5 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        <div className="flex flex-col gap-3">
          <h2 className="font-display text-card-title text-ink">
            {isFeedback ? "Thanks for your feedback." : "Thanks, your message is on its way."}
          </h2>
          <p className="text-body text-ink-secondary">
            {isFeedback
              ? "We read every message, and it helps decide what we build next."
              : "We'll reply to the email address you gave us."}
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            focusNameOnReturn.current = true;
            setStatus("idle");
          }}
          className="inline-flex h-12 items-center rounded-control border border-line-strong px-6 text-body font-medium text-ink transition-colors hover:bg-surface-raised focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cream"
        >
          Send another message
        </button>
      </div>
    );
  }

  const sending = status === "sending";

  return (
    <form ref={formRef} onSubmit={handleSubmit} noValidate aria-labelledby="contact-heading" className={`${card} relative flex flex-col gap-6`}>
      <div className="flex flex-col gap-2">
        <label htmlFor="contact-name" className="text-small font-medium text-ink-secondary">
          Name
        </label>
        <input
          ref={nameRef}
          id="contact-name"
          name="name"
          type="text"
          maxLength={CONTACT_LIMITS.name}
          autoComplete="name"
          value={values.name}
          onChange={handleChange}
          aria-invalid={errors.name ? true : undefined}
          aria-describedby={errors.name ? "contact-name-error" : undefined}
          className={`${inputClass} h-14 ${borderFor(errors.name)}`}
        />
        <FieldError id="contact-name-error" message={errors.name} />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="contact-email" className="text-small font-medium text-ink-secondary">
          Email
        </label>
        <input
          id="contact-email"
          name="email"
          type="email"
          inputMode="email"
          maxLength={CONTACT_LIMITS.email}
          autoComplete="email"
          value={values.email}
          onChange={handleChange}
          aria-invalid={errors.email ? true : undefined}
          aria-describedby={errors.email ? "contact-email-error" : undefined}
          className={`${inputClass} h-14 ${borderFor(errors.email)}`}
        />
        <FieldError id="contact-email-error" message={errors.email} />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="contact-message" className="text-small font-medium text-ink-secondary">
          {isFeedback ? "Your feedback" : "Message"}
        </label>
        <textarea
          id="contact-message"
          name="message"
          rows={6}
          maxLength={CONTACT_LIMITS.message}
          value={values.message}
          onChange={handleChange}
          placeholder={isFeedback ? "What's working, what isn't, what you'd like next" : "How can we help?"}
          aria-invalid={errors.message ? true : undefined}
          aria-describedby={errors.message ? "contact-message-error contact-message-count" : "contact-message-count"}
          className={`${inputClass} resize-y py-3 ${borderFor(errors.message)}`}
        />
        <FieldError id="contact-message-error" message={errors.message} />
        <p id="contact-message-count" className="text-small text-ink-faint tabular-nums">
          {values.message.length.toLocaleString("en-US")} of {CONTACT_LIMITS.message.toLocaleString("en-US")} characters
        </p>
      </div>

      {/* Spam trap: hidden from people and screen readers, left empty by them. */}
      <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor={`contact-${CONTACT_HONEYPOT_FIELD}`}>Leave this empty</label>
        <input
          id={`contact-${CONTACT_HONEYPOT_FIELD}`}
          name={CONTACT_HONEYPOT_FIELD}
          type="text"
          tabIndex={-1}
          autoComplete="off"
          defaultValue=""
        />
      </div>

      <div className="flex flex-col gap-4">
        <button
          type="submit"
          disabled={sending}
          className="inline-flex h-14 w-full items-center justify-center rounded-control bg-cream px-7 text-body font-medium text-on-cream transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cream disabled:opacity-60 sm:w-fit"
        >
          {sending ? "Sending…" : isFeedback ? "Send feedback" : "Send message"}
        </button>
        <div role="alert">
          {status === "failed" && (
            <p className="text-small text-error">
              Your message didn&apos;t send. Try again, or email{" "}
              <a href="mailto:support@tryprepit.app" className="font-medium underline underline-offset-4">
                support@tryprepit.app
              </a>
              . Your message is still here.
            </p>
          )}
        </div>
      </div>
    </form>
  );
}
