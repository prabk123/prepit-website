import type { Metadata } from "next";
import { Geist, Geist_Mono, DM_Sans } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";
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

// Base URL - Update this with your actual production URL
const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://prepit.app";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "PrepIt - AI-Powered Meal Planning & Nutrition Tracking",
    template: "%s | PrepIt",
  },
  description:
    "Plan smarter, eat better, stress less. Get personalized AI-powered meal plans, track nutrition, scan meals with your camera, and discover thousands of recipes tailored to your goals and lifestyle.",
  keywords: [
    "meal planning",
    "nutrition tracking",
    "AI nutritionist",
    "calorie counter",
    "recipe app",
    "meal prep",
    "healthy eating",
    "diet app",
    "food tracker",
    "barcode scanner",
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
    title: "PrepIt - AI-Powered Meal Planning & Nutrition Tracking",
    description:
      "Plan smarter, eat better, stress less. Personalized meal plans powered by AI.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "PrepIt - AI-Powered Meal Planning App",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PrepIt - AI-Powered Meal Planning & Nutrition Tracking",
    description:
      "Plan smarter, eat better, stress less. Personalized meal plans powered by AI.",
    images: ["/og-image.png"],
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
  return (
    <html lang="en">
      <head>
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
                "AI-powered meal planning and nutrition tracking app",
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
                "AI-powered meal planning, nutrition tracking, and recipe discovery app",
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
        className={`${geistSans.variable} ${geistMono.variable} ${dmSans.variable} ${brandFont.variable} antialiased`}
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
