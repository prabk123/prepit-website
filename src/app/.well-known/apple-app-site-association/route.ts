import { NextResponse } from "next/server";

/**
 * Apple App Site Association for Universal Links.
 *
 * Set in .env / deployment:
 * - APPLE_TEAM_ID — 10-character Team ID (Apple Developer → Membership)
 * - IOS_BUNDLE_ID — e.g. com.company.prepit (must match the iOS app)
 *
 * In Xcode: Signing & Capabilities → Associated Domains →
 * applinks:YOUR_DOMAIN (e.g. applinks:www.tryprepit.app) must match
 * the host users tap (same host as NEXT_PUBLIC_SITE_URL, without https://).
 */
export async function GET() {
  const teamId = process.env.APPLE_TEAM_ID?.trim();
  const bundleId = process.env.IOS_BUNDLE_ID?.trim();

  if (!teamId || !bundleId) {
    return NextResponse.json(
      {
        error:
          "Universal Links: set APPLE_TEAM_ID and IOS_BUNDLE_ID in the deployment environment.",
      },
      { status: 503 }
    );
  }

  const body = {
    applinks: {
      apps: [],
      details: [
        {
          appID: `${teamId}.${bundleId}`,
          paths: ["*"],
        },
      ],
    },
  };

  return NextResponse.json(body, {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
