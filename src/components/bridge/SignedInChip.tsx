import { AppleLogo } from "@/components/ui/AppStoreButton";
import { TEXT_BUTTON_CLASS } from "@/components/ui/buttons";
import type { SignInProvider } from "@/lib/firebase/auth";

/**
 * "Signed in with Apple · address", so a visitor on the wrong account can see
 * it and sign out. `compact` is the one-line version for a page header
 * (checkout, PRE-375): just the address, cut short if it doesn't fit, and
 * "Sign out".
 */
export default function SignedInChip({
  provider,
  email,
  onSignOut,
  compact = false,
}: {
  provider: SignInProvider | null;
  email: string | null;
  onSignOut?: () => void;
  compact?: boolean;
}) {
  const label = provider === "apple" ? "Apple" : provider === "google" ? "Google" : null;
  const full = `Signed in${label ? ` with ${label}` : ""}${email ? ` · ${email}` : ""}`;
  return (
    <p
      className={
        compact
          ? "flex min-w-0 items-center gap-3 text-small text-ink-muted"
          : "flex flex-wrap items-center gap-x-3 gap-y-1 text-small text-ink-muted"
      }
    >
      {/* ph-no-capture keeps the email out of session recordings. */}
      <span
        title={compact ? full : undefined}
        className="ph-no-capture inline-flex min-w-0 max-w-full items-center gap-2 rounded-full bg-surface-raised px-3 py-1.5 text-ink-secondary"
      >
        {provider === "apple" && <AppleLogo />}
        <span className="truncate">{compact ? (email ?? full) : full}</span>
      </span>
      {onSignOut && (
        <button type="button" className={`${TEXT_BUTTON_CLASS} shrink-0`} onClick={onSignOut}>
          {compact ? "Sign out" : "Not you? Sign out"}
        </button>
      )}
    </p>
  );
}
