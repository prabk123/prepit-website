import Image from "next/image";

const APP_STORE_URL =
  "https://apps.apple.com/app/prepit-ai-nutritionist/id6751211023";

export default function FloatingGetAppButton() {
  return (
    <a
      href={APP_STORE_URL}
      className="fixed bottom-6 right-4 z-40 transition-opacity hover:opacity-80 lg:right-14"
      aria-label="Download on the App Store"
    >
      <Image
        src="/app_store_download.png"
        alt="Download on the App Store"
        width={187}
        height={56}
        className="h-14 w-auto shadow-lg"
      />
    </a>
  );
}
