import SectionHeading from "@/components/ui/SectionHeading";
import { PRIMARY_BUTTON_CLASS } from "@/components/ui/buttons";
import type { ExistingProvider } from "@/lib/prepitApi";

const EXISTING_PROVIDER_NAMES: Record<ExistingProvider, string | null> = {
  google: "Google",
  apple: "Apple",
  email: "an email link",
  unknown: null,
};

/**
 * This sign-in's email already has a PrepIt account under another provider:
 * ask them to sign out and sign in the way they do in the app.
 */
export default function EmailInUseNotice({
  existingProvider,
  purpose,
  onSignOut,
}: {
  existingProvider: ExistingProvider;
  /** Finishes the sentence "…so ___", e.g. "your subscription goes to the right account". */
  purpose: string;
  onSignOut: () => void;
}) {
  const existing = EXISTING_PROVIDER_NAMES[existingProvider];
  return (
    <>
      <SectionHeading
        as="h1"
        size="title"
        align="center"
        title="This email already has a PrepIt account"
        lead={
          existing
            ? `That account signs in with ${existing}. Sign out here, then continue with ${existing} so ${purpose}.`
            : `That account signs in another way. Sign out here, then sign in the way you do in the app, so ${purpose}.`
        }
      />
      <button type="button" className={PRIMARY_BUTTON_CLASS} onClick={onSignOut}>
        Sign out
      </button>
    </>
  );
}
