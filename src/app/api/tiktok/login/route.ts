import { NextRequest, NextResponse } from "next/server";
import { STATE_COOKIE, TIKTOK_AUTHORIZE, TIKTOK_SCOPES } from "@/lib/tiktok/publisher";
import { redirectUri } from "@/lib/tiktok/server";

/** Starts TikTok sign-in for the publisher page. */
export async function GET(request: NextRequest) {
  const clientKey = process.env.TIKTOK_CLIENT_KEY;
  if (!clientKey) return NextResponse.json({ error: "TikTok is not set up" }, { status: 503 });
  const state = crypto.randomUUID();
  const url = new URL(TIKTOK_AUTHORIZE);
  url.search = new URLSearchParams({
    client_key: clientKey,
    scope: TIKTOK_SCOPES,
    response_type: "code",
    redirect_uri: redirectUri(request.nextUrl.origin),
    state,
  }).toString();
  const res = NextResponse.redirect(url);
  res.cookies.set(STATE_COOKIE, state, { httpOnly: true, secure: true, sameSite: "lax", maxAge: 600, path: "/" });
  return res;
}
