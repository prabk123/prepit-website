import localFont from "next/font/local";

// The app's icon font. Only the shared plan uses it, so it loads (and is
// preloaded) on this route alone.
const prepitIcons = localFont({
  src: "../../../fonts/PrepItIcons.woff2",
  variable: "--font-prepit-icons",
  display: "block",
});

/**
 * Shared meal plans: the warm dark page (D3) under the site header, with room
 * for the fixed navigation bar.
 */
export default function SharableMealPlanLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`${prepitIcons.variable} w-full bg-page pt-16 text-ink lg:pt-[72px]`}>
      <div className="mx-auto flex w-full max-w-content flex-col gap-8 px-gutter pb-section pt-8 lg:gap-10 lg:pt-12">
        {children}
      </div>
    </div>
  );
}
