/**
 * Shared meal plan links (PRE-377). A plan is only readable on the website
 * through a random share token that a share action wrote onto that plan, never
 * through its database id. Nothing writes share tokens yet, so the website
 * does not look real plans up at all unless `SHARED_MEAL_PLANS_ENABLED=true`;
 * turn that on only once the backend writes `shareToken` and indexes it
 * (unique, sparse), or every lookup scans the plans collection.
 */

/** Base64url, at least 128 bits. A database id (24 hex characters) is too short. */
const SHARE_TOKEN_PATTERN = /^[A-Za-z0-9_-]{32,64}$/;

export function isShareToken(value: string): boolean {
  return SHARE_TOKEN_PATTERN.test(value);
}

export function sharedMealPlansEnabled(env: Record<string, string | undefined> = process.env): boolean {
  return env.SHARED_MEAL_PLANS_ENABLED === "true";
}
