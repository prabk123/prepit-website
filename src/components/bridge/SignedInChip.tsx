import { AppleLogo } from "@/components/ui/AppStoreButton";
import { TEXT_BUTTON_CLASS } from "@/components/ui/buttons";
import type { SignInProvider } from "@/lib/firebase/auth";

/** "Signed in with Apple · address", so a visitor on the wrong account can see it and sign out. */
export default function SignedInChip({
  provider,
  email,
  onSignOut,
}: {
  provider: SignInProvider | null;
  email: string | null;
  onSignOut?: () => void;
}) {
  const label = provider === "apple" ? "Apple" : provider === "google" ? "Google" : null;
  return (
    <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-small text-ink-muted">
      {/* ph-no-capture keeps the email out of session recordings. */}
      <span className="ph-no-capture inline-flex max-w-full items-center gap-2 rounded-full bg-surface-raised px-3 py-1.5 text-ink-secondary">
        {provider === "apple" && <AppleLogo />}
        <span className="truncate">
          Signed in{label ? ` with ${label}` : ""}
          {email ? ` · ${email}` : ""}
        </span>
      </span>
      {onSignOut && (
        <button type="button" className={TEXT_BUTTON_CLASS} onClick={onSignOut}>
          Not you? Sign out
        </button>
      )}
    </p>
  );
}
