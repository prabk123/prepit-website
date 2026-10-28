import AppStoreLink from "@/components/AppStoreLink";
import { PILL_BUTTON_CLASS } from "@/components/ui/buttons";

export function AppleLogo() {
  return (
    <svg width="18" height="21" viewBox="0 0 18 21" aria-hidden>
      <path
        d="M14.78 11.12c-.02-2.26 1.85-3.35 1.94-3.41-1.07-1.57-2.73-1.77-3.32-1.79-1.42-.15-2.81.92-3.54.92-.74 0-1.86-.9-3.08-.88-1.59.02-3.07.98-3.87 2.46-1.63 3.02-.41 7.45 1.15 9.87.78 1.19 1.7 2.51 2.94 2.46 1.19-.05 1.61-.8 3.05-.8 1.43 0 1.83.8 3.07.77 1.27-.02 2.06-1.19 2.82-2.39.9-1.33 1.26-2.64 1.28-2.71-.03-.01-2.42-.93-2.44-4.5ZM12.28 4.34c.64-.78 1.09-1.85.96-2.94-.91.04-2.03.61-2.7 1.38-.59.68-1.13 1.78-.98 2.82 1.02.08 2.07-.49 2.72-1.26Z"
        fill="currentColor"
      />
    </svg>
  );
}

/**
 * The App Store pill button and its optional trial line, without the QR code,
 * so client components (an error boundary) can use it too. AppStoreCta wraps
 * it for every other placement.
 */
export default function AppStoreButton({
  trackingSource,
  label = "Download on the App Store",
  note,
}: {
  /** Sent with the `app_store_click` event, e.g. "home-hero". */
  trackingSource: string;
  label?: string;
  /** Line under the button, e.g. "7 days free" (TRIAL_NOTE). */
  note?: string;
}) {
  return (
    <div className="flex flex-col items-start gap-3">
      <AppStoreLink
        trackingSource={trackingSource}
        data-magnet
        className={`magnet ${PILL_BUTTON_CLASS}`}
      >
        <AppleLogo />
        {label}
      </AppStoreLink>
      {note && <p className="text-small text-ink-muted">{note}</p>}
    </div>
  );
}
