import { NextResponse } from "next/server";
import {
  containerParams,
  duePosts,
  GRAPH,
  IG_QUEUE_URL,
  IG_USER_ID,
  type QueuedPost,
  type RecentMedia,
} from "@/lib/instagram/publisher";

// Instagram fetches and processes the video before it can be published; that takes a
// minute or two for a 60-80 s reel.
export const maxDuration = 300;
export const dynamic = "force-dynamic";

const POLL_MS = 5000;
const PROCESS_BUDGET_MS = 230_000;

async function graph(path: string, token: string, params: Record<string, string> = {}, method = "GET") {
  const body = new URLSearchParams({ ...params, access_token: token });
  const url = method === "GET" ? `${GRAPH}/${path}?${body}` : `${GRAPH}/${path}`;
  const res = await fetch(url, method === "GET" ? { cache: "no-store" } : { method, body });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || json.error) {
    const e = json.error ?? {};
    throw new Error(`instagram ${path.split("?")[0]}: ${e.code ?? res.status}/${e.error_subcode ?? "-"} ${e.message ?? ""}`.trim());
  }
  return json;
}

async function publish(q: QueuedPost, token: string, started: number) {
  let trial = Boolean(q.trial);
  let container: { id: string };
  try {
    container = await graph(`${IG_USER_ID}/media`, token, containerParams(q, trial), "POST");
  } catch (err) {
    // 2207081: the account can't make trial reels yet; post a normal reel instead.
    if (!trial || !String(err).includes("2207081")) throw err;
    trial = false;
    container = await graph(`${IG_USER_ID}/media`, token, containerParams(q, false), "POST");
  }
  let status = "";
  while (Date.now() - started < PROCESS_BUDGET_MS) {
    await new Promise((r) => setTimeout(r, POLL_MS));
    status = (await graph(container.id, token, { fields: "status_code" })).status_code;
    if (status === "FINISHED") break;
    if (status === "ERROR" || status === "EXPIRED") throw new Error(`instagram processing ${status} for container ${container.id}`);
  }
  if (status !== "FINISHED") throw new Error(`instagram still processing container ${container.id}; the next run will retry`);
  const media = await graph(`${IG_USER_ID}/media_publish`, token, { creation_id: container.id }, "POST");
  const info = await graph(media.id, token, { fields: "permalink" });
  return { reel: q.reel, slot_id: q.slot_id, media_id: media.id, url: info.permalink, trial };
}

/** Called by Vercel Cron (vercel.json) at the posting slot times. */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const token = process.env.IG_ACCESS_TOKEN;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!token) return NextResponse.json({ error: "IG_ACCESS_TOKEN is not set" }, { status: 500 });

  const started = Date.now();
  const queueRes = await fetch(`${IG_QUEUE_URL}?t=${started}`, { cache: "no-store" });
  if (!queueRes.ok) return NextResponse.json({ error: `queue ${queueRes.status}` }, { status: 502 });
  const queue = await queueRes.json().catch(() => null);
  const recent: RecentMedia[] = (await graph(`${IG_USER_ID}/media`, token, { fields: "id,caption", limit: "40" })).data ?? [];

  const due = duePosts(queue, recent, started);
  const posted = [];
  const errors = [];
  for (const q of due) {
    if (Date.now() - started > 60_000) break; // leave time to finish the one in flight
    try {
      posted.push(await publish(q, token, started));
    } catch (err) {
      errors.push({ reel: q.reel, slot_id: q.slot_id, error: String(err) });
      console.error("instagram cron", q.slot_id, err);
    }
  }
  console.log("instagram cron", JSON.stringify({ due: due.map((q) => q.slot_id), posted, errors }));
  return NextResponse.json({ due: due.map((q) => q.slot_id), posted, errors }, { status: errors.length ? 500 : 200 });
}
