import { NextResponse } from "next/server";

/**
 * Apple App Site Association for Universal Links.
 * Public URL: /.well-known/apple-app-site-association (see next.config rewrites).
 * Kept under app/well-known (no dot prefix) so Vercel production registers the route.
 *
 * Set in .env / deployment:
 * - APPLE_TEAM_ID — 10-character Team ID (Apple Developer → Membership)
 * - IOS_BUNDLE_ID — e.g. com.company.prepit (must match the iOS app)
 *
 * Only the paths the iPhone app handles open the app (PRE-270). Every other
 * page, including the funnel, sign-in, checkout and /account, stays in the
 * browser even when PrepIt is installed:
 * - /auth/link: the email sign-in link (fresca_app AppRoute.emailSignin).
 * - /open: "open PrepIt" links in emails and messages. Without the app, the
 *   page itself offers the App Store.
 * Add a path here only once a released app build handles it.
 *
 * In Xcode: Signing & Capabilities → Associated Domains →
 * applinks:YOUR_DOMAIN (e.g. applinks:www.tryprepit.app) must match
 * the host users tap (same host as NEXT_PUBLIC_SITE_URL, without https://).
 */
/** The website paths the app opens for. */
const APP_PATHS = ["/auth/link", "/open"] as const;

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
          // `paths` for iOS 12 and older, `components` for iOS 13 and later.
          paths: APP_PATHS.flatMap((path) => [path, `${path}/*`]),
          appIDs: [`${teamId}.${bundleId}`],
          components: APP_PATHS.flatMap((path) => [{ "/": path }, { "/": `${path}/*` }]),
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
