/**
 * Pages for people who already have PrepIt: their account, the app link
 * fallback, withdrawal and email preferences, the AI app consent page (and the "You're in" page). The
 * site's start buttons (StartTrialLink) don't show there, so a paying member
 * isn't offered a free trial (PRE-448).
 */
export const MEMBER_PAGE_PREFIXES = ["/account", "/open", "/withdraw", "/email-preferences", "/welcome", "/connect"] as const;

export function isMemberPage(pathname: string | null | undefined): boolean {
  if (!pathname) return false;
  return MEMBER_PAGE_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}
