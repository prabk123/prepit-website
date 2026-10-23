"use client";

import { getIdToken } from "@/lib/firebase/auth";
import { buildWebSignupBody, type WebSignupAnswer, type WebSignupInput } from "@/lib/funnel/webSignupProfile";
import { isRevenueCatPortalUrl } from "@/lib/revenuecat/portalUrl";

/**
 * The PrepIt backend, called from the browser with the visitor's Firebase ID
 * token (PRE-264). The website never reads the database for accounts.
 *
 * NEXT_PUBLIC_PREPIT_API_BASE_URL is the backend's origin, e.g. the dev API
 * on previews and https://api.tryprepit.app on production.
 */
export function apiBaseUrl(): string | null {
  const base = process.env.NEXT_PUBLIC_PREPIT_API_BASE_URL?.trim();
  return base ? base.replace(/\/+$/, "") : null;
}

export class PrepItApiError extends Error {
  constructor(
    readonly status: number,
    readonly code?: string,
    /** The backend's own reason (`details`), e.g. which field Joi refused. Never shown to people. */
    readonly details?: string,
  ) {
    super(`PrepIt API ${status}${code ? ` ${code}` : ""}`);
    this.name = "PrepItApiError";
  }
}

export async function prepitFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const base = apiBaseUrl();
  if (!base) throw new PrepItApiError(0, "api_not_configured");
  const token = await getIdToken();
  if (!token) throw new PrepItApiError(401, "signed_out");

  let response: Response;
  try {
    response = await fetch(`${base}${path}`, {
      ...init,
      headers: {
        Accept: "application/json",
        ...(init.body ? { "Content-Type": "application/json" } : {}),
        ...init.headers,
        Authorization: `Bearer ${token}`,
      },
    });
  } catch {
    throw new PrepItApiError(0, "network");
  }

  if (!response.ok) {
    let code: string | undefined;
    let details: string | undefined;
    try {
      const body = (await response.json()) as { code?: unknown; details?: unknown };
      if (typeof body.code === "string") code = body.code;
      if (typeof body.details === "string") details = body.details;
    } catch {
      // Not JSON; the status is enough.
    }
    throw new PrepItApiError(response.status, code, details);
  }
  return (await response.json()) as T;
}

/** Subscription states the backend counts as having access (fresca_backend subscriptionAccess.ts). */
const ACTIVE_STATUSES = new Set(["trial", "active", "cancelling"]);

export type PendingProfile = {
  funnelId?: string;
  funnelVersion?: string;
  missingSteps: string[];
  complete: boolean;
  accountCreatedAt: string | null;
};

/** How the PrepIt account that already owns this email signs in. */
export type ExistingProvider = "google" | "apple" | "email" | "unknown";

type AccountResponse = {
  account: null | {
    user: { subscriptionStatus?: string };
    hasUsedTrial?: boolean;
  };
  pendingProfile?: PendingProfile | null;
  /**
   * With `account: null`: this sign-in's email already belongs to another
   * PrepIt account (a different Firebase user). Optional; older backends
   * leave it out.
   */
  emailInUse?: { existingProvider?: string } | null;
};

function toExistingProvider(value: unknown): ExistingProvider {
  return value === "google" || value === "apple" || value === "email" ? value : "unknown";
}

/** What the website needs to know about a signed-in visitor's PrepIt account. */
export type AccountSummary = {
  /** A full PrepIt account exists (they finished onboarding in the app or on the web). */
  hasAccount: boolean;
  /** Their subscription gives access now (trial, active or cancelling), from any store. */
  isSubscribed: boolean;
  /** They had a free trial before, so checkout offers plans without one. */
  hasUsedTrial: boolean;
  /** Web quiz answers saved before the account exists (PRE-262), or null. */
  pendingProfile: PendingProfile | null;
  /**
   * Set when this is a new sign-in whose email already has a PrepIt account
   * under another provider. Paying here would buy for the wrong account, so
   * the visitor is asked to sign in the other way.
   */
  emailInUse: { existingProvider: ExistingProvider } | null;
};

/** `GET /account` with the cookbooks left out. */
export async function fetchAccountSummary(): Promise<AccountSummary> {
  const body = await prepitFetch<AccountResponse>("/account?cookbooks=none");
  const account = body.account;
  return {
    hasAccount: account !== null,
    isSubscribed: account ? ACTIVE_STATUSES.has(account.user?.subscriptionStatus ?? "none") : false,
    hasUsedTrial: account?.hasUsedTrial ?? false,
    pendingProfile: body.pendingProfile ?? null,
    emailInUse:
      account === null && body.emailInUse
        ? { existingProvider: toExistingProvider(body.emailInUse.existingProvider) }
        : null,
  };
}

/**
 * A single-use link to RevenueCat's Web Billing portal for this account's web
 * subscription (`POST /billing/management-url`), or null when the account has
 * no web subscription to manage.
 */
