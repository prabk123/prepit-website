/**
 * Instagram auto-posting for PrepIt's own account (Instagram Graph API, Reels).
 *
 * The PrepIt reel pipeline writes the week's approved reels, each with its slot time, to
 * IG_QUEUE_URL in the reels Blob store. A Vercel cron calls /api/instagram/cron at the slot
 * times; it posts every queued reel whose time has come and that is not already on the
 * account. Nothing is posted that is not in the queue, and the queue only ever holds reels
 * the PrepIt team approved.
 *
 * Kept free of Next imports so the unit tests can import it.
 */

export const GRAPH = "https://graph.facebook.com/v24.0";
export const IG_USER_ID = "17841479942300970";
export const IG_QUEUE_URL = "https://hf1esjmhuinvpakl.public.blob.vercel-storage.com/publisher/ig-queue.json";
/** Videos must come from the reels Blob store. */
export const VIDEO_PREFIX = "https://hf1esjmhuinvpakl.public.blob.vercel-storage.com/reels/";
/** A slot missed by more than this is left for a person to look at instead of posting late. */
export const MAX_LATE_MS = 6 * 60 * 60 * 1000;

export type QueuedPost = {
  slot_id: string;
  reel: string;
  at: string; // ISO time the slot opens
  video_url: string;
  caption: string;
  trial?: boolean;
};

export type RecentMedia = { id: string; caption?: string };

/** Compare captions loosely: Instagram can trim whitespace. */
export function captionKey(caption: string | undefined): string {
  return (caption ?? "").replace(/\s+/g, " ").trim().slice(0, 120);
}

export function isValidItem(x: unknown): x is QueuedPost {
  if (!x || typeof x !== "object") return false;
  const q = x as Record<string, unknown>;
  return (
    typeof q.slot_id === "string" &&
    typeof q.reel === "string" &&
    typeof q.at === "string" &&
    !Number.isNaN(Date.parse(q.at)) &&
    typeof q.video_url === "string" &&
    q.video_url.startsWith(VIDEO_PREFIX) &&
    !q.video_url.slice(VIDEO_PREFIX.length).includes("..") &&
    typeof q.caption === "string" &&
    q.caption.trim().length > 0
  );
}

/**
 * The queued reels to post now: slot time reached, not more than MAX_LATE_MS late, and no
 * recent post on the account with the same caption. Oldest slot first; one reel at most once.
 */
export function duePosts(queue: unknown, recent: RecentMedia[], now: number): QueuedPost[] {
  const items = Array.isArray(queue) ? queue.filter(isValidItem) : [];
  const live = new Set(recent.map((m) => captionKey(m.caption)).filter(Boolean));
  const seen = new Set<string>();
  return items
    .filter((q) => {
      const at = Date.parse(q.at);
      return at <= now && now - at <= MAX_LATE_MS && !live.has(captionKey(q.caption));
    })
    .sort((a, b) => Date.parse(a.at) - Date.parse(b.at))
    .filter((q) => (seen.has(q.reel) ? false : (seen.add(q.reel), true)));
}

/** Form fields for the Reels container. */
export function containerParams(q: QueuedPost, trial: boolean): Record<string, string> {
  const p: Record<string, string> = {
    media_type: "REELS",
    video_url: q.video_url,
    caption: q.caption,
    share_to_feed: "true",
  };
  if (trial) p.trial_params = JSON.stringify({ graduation_strategy: "MANUAL" });
  return p;
}
