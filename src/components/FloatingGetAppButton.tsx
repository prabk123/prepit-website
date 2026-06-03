const APP_STORE_URL =
  "https://apps.apple.com/app/prepit-ai-nutritionist/id6751211023";

export default function FloatingGetAppButton() {
  return (
    <a
      href={APP_STORE_URL}
      className="fixed bottom-6 right-4 z-40 rounded-xl bg-black px-4 py-3 text-sm font-bold leading-[21px] text-white shadow-lg transition-opacity hover:opacity-80 lg:right-14"
      aria-label="Get the PrepIt app on the App Store"
    >
      Get the app
    </a>
  );
}
