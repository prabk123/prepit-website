/**
 * Which client-side page changes send Meta a PageView (PRE-568). The pixel
 * snippet in layout.tsx sends the first PageView when it loads; the site then
 * moves between pages without a reload (quiz, /start, /welcome), so
 * MetaPageViews sends one for each later page. Kept free of React so the node
 * tests can run it.
 */

/**
 * Pages Meta must never see: the plan email pages carry a token in the
 * address, and so does /account when opened from a subscription email
 * (PRE-353). The same rule as `prepitLoadMetaPixel` in layout.tsx.
 */
export function metaPixelBlockedPage(pathname: string, search: string): boolean {
  if (pathname === "/my-plan" || pathname.startsWith("/my-plan/")) return true;
  if (pathname === "/email-preferences" || pathname.startsWith("/email-preferences/")) return true;
  if ((pathname === "/account" || pathname === "/account/") && /[?&]token=/.test(search)) return true;
  return false;
}

/**
 * Whether moving from `previous` to `next` is a new page for Meta. The first
 * page (no previous) is the snippet's own PageView, and a change of query or
 * hash on the same page is not a new page.
 */
export function isNewMetaPage(previous: string | null, next: string): boolean {
  return previous !== null && previous !== next;
}