export async function createBillingManagementUrl(): Promise<string | null> {
  try {
    const body = await prepitFetch<{ url?: unknown }>("/billing/management-url", { method: "POST", body: "{}" });
    if (typeof body.url !== "string" || !isRevenueCatPortalUrl(body.url)) {
      throw new PrepItApiError(502, "BILLING_MANAGEMENT_URL_UNEXPECTED");
    }
    return body.url;
  } catch (error) {
    if (error instanceof PrepItApiError && error.status === 404) return null;
    throw error;
  }
}

/** What the billing page link in an email opens (`POST /billing/management-url/link`). */
export type LinkManagementResult =
  | { kind: "portal"; url: string }
  /** No website subscription; `store` is where one that gives access is managed (`app_store`, `play_store`…), or null. */
  | { kind: "none"; store: string | null }
  /** The link is old, changed or not ours: sign in instead. */
  | { kind: "invalid" };

/**
 * The single-use RevenueCat portal link for the subscription an email was
 * about (PRE-353), from the signed token in that email's link. No sign-in:
 * the token is the proof. Throws `PrepItApiError` on anything else.
 */
export async function createBillingManagementUrlFromLink(token: string): Promise<LinkManagementResult> {
  const base = apiBaseUrl();
  if (!base) throw new PrepItApiError(0, "api_not_configured");
  let response: Response;
  try {
    response = await fetch(`${base}/billing/management-url/link`, {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });
  } catch {
    throw new PrepItApiError(0, "network");
  }
  let body: { url?: unknown; code?: unknown; store?: unknown } = {};
  try {
    body = (await response.json()) as typeof body;
  } catch {
    // Not JSON; the status decides.
  }
  if (response.ok) {
    if (typeof body.url !== "string" || !isRevenueCatPortalUrl(body.url)) {
      throw new PrepItApiError(502, "BILLING_MANAGEMENT_URL_UNEXPECTED");
    }
    return { kind: "portal", url: body.url };
  }
  if (response.status === 401) return { kind: "invalid" };
  if (response.status === 404) return { kind: "none", store: typeof body.store === "string" ? body.store : null };
  throw new PrepItApiError(response.status, typeof body.code === "string" ? body.code : undefined);
}

/** The pending profile as the web endpoints return it (fresca_backend `PendingProfileView`). */
export type WebSignupProfile = PendingProfile & {
  answers: WebSignupAnswer[];
};

export type WebSignupState = {
  hasAccount: boolean;
  pendingProfile: WebSignupProfile | null;
};

/** `GET /web-signup/profile`: the answers saved so far and whether the account exists. */
export async function getWebSignupProfile(): Promise<WebSignupState> {
  const body = await prepitFetch<{ hasAccount?: boolean; pendingProfile?: WebSignupProfile | null }>(
    "/web-signup/profile",
  );
  return { hasAccount: Boolean(body.hasAccount), pendingProfile: body.pendingProfile ?? null };
}

export type WebSignupSaveResult = WebSignupState & {
  /** This save made the account from the answers. */
  accountCreated: boolean;
  /** The answers were enough but the account wasn't made: no email on the sign-in, or a value the account refuses. */
  accountNotCreatedReason: "no_email" | "invalid" | null;
};

/**
 * `PATCH /web-signup/profile`: merges answers, account fields and first-touch
 * attribution into the pending profile. Throws `PrepItApiError` 409
 * `email_in_use` when the account it would create belongs to another sign-in.
 */
export async function saveWebSignupProfile(input: WebSignupInput): Promise<WebSignupSaveResult> {
  type SaveResponse = {
    hasAccount?: boolean;
    accountCreated?: boolean;
    accountNotCreatedReason?: string;
    pendingProfile?: WebSignupProfile | null;
  };
  const patch = (value: WebSignupInput) =>
    prepitFetch<SaveResponse>("/web-signup/profile", { method: "PATCH", body: JSON.stringify(buildWebSignupBody(value)) });
  let body: SaveResponse;
  try {
    body = await patch(input);
  } catch (error) {
    // A backend from before PRE-327 refuses the unknown `webSessionId`; the
    // save matters more than the lead match, so send it again without.
    const refusedSessionId =
      error instanceof PrepItApiError && error.status === 400 && Boolean(error.details?.includes("webSessionId"));
    if (!(refusedSessionId && input.webSessionId)) throw error;
    body = await patch({ ...input, webSessionId: undefined });
  }
  const reason = body.accountNotCreatedReason;
  return {
    hasAccount: Boolean(body.hasAccount),
    accountCreated: Boolean(body.accountCreated),
    accountNotCreatedReason: reason === "no_email" || reason === "invalid" ? reason : null,
    pendingProfile: body.pendingProfile ?? null,
  };
}
