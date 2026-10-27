/**
 * Pages whose links carry a credential in the query: the plan email's pages
 * (/my-plan, /email-preferences) arrive with `?token=`, which opens the saved
 * plan and can delete it, until the page takes it out of the address. So does
 * /account when opened from a subscription email (PRE-353). /auth/link is
 * where old sign-in emails pointed (`?oobCode=…&apiKey=…`); it now redirects
 * home with the query dropped (PRE-378), and stays here as a backstop.
 */
const CREDENTIAL_PATHS = ["/auth/link", "/my-plan", "/email-preferences", "/account"];

/** Query parameters that are credentials on any page. */
const SECRET_PARAM_NAMES = ["token", "oobCode", "apiKey"];

function isCredentialPath(pathname: string): boolean {
  return CREDENTIAL_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

/** Rebuilds the first query in `value`, keeping only the parameters `keep` accepts. */
function filterQuery(value: string, keep: (name: string) => boolean): string {
  return value.replace(/\?([^#]*)/, (_, query: string) => {
    const kept = query.split("&").filter((param) => keep(param.split("=")[0]));
    return kept.length ? `?${kept.join("&")}` : "";
  });
}

/**
 * Analytics never keeps a link's credentials: credential pages keep only
 * their `utm_*` parameters (so email campaigns are still credited), and every
 * other URL loses `token`, `oobCode` and `apiKey`. Anything that isn't a URL
 * comes back unchanged.
 */
export function withoutUrlSecrets(value: string): string {
  if (!value.includes("?")) return value;
  if (/^https?:\/\//.test(value)) {
    try {
      if (isCredentialPath(new URL(value).pathname)) {
        return filterQuery(value, (name) => name.startsWith("utm_"));
      }
    } catch {
      // Not a URL after all: fall through to the parameter strip.
    }
  }
  return filterQuery(value, (name) => !SECRET_PARAM_NAMES.includes(name));
}
