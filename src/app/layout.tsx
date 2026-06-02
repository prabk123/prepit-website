import type { Metadata } from "next";
import { Geist, Geist_Mono, DM_Sans } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";
import Script from "next/script";
import localFont from "next/font/local";
import NavigationWrapper from "@/components/NavigationWrapper";
import DownloadCTA from "@/components/DownloadCTA";
import Footer from "@/components/Footer";
import SmartBanner from "@/components/SmartBanner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const brandFont = localFont({
  src: "./fonts/ClashDisplay-Variable.ttf",
  variable: "--font-brand",
  display: "swap",
});

const prepitIcons = localFont({
  src: "./fonts/PrepItIcons.ttf",
  variable: "--font-prepit-icons",
  display: "block",
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
    "natural language food log",
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
  openGraph: {
    type: "website",
    locale: "en_US",
    url: baseUrl,
    siteName: "PrepIt",
    title: "PrepIt | Your AI Nutritionist – Meals In, Smart Advice Out",
    description:
      "Log meals in plain English. PrepIt shows how each meal affects your energy, hunger, and mood—and what to do next.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "PrepIt – Your AI nutritionist app",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PrepIt | Your AI Nutritionist – Meals In, Smart Advice Out",
    description:
      "Log meals in plain English. PrepIt shows how each meal affects your energy, hunger, and mood—and what to do next.",
    images: ["/og-image.png"],
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
            <Script id="meta-pixel" strategy="afterInteractive">
              {`
                !function(f,b,e,v,n,t,s)
                {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                n.queue=[];t=b.createElement(e);t.async=!0;
                t.src=v;s=b.getElementsByTagName(e)[0];
                s.parentNode.insertBefore(t,s)}(window, document,'script',
                'https://connect.facebook.net/en_US/fbevents.js');
                fbq('init', '${metaPixelId}');
                fbq('track', 'PageView');
              `}
            </Script>
            <noscript>
              <img
                height="1"
                width="1"
                style={{ display: "none" }}
                src={`https://www.facebook.com/tr?id=${metaPixelId}&ev=PageView&noscript=1`}
                alt=""
              />
            </noscript>
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
        className={`${geistSans.variable} ${geistMono.variable} ${dmSans.variable} ${brandFont.variable} ${prepitIcons.variable} antialiased`}
      >
        <SmartBanner />
        <div className="flex min-h-screen flex-col items-center bg-white">
          <NavigationWrapper />

          <main className="w-full">
            {children}
            <SpeedInsights />
          </main>

          <DownloadCTA />
          <Footer />
        </div>
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
