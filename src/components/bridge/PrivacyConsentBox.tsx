"use client";

import Link from "next/link";
import { forwardRef, useId, useState } from "react";
import { TEXT_BUTTON_CLASS } from "@/components/ui/buttons";
import {
  PRIVACY_CONSENT_LEARN_MORE,
  PRIVACY_CONSENT_NEEDED_MESSAGE,
  PRIVACY_CONSENT_TEXT,
} from "@/lib/funnel/privacyConsent";

/**
 * The cart's health and AI consent box (PRE-533): one unticked box above the
 * sign-in buttons, with Learn more opening in place to name the AI providers.
 * Its own box, never folded into the terms line. The checkbox matches the
 * cart's "Email me my plan" consent box.
 */
const PrivacyConsentBox = forwardRef<
  HTMLInputElement,
  {
    checked: boolean;
    onChange: (checked: boolean) => void;
    /** A sign-in was pressed before ticking: the box says so. */
    needed: boolean;
    onLearnMore?: () => void;
  }
>(function PrivacyConsentBox({ checked, onChange, needed, onLearnMore }, ref) {
  const [open, setOpen] = useState(false);
  const learnMoreId = useId();
  const messageId = useId();
  const showNeeded = needed && !checked;
  return (
    <div className="flex flex-col gap-2">
      <label className="flex items-start gap-2.5 text-small text-ink-secondary">
        <input
          ref={ref}
          type="checkbox"
          className="mt-px size-5 flex-none accent-primary"
          checked={checked}
          aria-invalid={showNeeded || undefined}
          aria-describedby={showNeeded ? messageId : undefined}
          onChange={(event) => onChange(event.target.checked)}
        />
        <span>
          {PRIVACY_CONSENT_TEXT}{" "}
          <button
            type="button"
            className={TEXT_BUTTON_CLASS}
            aria-expanded={open}
            aria-controls={learnMoreId}
            onClick={(event) => {
              // Inside the label: opening Learn more must not tick the box.
              event.preventDefault();
              if (!open) onLearnMore?.();
              setOpen(!open);
            }}
          >
            Learn more
          </button>
        </span>
      </label>
      <div id={learnMoreId} hidden={!open} className="flex flex-col gap-2 pl-[30px] text-[13px] leading-snug text-ink-muted">
        {PRIVACY_CONSENT_LEARN_MORE.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
        <p>
          See our{" "}
          <Link href="/privacy-policy" className="underline underline-offset-4 hover:text-ink">
            Privacy Policy
          </Link>
          .
        </p>
      </div>
      <p id={messageId} role="status" aria-live="polite" className={showNeeded ? "pl-[30px] text-small text-error" : "sr-only"}>
        {showNeeded ? PRIVACY_CONSENT_NEEDED_MESSAGE : ""}
      </p>
    </div>
  );
});

export default PrivacyConsentBox;
