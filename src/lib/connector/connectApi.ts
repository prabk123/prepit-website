"use client";

import { getIdToken } from "@/lib/firebase/auth";
import { prepitFetch, PrepItApiError } from "@/lib/prepitApi";
import {
  displayClientName,
  interactionUrl,
  resolveMcpIssuer,
  safeRedirect,
  toBlockedReason,
  type ConnectBlockedReason,
} from "./connectParams";

/**
 * The consent page's calls to the connector's OAuth server (fresca_backend
 * PRE-504, `services/mcpOAuth/router.ts`). They go to the connector host with
 * `credentials: "include"`: the interaction cookie set when the AI app
 * started the connection must come along, so only the browser that started
 * it can answer it. The Firebase ID token says who is answering.
 */
export function mcpIssuer(): string {
  return resolveMcpIssuer(process.env.NEXT_PUBLIC_MCP_OAUTH_ISSUER);
}

export type ConnectRequest =
  | {
      kind: "ready";
      clientName: string;
      /** The host the AI app sends people back to, for analytics only. */
      redirectHost: string | null;
      eligible: true;
    }
  | {
      kind: "blocked";
      clientName: string;
      redirectHost: string | null;
      eligible: false;
      reason: ConnectBlockedReason;
    }
  /** The request is gone, already answered, or was started in another browser. */
  | { kind: "expired" };

async function interactionFetch(uid: string, action: "details" | "approve" | "deny"): Promise<Response> {
  const token = await getIdToken();
  if (!token) throw new PrepItApiError(401, "signed_out");
  try {
    return await fetch(interactionUrl(mcpIssuer(), uid, action), {
      method: action === "details" ? "GET" : "POST",
      credentials: "include",
      cache: "no-store",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
        ...(action === "details" ? {} : { "Content-Type": "application/json" }),
      },
      ...(action === "details" ? {} : { body: "{}" }),
    });
  } catch {
    throw new PrepItApiError(0, "network");
  }
}

async function readJson(response: Response): Promise<Record<string, unknown>> {
  try {
    const body = (await response.json()) as unknown;
    return body && typeof body === "object" ? (body as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

/** `GET <issuer>/interaction/:uid/details`: who is asking and whether this account can connect. */
export async function fetchConnectRequest(uid: string): Promise<ConnectRequest> {
  const response = await interactionFetch(uid, "details");
  if (response.status === 404) return { kind: "expired" };
  if (!response.ok) throw new PrepItApiError(response.status);
  const body = await readJson(response);
  const client = (body.client && typeof body.client === "object" ? body.client : {}) as Record<string, unknown>;
  const clientName = displayClientName(client.name);
  const redirectHost = typeof client.redirectHost === "string" ? client.redirectHost : null;
  if (body.eligible === true) return { kind: "ready", clientName, redirectHost, eligible: true };
  return { kind: "blocked", clientName, redirectHost, eligible: false, reason: toBlockedReason(body.reason) };
}

export type ConnectAnswer =
  /** Follow `redirectTo` back to the AI app. */
  | { outcome: "redirect"; redirectTo: string }
  /** Allow was refused now (the account changed since the page loaded); the AI app was told no. */
  | { outcome: "blocked"; reason: ConnectBlockedReason; redirectTo: string | null }
  | { outcome: "expired" };

/** `POST <issuer>/interaction/:uid/approve` or `/deny`. Throws on network and server errors. */
export async function answerConnectRequest(uid: string, choice: "approve" | "deny"): Promise<ConnectAnswer> {
  const response = await interactionFetch(uid, choice);
  const body = await readJson(response);
  const redirectTo = safeRedirect(body.redirectTo);
  if (response.ok && redirectTo) return { outcome: "redirect", redirectTo };
  if (response.status === 403) return { outcome: "blocked", reason: toBlockedReason(body.reason), redirectTo };
  // 404: gone or another browser's request. 400: already answered.
  if (response.status === 404 || response.status === 400) return { outcome: "expired" };
  throw new PrepItApiError(response.status);
}

/** One connected AI app (fresca_backend `McpGrantView`). */
export type ConnectedApp = {
  id: string;
  clientName: string;
  connectedAt: string;
  lastUsedAt: string | null;
};

/**
 * `GET /connector/grants` on the API. Null when this backend has no such
 * route yet (404), so the account page shows nothing.
 */
export async function fetchConnectedApps(): Promise<ConnectedApp[] | null> {
  try {
    const body = await prepitFetch<{ grants?: unknown }>("/connector/grants");
    if (!Array.isArray(body.grants)) return [];
    return body.grants.flatMap((raw): ConnectedApp[] => {
      if (!raw || typeof raw !== "object") return [];
      const grant = raw as Record<string, unknown>;
      if (typeof grant.id !== "string" || typeof grant.connectedAt !== "string") return [];
      return [
        {
          id: grant.id,
          clientName: displayClientName(grant.clientName),
          connectedAt: grant.connectedAt,
          lastUsedAt: typeof grant.lastUsedAt === "string" ? grant.lastUsedAt : null,
        },
      ];
    });
  } catch (error) {
    if (error instanceof PrepItApiError && error.status === 404) return null;
    throw error;
  }
}

/** `DELETE /connector/grants/:id?source=website`. A 404 means it was already gone. */
export async function disconnectApp(id: string): Promise<void> {
  try {
    await prepitFetch<unknown>(`/connector/grants/${encodeURIComponent(id)}?source=website`, { method: "DELETE" });
  } catch (error) {
    if (error instanceof PrepItApiError && error.status === 404) return;
    throw error;
  }
}
