import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.tryprepit.app";

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/auth/", "/dev/", "/sharable/", "/signin", "/checkout", "/welcome", "/account", "/open"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
