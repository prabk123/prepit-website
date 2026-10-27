import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import Script from "next/script";
import localFont from "next/font/local";
import NavigationWrapper from "@/components/NavigationWrapper";
import FinalCta from "@/components/pricing/FinalCta";
import SiteFinalCta from "@/components/pricing/SiteFinalCta";
import Footer from "@/components/Footer";
import SiteChrome from "@/components/SiteChrome";
import CookieConsent from "@/components/CookieConsent";
import VercelMetrics from "@/components/VercelMetrics";
import AttributionCapture from "@/components/funnel/AttributionCapture";
import MarketCapture from "@/components/funnel/MarketCapture";
import { PREPIT_ANALYTICS_CONSENT_COOKIE, PREPIT_GEO_COOKIE } from "@/lib/cookies";
import { APP_STORE_ID } from "@/lib/appStore";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const brandFont = localFont({
  src: "./fonts/ClashDisplay-Variable.woff2",
  variable: "--font-brand",
  display: "swap",
});

// Base URL - production URL
const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.tryprepit.app";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "PrepIt | Your AI Nutritionist – Meals In, Smart Advice Out",
    template: "%s | PrepIt",
  },
  description:
    "Describe any meal in your own words. PrepIt logs it in seconds, shows how it affects your energy, hunger, and mood, and tells you what to do next—no food hunts, no guilt.",
  keywords: [
    "AI nutritionist",
    "nutrition tracking",
    "meal logging",
    "food log in your own words",
    "food diary",
    "calorie counter",
    "nutrition coach",
    "personalized nutrition advice",
    "energy hunger mood",
    "healthy eating",
    "iOS nutrition app",
  ],
  authors: [{ name: "PrepIt" }],
  creator: "PrepIt",
  publisher: "PrepIt",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  // The preview image is ./opengraph-image.tsx and ./twitter-image.tsx (PRE-312),
  // which pages without their own inherit.
  openGraph: {
    type: "website",
    locale: "en_US",
    url: baseUrl,
    siteName: "PrepIt",
    title: "PrepIt | The nutritionist that notices",
    description:
      "An AI nutritionist that learns how you eat, speaks up when something slips, and shows how your food will make you feel.",
  },
  twitter: {
    card: "summary_large_image",
    title: "PrepIt | The nutritionist that notices",
    description:
      "An AI nutritionist that learns how you eat, speaks up when something slips, and shows how your food will make you feel.",
  },
  alternates: {
    canonical: baseUrl,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/logo.png",
  },
  manifest: "/manifest.json",
  // Safari's Smart App Banner. It must be in the server HTML: Safari reads it
  // on load and ignores a tag added later by JavaScript. Legal pages turn it
  // off with `itunes: null`.
  itunes: {
    appId: APP_STORE_ID,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const metaPixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;

  return (
    <html lang="en">
      <head>
        <meta
          name="facebook-domain-verification"
          content="74mm9j52fbkke3xggwdjd5mutopg9v"
        />
        {metaPixelId && (
          <>
            {/* In the UK and EEA (or when the region is unknown) the pixel only
                loads after "Accept optional cookies"; CookieConsent calls
                prepitLoadMetaPixel then. Cookie names are in src/lib/cookies.ts. */}
            <Script id="meta-pixel" strategy="afterInteractive">
              {`
                window.prepitLoadMetaPixel = function () {
                  /* The plan email pages carry a token in the address until
                     the page removes it, so PageView must not see them. So
                     does /account when opened from a subscription email
                     (PRE-353); a plain /account visit still loads it. */
                  var path = location.pathname;
                  if (path === '/my-plan' || path === '/email-preferences' || path.indexOf('/my-plan/') === 0 || path.indexOf('/email-preferences/') === 0) return;
                  if ((path === '/account' || path === '/account/') && /[?&]token=/.test(location.search)) return;
                  !function(f,b,e,v,n,t,s)
                  {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                  n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                  if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                  n.queue=[];t=b.createElement(e);t.async=!0;
                  t.src=v;s=b.getElementsByTagName(e)[0];
                  s.parentNode.insertBefore(t,s)}(window, document,'script',
                  'https://connect.facebook.net/en_US/fbevents.js');
                  /* No automatic events: they send button text (quiz answers) to Meta. */
                  fbq('set', 'autoConfig', false, '${metaPixelId}');
                  fbq('init', '${metaPixelId}');
                  fbq('track', 'PageView');
                };
                var geo = (document.cookie.match(/(?:^|; )${PREPIT_GEO_COOKIE}=([^;]*)/) || [])[1];
                var consent = (document.cookie.match(/(?:^|; )${PREPIT_ANALYTICS_CONSENT_COOKIE}=([^;]*)/) || [])[1];
                if (geo === 'non-eu' || consent === 'granted') window.prepitLoadMetaPixel();
              `}
            </Script>
          </>
        )}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "PrepIt",
              url: baseUrl,
              logo: `${baseUrl}/logo.png`,
              description:
                "Your AI nutritionist—log meals in plain English and get personalized nutrition advice.",
              sameAs: [
                // Add your social media links here when available
                // "https://twitter.com/prepit",
                // "https://instagram.com/prepit",
              ],
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "MobileApplication",
              name: "PrepIt",
              applicationCategory: "HealthApplication",
              operatingSystem: "iOS",
              description:
                "Log meals in your own words, see Energy, Satiety, and Mood scores, and get AI nutrition coaching tailored to your day.",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "USD",
              },
            }),
          }}
        />
      </head>
      <body
        className={`${dmSans.variable} ${brandFont.variable} antialiased`}
      >
        <a
          href="#main"
          className="sr-only rounded-button bg-primary px-4 text-small font-bold text-on-primary focus:not-sr-only focus:fixed focus:left-4 focus:top-2.5 focus:z-[60] focus:inline-flex focus:h-11 focus:items-center focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus"
        >
          Skip to content
        </a>
        {/* Straight after the skip link, so a keyboard reaches it before the page. */}
        <CookieConsent />
        <AttributionCapture />
        <MarketCapture />
        <div className="flex min-h-screen flex-col items-center bg-page">
          <SiteChrome>
            <NavigationWrapper />
          </SiteChrome>

          <main id="main" tabIndex={-1} className="w-full outline-none">
            {children}
          </main>

          <SiteFinalCta>
            <FinalCta id="site-download" />
          </SiteFinalCta>
          <SiteChrome>
            <Footer />
          </SiteChrome>
        </div>
        <VercelMetrics />
      </body>
    </html>
  );
}
