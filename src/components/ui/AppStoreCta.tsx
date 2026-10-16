import AppStoreLink from "@/components/AppStoreLink";
import AppStoreQr from "@/components/ui/AppStoreQr";

type AppStoreCtaProps = {
  /** Sent with the `app_store_click` event, e.g. "home-hero". */
  trackingSource: string;
  label?: string;
  /** `accent`: the orange button, everywhere by default. `ink`: an ink button, for a spot beside another orange button. */
  variant?: "accent" | "ink";
  /** Line under the button, e.g. "7 days free" (TRIAL_NOTE). */
  note?: string;
  /** Desktop only: a QR code beside the button with this caption. */
  qrCaption?: string;
  className?: string;
};

function AppleLogo() {
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
 * The one App Store call to action: a pill button that keeps AppStoreLink's
 * Meta Pixel and PostHog tracking, an optional trial line, and an
 * optional QR code for desktop visitors.
 */
export default function AppStoreCta({
  trackingSource,
  label = "Download on the App Store",
  variant = "accent",
  note,
  qrCaption,
  className,
}: AppStoreCtaProps) {
  const button =
    variant === "accent"
      ? "bg-accent text-on-accent focus-visible:outline-focus"
      : "bg-ink text-page focus-visible:outline-focus";
  const subtle = "text-ink-muted";

  return (
    <div className={`flex flex-wrap items-center gap-x-10 gap-y-6 ${className ?? ""}`}>
      <div className="flex flex-col items-start gap-3">
        <AppStoreLink
          trackingSource={trackingSource}
          className={`inline-flex h-14 items-center gap-2.5 whitespace-nowrap rounded-control px-5 text-body font-medium transition-opacity max-[374px]:gap-2 max-[374px]:px-4 max-[374px]:text-small sm:px-7 hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-4 ${button}`}
        >
          <AppleLogo />
          {label}
        </AppStoreLink>
        {note && <p className={`text-small ${subtle}`}>{note}</p>}
      </div>
      {qrCaption && (
        <AppStoreQr caption={qrCaption} trackingSource={`${trackingSource}-qr`} className="hidden lg:flex" />
      )}
    </div>
  );
}
