import { NextRequest, NextResponse } from "next/server";
import { STATE_COOKIE, TIKTOK_API, TOKEN_COOKIE } from "@/lib/tiktok/publisher";
import { redirectUri } from "@/lib/tiktok/server";

/** TikTok sends the creator back here after sign-in: swap the code for an access token. */
export async function GET(request: NextRequest) {
  const back = new URL("/tiktok-publisher", request.nextUrl.origin);
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  if (!code || !state || state !== request.cookies.get(STATE_COOKIE)?.value) {
    back.searchParams.set("error", "signin");
    return NextResponse.redirect(back);
  }
  const res0 = await fetch(`${TIKTOK_API}/oauth/token/`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_key: process.env.TIKTOK_CLIENT_KEY || "",
      client_secret: process.env.TIKTOK_CLIENT_SECRET || "",
      code,
      grant_type: "authorization_code",
      redirect_uri: redirectUri(request.nextUrl.origin),
    }),
    cache: "no-store",
  });
  const json = await res0.json().catch(() => ({}));
  if (!json.access_token) {
    back.searchParams.set("error", "signin");
    return NextResponse.redirect(back);
  }
  const res = NextResponse.redirect(back);
  res.cookies.delete(STATE_COOKIE);
  res.cookies.set(TOKEN_COOKIE, json.access_token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: Math.min(Number(json.expires_in) || 3600, 86400),
    path: "/",
  });
  return res;
}
