import { cookies } from "next/headers";
import { TIKTOK_API, TOKEN_COOKIE } from "./publisher";

/** The site's own URL for TikTok's redirect, e.g. https://tryprepit.app/api/tiktok/callback. */
export function redirectUri(origin: string): string {
  return `${process.env.TIKTOK_REDIRECT_ORIGIN || origin}/api/tiktok/callback`;
}

/** The signed-in creator's access token (an httpOnly cookie set by the callback), or null. */
export async function accessToken(): Promise<string | null> {
  return (await cookies()).get(TOKEN_COOKIE)?.value || null;
}

/** POST to TikTok's API as the signed-in creator. Throws with TikTok's error message. */
export async function tiktokPost<T>(path: string, token: string, body: unknown): Promise<T> {
  const res = await fetch(`${TIKTOK_API}${path}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json; charset=UTF-8" },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  const json = await res.json().catch(() => ({}));
  const err = json?.error;
  if (!res.ok || (err && err.code && err.code !== "ok")) {
    throw new Error(err?.message || err?.code || `TikTok answered ${res.status}`);
  }
  return json.data as T;
}
