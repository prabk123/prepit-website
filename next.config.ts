import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["mongodb"],
  async rewrites() {
    return [
      {
        source: "/.well-known/apple-app-site-association",
        destination: "/well-known/apple-app-site-association",
      },
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
