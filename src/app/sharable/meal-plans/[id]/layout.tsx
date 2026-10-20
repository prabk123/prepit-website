import localFont from "next/font/local";
import { HideSiteFinalCta } from "@/components/pricing/SiteFinalCta";

// The app's icon font. Only the shared plan uses it, so it loads (and is
// preloaded) on this route alone.
const prepitIcons = localFont({
  src: "../../../fonts/PrepItIcons.woff2",
  variable: "--font-prepit-icons",
  display: "block",
});

/**
 * Shared meal plans: the light page under the site header, with room
 * for the fixed navigation bar. The plan, its 404 and its error page each
 * carry their own App Store button, so the site's download section is hidden.
 */
export default function SharableMealPlanLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`${prepitIcons.variable} w-full bg-page pt-16 text-ink lg:pt-[72px]`}>
      <HideSiteFinalCta />
      <div className="mx-auto flex w-full max-w-content flex-col gap-8 px-gutter pb-section pt-8 lg:gap-10 lg:pt-12">
        {children}
      </div>
    </div>
  );
}
