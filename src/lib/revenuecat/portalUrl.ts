/** RevenueCat hosts the Web Billing portal; any other address is refused. */
const PORTAL_HOST_SUFFIXES = ["revenuecat.com", "rev.cat"];

export function isRevenueCatPortalUrl(value: string): boolean {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return false;
  }
  if (url.protocol !== "https:" || url.username || url.password || url.port) return false;
  const host = url.hostname.toLowerCase();
  return PORTAL_HOST_SUFFIXES.some((suffix) => host === suffix || host.endsWith(`.${suffix}`));
}
