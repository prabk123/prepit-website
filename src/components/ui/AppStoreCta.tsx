import AppStoreButton from "@/components/ui/AppStoreButton";
import AppStoreQr from "@/components/ui/AppStoreQr";

type AppStoreCtaProps = {
  /** Sent with the `app_store_click` event, e.g. "home-hero". */
  trackingSource: string;
  label?: string;
  /** Line under the button, e.g. "7 days free" (TRIAL_NOTE). */
  note?: string;
  /** Desktop only: a QR code beside the button with this caption. */
  qrCaption?: string;
  /** What the QR code opens; the App Store listing unless set. */
  qrUrl?: string;
  className?: string;
};

/**
 * The one App Store call to action: a pill button that keeps AppStoreLink's
 * Meta Pixel and PostHog tracking, an optional trial line, and an
 * optional QR code for desktop visitors.
 */
export default function AppStoreCta({
  trackingSource,
  label = "Download on the App Store",
  note,
  qrCaption,
  qrUrl,
  className,
}: AppStoreCtaProps) {

  return (
    <div className={`flex flex-wrap items-center gap-x-10 gap-y-6 ${className ?? ""}`}>
      <AppStoreButton trackingSource={trackingSource} label={label} note={note} />
      {qrCaption && (
        <AppStoreQr caption={qrCaption} url={qrUrl} trackingSource={`${trackingSource}-qr`} className="hidden lg:flex" />
      )}
    </div>
  );
}
