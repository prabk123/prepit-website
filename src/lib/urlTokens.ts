/**
 * Pages whose links carry a credential in the query: the plan email's pages
 * (/my-plan, /email-preferences) arrive with `?token=`, which opens the saved
 * plan and can delete it, until the page takes it out of the address. So does
 * /account when opened from a subscription email (PRE-353). /auth/link is
 * where old sign-in emails pointed (`?oobCode=…&apiKey=…`); the page is gone
 * (PRE-378) but those links can still be opened.
 */
const CREDENTIAL_PATHS = ["/auth/link", "/my-plan", "/email-preferences", "/account"];

/** Query parameters that are credentials on any page. */
const SECRET_PARAMS = /([?&])(?:token|oobCode|apiKey)=[^&#]*&?/g;

function isCredentialPath(pathname: string): boolean {
  return CREDENTIAL_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

/**
 * Analytics never keeps a link's credentials: credential pages lose their
 * whole query, and every other URL loses `token`, `oobCode` and `apiKey`.
 * Anything that isn't a URL comes back unchanged.
 */
export function withoutUrlSecrets(value: string): string {
  if (/^https?:\/\//.test(value) && value.includes("?")) {
    try {
      const url = new URL(value);
      if (isCredentialPath(url.pathname)) {
        url.search = "";
        return url.toString();
      }
    } catch {
      // Not a URL after all: fall through to the parameter strip.
    }
  }
  if (!/[?&](?:token|oobCode|apiKey)=/.test(value)) return value;
  return value.replace(SECRET_PARAMS, "$1").replace(/[?&](?=#|$)/, "");
}
