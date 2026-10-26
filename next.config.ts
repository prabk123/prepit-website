import type { NextConfig } from "next";
import { firebaseAuthHandlerRewrites } from "./src/lib/firebase/authHandler";

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
    remotePatterns: [
      {
        protocol: "https",
        hostname: "api.tryprepit.app",
      },
      {
        protocol: "https",
        hostname: "api.m1a.dev",
      },
      {
        protocol: "https",
        hostname: "images.m1a.dev",
      },
      {
        protocol: "https",
        hostname: "**.amazonaws.com",
      },
    ],
  },
  async headers() {
    return [
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
