"use client";

import { getIdToken } from "@/lib/firebase/auth";

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
    try {
      const body = (await response.json()) as { code?: unknown };
      if (typeof body.code === "string") code = body.code;
    } catch {
      // Not JSON; the status is enough.
    }
    throw new PrepItApiError(response.status, code);
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
