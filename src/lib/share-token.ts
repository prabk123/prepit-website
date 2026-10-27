/**
 * Shared meal plan links (PRE-377). A plan is only readable on the website
 * through a random share token that a share action wrote onto that plan, never
 * through its database id. Nothing writes share tokens yet, so the website
 * does not look real plans up at all unless `SHARED_MEAL_PLANS_ENABLED=true`;
 * turn that on only once the backend writes `shareToken` and indexes it
 * (unique, sparse), or every lookup scans the plans collection.
 */

/**
 * The token contract: 32 to 64 base64url characters, so at least 192 bits
 * (for example `randomBytes(24).toString("base64url")`, which is 32
 * characters). A database id (24 hex characters) can never match.
 */
const SHARE_TOKEN_PATTERN = /^[A-Za-z0-9_-]{32,64}$/;
const PLAN_ID_PATTERN = /^[0-9a-f]{24}$/i;

export function isShareToken(value: string): boolean {
  return SHARE_TOKEN_PATTERN.test(value);
}

/** A link from an app build that shared plans by database id (1.2.0 to 1.8.0). */
export function isPlanIdLink(value: string): boolean {
  return PLAN_ID_PATTERN.test(value);
}

export function sharedMealPlansEnabled(env: Record<string, string | undefined> = process.env): boolean {
  return env.SHARED_MEAL_PLANS_ENABLED === "true";
}
