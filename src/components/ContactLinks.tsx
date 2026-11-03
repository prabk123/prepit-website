"use client";

import Link from "next/link";
import type { ContactKind } from "@/components/ContactForm";
import { trackContactLinkClicked } from "@/lib/posthogAnalytics";

const SUPPORT_EMAIL = "support@tryprepit.app";

const LINKS = [
  { id: "email", label: "Email", href: `mailto:${SUPPORT_EMAIL}`, text: SUPPORT_EMAIL },
  { id: "account", label: "Manage or cancel", href: "/account", text: "tryprepit.app/account" },
  { id: "faq", label: "Quick answers", href: "/#faq", text: "Read the FAQ" },
] as const;

// The legal pages' inline link (ink text, orange underline), with TextLink's
// tap-target so each stays at least 44 px tall on phones.
const linkClass =
  "tap-target -my-1 py-1 text-ink underline decoration-accent underline-offset-4 transition-colors hover:text-accent-text focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus";

/**
 * Email, account and FAQ beside the contact form, so nobody has to send a
 * message to find the cancel link (PRE-458). iPhone subscribers are told where
 * theirs is managed, since /account only covers website subscriptions.
 */
export default function ContactLinks({ kind }: { kind: ContactKind }) {
  return (
    <div className="flex flex-col gap-4 border-t border-line-strong pt-5">
      <dl className="flex flex-col gap-5 text-body">
        {LINKS.map((link) => (
          <div key={link.id} className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
            <dt className="text-ink-muted">{link.label}</dt>
            <dd>
              {link.href.startsWith("mailto:") ? (
                <a href={link.href} className={linkClass} onClick={() => trackContactLinkClicked(link.id, kind)}>
                  {link.text}
                </a>
              ) : (
                <Link href={link.href} className={linkClass} onClick={() => trackContactLinkClicked(link.id, kind)}>
                  {link.text}
                </Link>
              )}
            </dd>
          </div>
        ))}
      </dl>
      {/* tryprepit.app/account only manages website subscriptions; same wording as /account. */}
      <p className="text-small text-ink-muted">
        Subscribed on your iPhone? Manage it in Settings, then your name, then Subscriptions.
      </p>
    </div>
  );
}
