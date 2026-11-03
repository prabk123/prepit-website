import { NextResponse } from "next/server";
import { dueDrafts, inboxInitBody, MAX_SINGLE_CHUNK, TT_QUEUE_URL, type QueuedDraft } from "@/lib/tiktok/inbox";
import { TIKTOK_API } from "@/lib/tiktok/publisher";

export const maxDuration = 120;
export const dynamic = "force-dynamic";

/**
 * The inbox credentials are the TikTok app and refresh token the reel pipeline already uses
 * (TIKTOK_INBOX_*), kept apart from the publisher page's TIKTOK_CLIENT_* keys.
 */
async function accessToken(): Promise<string> {
  const res = await fetch(`${TIKTOK_API}/oauth/token/`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_key: process.env.TIKTOK_INBOX_CLIENT_KEY ?? "",
      client_secret: process.env.TIKTOK_INBOX_CLIENT_SECRET ?? "",
      grant_type: "refresh_token",
      refresh_token: process.env.TIKTOK_INBOX_REFRESH_TOKEN ?? "",
    }),
    cache: "no-store",
  });
  const json = await res.json().catch(() => ({}));
  if (!json.access_token) throw new Error(`tiktok token refresh failed: ${json.error ?? res.status} ${json.error_description ?? ""}`.trim());
  return json.access_token;
}

async function sendDraft(q: QueuedDraft, token: string) {
  const video = await fetch(q.video_url, { cache: "no-store" });
  if (!video.ok) throw new Error(`video ${video.status}`);
  const bytes = new Uint8Array(await video.arrayBuffer());
  if (bytes.length > MAX_SINGLE_CHUNK) throw new Error(`video is ${bytes.length} bytes, over the one-chunk limit`);
  const initRes = await fetch(`${TIKTOK_API}/post/publish/inbox/video/init/`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json; charset=UTF-8" },
    body: JSON.stringify(inboxInitBody(bytes.length)),
  });
  const init = await initRes.json().catch(() => ({}));
  if (!initRes.ok || init.error?.code !== "ok") throw new Error(`tiktok init: ${init.error?.code ?? initRes.status} ${init.error?.message ?? ""}`.trim());
  const put = await fetch(init.data.upload_url, {
    method: "PUT",
    headers: { "Content-Type": "video/mp4", "Content-Range": `bytes 0-${bytes.length - 1}/${bytes.length}` },
    body: bytes,
  });
  if (!put.ok) throw new Error(`tiktok upload ${put.status}`);
  return { reel: q.reel, slot_id: q.slot_id, publish_id: init.data.publish_id as string };
}

/** Called by Vercel Cron (vercel.json): sends the reels whose slot opened this hour to the TikTok inbox. */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const missing = ["TIKTOK_INBOX_CLIENT_KEY", "TIKTOK_INBOX_CLIENT_SECRET", "TIKTOK_INBOX_REFRESH_TOKEN"].filter((k) => !process.env[k]);
  if (missing.length) return NextResponse.json({ error: `not set: ${missing.join(", ")}` }, { status: 500 });

  const now = Date.now();
  const queueRes = await fetch(`${TT_QUEUE_URL}?t=${now}`, { cache: "no-store" });
  if (!queueRes.ok) return NextResponse.json({ error: `queue ${queueRes.status}` }, { status: 502 });
  const due = dueDrafts(await queueRes.json().catch(() => null), now);
  const sent = [];
  const errors = [];
  if (due.length) {
    const token = await accessToken();
    for (const q of due) {
      try {
        sent.push(await sendDraft(q, token));
      } catch (err) {
        errors.push({ reel: q.reel, slot_id: q.slot_id, error: String(err) });
        console.error("tiktok cron", q.slot_id, err);
      }
    }
  }
  console.log("tiktok cron", JSON.stringify({ due: due.map((q) => q.slot_id), sent, errors }));
  return NextResponse.json({ due: due.map((q) => q.slot_id), sent, errors }, { status: errors.length ? 500 : 200 });
}
