import QRCode from "qrcode";
import AppStoreLink from "@/components/AppStoreLink";
import { APP_STORE_URL } from "@/lib/appStore";

type AppStoreQrProps = {
  /** e.g. "Scan to get PrepIt on your iPhone". */
  caption: string;
  url?: string;
  /**
   * Makes the code a link to the listing too, for desktop visitors who click
   * it instead of scanning. Sent with `app_store_click`, e.g. "final-cta-qr".
   */
  trackingSource?: string;
  className?: string;
};

/**
 * A QR code for the App Store listing, drawn as SVG on the server (no client
 * JavaScript). Dark modules on a cream tile, the contrast phone cameras read
 * most reliably.
 */
export default async function AppStoreQr({ caption, url = APP_STORE_URL, trackingSource, className }: AppStoreQrProps) {
  // Draw modules in currentColor on a clear ground, so the tile's token
  // colours (cream and near-black) apply.
  const svg = (
    await QRCode.toString(url, {
      type: "svg",
      margin: 0,
      errorCorrectionLevel: "M",
      color: { dark: "#000000ff", light: "#ffffff00" },
    })
  )
    .replaceAll("#000000", "currentColor")
    .replaceAll('fill="#ffffff"', 'fill="transparent"');

  const tile = (
    <div
      role="img"
      aria-label="QR code that opens PrepIt on the App Store"
      className="h-[104px] w-[104px] shrink-0 rounded-[18px] bg-cream p-3 text-on-cream [&>svg]:h-full [&>svg]:w-full"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );

  return (
    <figure className={`flex items-center gap-4 ${className ?? ""}`}>
      {trackingSource ? (
        <AppStoreLink
          trackingSource={trackingSource}
          href={url}
          className="block shrink-0 rounded-[18px] transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cream"
        >
          {tile}
        </AppStoreLink>
      ) : (
        tile
      )}
      <figcaption className="max-w-[16ch] text-small text-ink-muted">{caption}</figcaption>
    </figure>
  );
}
