import type { NextConfig } from "next";
import { FIREBASE_AUTH_HANDLER_SOURCES, firebaseAuthHandlerRewrites } from "./src/lib/firebase/authHandler";
import { optimisedImageRemotePatterns } from "./src/lib/images/remoteImages";
import { securityHeaderRules } from "./src/lib/securityHeaders";

const nextConfig: NextConfig = {
  serverExternalPackages: ["mongodb"],
  async redirects() {
    return [
      // The About page was removed (PRE-311). Old links land on the homepage.
      { source: "/about", destination: "/", permanent: true },
    ];
  },
  async rewrites() {
    return [
      {
        source: "/.well-known/apple-app-site-association",
        destination: "/well-known/apple-app-site-association",
      },
      // Firebase's sign-in handler on this domain, so Google and Apple show
      // PrepIt's address instead of fresca-dev.firebaseapp.com (PRE-374).
      ...firebaseAuthHandlerRewrites(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID),
    ];
  },
  images: {
    // Only the recipe image CDN and the PrepIt API, not every AWS host, so
    // /_next/image isn't an open image proxy (PRE-380). Other recipe image
    // hosts render unoptimized in RecipeThumb.
    remotePatterns: optimisedImageRemotePatterns(),
    // Pinned so a request can't ask for widths or qualities outside these.
    qualities: [75],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [32, 48, 64, 96, 128, 256, 384],
  },
  async headers() {
    return [
      // Framing protection, nosniff, referrer policy and HSTS (PRE-379).
      ...securityHeaderRules(FIREBASE_AUTH_HANDLER_SOURCES, process.env.NEXT_PUBLIC_POSTHOG_UI_HOST),
      {
        source: "/.well-known/apple-app-site-association",
        headers: [
          {
            key: "Content-Type",
            value: "application/json",
          },
        ],
      },
      {
        source: "/.well-known/assetlinks.json",
        headers: [
          {
            key: "Content-Type",
            value: "application/json",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
