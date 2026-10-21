/**
 * What RevenueCat gets so its Meta integration can match a web purchase to the
 * ad that brought the buyer (RevenueCat sends web purchases to Meta as website
 * events and needs `$fbp`, `$fbc` or an email to send one at all).
 *
 * Only Meta's own browser and click ids, the sign-in email, the visitor's IP
 * address, the browser's user agent and the checkout page address (no query
 * string). Never a quiz answer.
 * Free of browser APIs so it can be tested.
 */

export type MetaMatchingInput = {
  /** The `_fbp` cookie the Meta Pixel sets. */
  fbpCookie?: string | null;
  /** The `_fbc` cookie the Meta Pixel sets when the visitor came from an ad. */
  fbcCookie?: string | null;
  /** The ad click id kept with this tab's attribution, for when there is no `_fbc` cookie. */
  fbclid?: string | null;
  email?: string | null;
  /** From the site's own /api/client-ip. */
  ip?: string | null;
  userAgent?: string | null;
  /** The page address; only its origin and path are kept. */
  pageUrl?: string | null;
  /** Milliseconds, for an `fbc` built from `fbclid`. */
  now: number;
};

/**
 * Three groups, each sent on its own, so a key RevenueCat refuses in one
 * group can't lose the others.
 */
export type MetaMatchingAttributes = {
  identity: Record<string, string>;
  /** Meta's browser and click ids, the ones that matter most for matching. */
  ids: Record<string, string>;
  browser: Record<string, string>;
};

const IPV4 = /^(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)$/;
const IPV6 = /^[0-9a-f:]{2,39}$/i;

/** An IPv4 or IPv6 address, or nothing. */
export function cleanIpAddress(value: string | null | undefined): string | undefined {
  const trimmed = value?.trim();
  if (!trimmed) return undefined;
  if (IPV4.test(trimmed)) return trimmed;
  return IPV6.test(trimmed) && trimmed.includes(":") ? trimmed : undefined;
}

/** Meta's documented `_fbp` / `_fbc` shape: `fb.<subdomain index>.<time>.<value>`. */
const META_COOKIE = /^fb\.\d\.\d+\..+$/;

function cookieValue(value: string | null | undefined): string | undefined {
  if (!value) return undefined;
  let decoded = value;
  try {
    decoded = decodeURIComponent(value);
  } catch {
    // Keep it as it came.
  }
  const trimmed = decoded.trim();
  return META_COOKIE.test(trimmed) && trimmed.length <= 500 ? trimmed : undefined;
}

/** `fb.1.<time>.<fbclid>`, the format Meta asks for when building fbc yourself. */
export function fbcFromClickId(fbclid: string | null | undefined, now: number): string | undefined {
  const clickId = fbclid?.trim();
  if (!clickId || clickId.length > 500) return undefined;
  return `fb.1.${Math.floor(now)}.${clickId}`;
}

function pageAddress(pageUrl: string | null | undefined): string | undefined {
  if (!pageUrl) return undefined;
  try {
    const url = new URL(pageUrl);
    if (url.protocol !== "https:" && url.protocol !== "http:") return undefined;
    return `${url.origin}${url.pathname}`;
  } catch {
    return undefined;
  }
}

export function metaMatchingAttributes(input: MetaMatchingInput): MetaMatchingAttributes {
  const identity: Record<string, string> = {};
  const email = input.email?.trim();
  if (email && email.includes("@")) identity.$email = email;
  // `$email` and `$ip` are both in the web SDK's reserved attribute list.
  const ip = cleanIpAddress(input.ip);
  if (ip) identity.$ip = ip;

  const ids: Record<string, string> = {};
  const fbp = cookieValue(input.fbpCookie);
  if (fbp) ids.$fbp = fbp;
  const fbc = cookieValue(input.fbcCookie) ?? fbcFromClickId(input.fbclid, input.now);
  if (fbc) ids.$fbc = fbc;

  const browser: Record<string, string> = {};
  const userAgent = input.userAgent?.trim();
  if (userAgent) browser.$userAgent = userAgent.slice(0, 500);
  const page = pageAddress(input.pageUrl);
  if (page) browser.$pageUrl = page;

  return { identity, ids, browser };
}
