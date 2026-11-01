import { cookies } from "next/headers";
import { allowedCreator, TIKTOK_API, TOKEN_COOKIE, type CreatorInfo } from "./publisher";

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

/** The creator's info, or null when the signed-in account isn't on the allow-list. */
export async function allowedCreatorInfo(token: string): Promise<CreatorInfo | null> {
  const info = await tiktokPost<CreatorInfo>("/post/publish/creator_info/query/", token, {});
  return allowedCreator(info.creator_username, process.env.TIKTOK_ALLOWED_USERNAMES || undefined) ? info : null;
}
