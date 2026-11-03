/**
 * TikTok inbox drafts for PrepIt's own account (Content Posting API, inbox upload).
 *
 * Until TikTok approves Direct Post, each approved reel is sent to the @tryprepit TikTok
 * inbox at its slot time; the PrepIt team adds the caption in the TikTok app and taps Post.
 * The reel pipeline writes the list to TT_QUEUE_URL in the reels Blob store. The inbox API
 * takes no caption, so the queue's captions are shown on the team's reel plan instead.
 *
 * Kept free of Next imports so the unit tests can import it.
 */

export const TT_QUEUE_URL = "https://hf1esjmhuinvpakl.public.blob.vercel-storage.com/publisher/tt-queue.json";
export const VIDEO_PREFIX = "https://hf1esjmhuinvpakl.public.blob.vercel-storage.com/reels/";
/**
 * A draft is sent only by the cron run in the hour its slot opens. Vercel Hobby crons fire
 * once somewhere in their scheduled hour, so this sends each draft exactly once without
 * keeping any state (a missed hour is skipped, never doubled).
 */
export const SEND_WINDOW_MS = 60 * 60 * 1000;
/** TikTok's single-chunk upload limit. */
export const MAX_SINGLE_CHUNK = 64 * 1024 * 1024;

export type QueuedDraft = { slot_id: string; reel: string; at: string; video_url: string };

export function isValidDraft(x: unknown): x is QueuedDraft {
  if (!x || typeof x !== "object") return false;
  const q = x as Record<string, unknown>;
  return (
    typeof q.slot_id === "string" &&
    typeof q.reel === "string" &&
    typeof q.at === "string" &&
    !Number.isNaN(Date.parse(q.at)) &&
    typeof q.video_url === "string" &&
    q.video_url.startsWith(VIDEO_PREFIX) &&
    !q.video_url.slice(VIDEO_PREFIX.length).includes("..")
  );
}

/** The drafts to send now: slot opened within the last SEND_WINDOW_MS. Oldest first, one per reel. */
export function dueDrafts(queue: unknown, now: number): QueuedDraft[] {
  const items = Array.isArray(queue) ? queue.filter(isValidDraft) : [];
  const seen = new Set<string>();
  return items
    .filter((q) => {
      const at = Date.parse(q.at);
      return at <= now && now - at < SEND_WINDOW_MS;
    })
    .sort((a, b) => Date.parse(a.at) - Date.parse(b.at))
    .filter((q) => (seen.has(q.reel) ? false : (seen.add(q.reel), true)));
}

/** The body of TikTok's /post/publish/inbox/video/init/ call for a one-chunk file upload. */
export function inboxInitBody(size: number) {
  return { source_info: { source: "FILE_UPLOAD", video_size: size, chunk_size: size, total_chunk_count: 1 } };
}
