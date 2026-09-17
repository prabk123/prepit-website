import Image from "next/image";
import AppStoreLink from "@/components/AppStoreLink";

export default function AppStoreBadge({
  trackingSource = "app-store-badge",
}: {
  trackingSource?: string;
}) {
  return (
    <AppStoreLink
      trackingSource={trackingSource}
      className="inline-block transition-opacity hover:opacity-80"
      aria-label="Download on the App Store"
    >
      <Image
        src="/app_store_download.png"
        alt="Download on the App Store"
        width={160}
        height={48}
        className="h-12 w-auto rounded-[10px] shadow-[0_0_0_1px_rgba(255,255,255,0.85)]"
        priority
      />
    </AppStoreLink>
  );
}
