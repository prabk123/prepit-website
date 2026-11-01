/**
 * TikTok publishing for PrepIt's own account (TikTok Content Posting API, Direct Post).
 *
 * The publisher page (/tiktok-publisher) signs in with TikTok (Login Kit), reads the
 * creator's posting options and posts a reel the PrepIt team approved. TikTok fetches
 * the video from this site (PULL_FROM_URL needs a verified domain): /media/reels/* is
 * a rewrite to the reels Blob store, see next.config.ts.
 *
 * Kept free of Next imports so the unit tests can import it.
 */

export const TIKTOK_API = "https://open.tiktokapis.com/v2";
export const TIKTOK_AUTHORIZE = "https://www.tiktok.com/v2/auth/authorize/";
export const TIKTOK_SCOPES = "user.info.basic,video.publish";
export const TOKEN_COOKIE = "tt_publisher_token";
export const STATE_COOKIE = "tt_publisher_state";

/** Only videos served from this site's reels path may be posted. */
export const MEDIA_PREFIX = "https://tryprepit.app/media/reels/";

/**
 * The reels ready to post, written by the PrepIt reel pipeline to the Blob store outside
 * the public /media/reels/ path, so only the signed-in PrepIt account sees the list
 * (read server-side by /api/tiktok/queue).
 */
export const QUEUE_URL = "https://hf1esjmhuinvpakl.public.blob.vercel-storage.com/publisher/queue.json";
export type QueuedReel = { id: string; title: string; file: string; caption: string };

export const PRIVACY_LABELS: Record<string, string> = {
  PUBLIC_TO_EVERYONE: "Everyone",
  MUTUAL_FOLLOW_FRIENDS: "Friends",
  FOLLOWER_OF_CREATOR: "Followers",
  SELF_ONLY: "Only me",
};

/** TikTok's creator_info for the signed-in creator. */
export type CreatorInfo = {
  creator_avatar_url: string;
  creator_username: string;
  creator_nickname: string;
  privacy_level_options: string[];
  comment_disabled: boolean;
  duet_disabled: boolean;
  stitch_disabled: boolean;
  max_video_post_duration_sec: number;
};

/**
 * Only PrepIt's own TikTok account may use the publisher. TIKTOK_ALLOWED_USERNAMES is a
 * comma-separated list; it defaults to tryprepit.
 */
export function allowedCreator(username: string | undefined, allowList = "tryprepit"): boolean {
  if (!username) return false;
  const allowed = allowList.split(",").map((u) => u.trim().replace(/^@/, "").toLowerCase()).filter(Boolean);
  return allowed.includes(username.toLowerCase());
}

export const NOT_ALLOWED = "This page only posts to PrepIt's own TikTok account. Sign out and sign in as @tryprepit.";

export type PostRequest = {
  videoUrl: string;
  title: string;
  privacy: string;
  disableComment: boolean;
  disableDuet: boolean;
  disableStitch: boolean;
  brandOrganic: boolean;
  brandedContent: boolean;
};

/**
 * Checks a post request against the creator's options. Returns an error message,
 * or null when the request is fine. Mirrors TikTok's Direct Post UX rules: a privacy
 * level the creator offers, chosen by the user (no default); branded content can't be
 * private; captions up to 2,200 characters.
 */
export function postRequestError(r: Partial<PostRequest>, privacyOptions: string[]): string | null {
  if (typeof r.videoUrl !== "string" || !r.videoUrl.startsWith(MEDIA_PREFIX) || r.videoUrl.includes(".."))
    return "Pick one of the PrepIt reels.";
  if (typeof r.title !== "string" || r.title.length > 2200) return "The caption must be 2,200 characters or fewer.";
  if (typeof r.privacy !== "string" || !privacyOptions.includes(r.privacy)) return "Choose who can view this video.";
  if (r.brandedContent && r.privacy === "SELF_ONLY") return "Branded content can't be private.";
  return null;
}

/** The body of TikTok's /post/publish/video/init/ call for a Direct Post. */
export function directPostBody(r: PostRequest) {
  return {
    post_info: {
      title: r.title,
      privacy_level: r.privacy,
      disable_comment: r.disableComment,
      disable_duet: r.disableDuet,
      disable_stitch: r.disableStitch,
      brand_organic_toggle: r.brandOrganic,
      brand_content_toggle: r.brandedContent,
      is_aigc: false,
    },
    source_info: { source: "PULL_FROM_URL", video_url: r.videoUrl },
  };
}

/** The consent line TikTok requires next to the Post button. */
export function consentText(brandedContent: boolean): string {
  if (brandedContent)
    return "By posting, you agree to TikTok's Branded Content Policy and Music Usage Confirmation.";
  return "By posting, you agree to TikTok's Music Usage Confirmation.";
}
