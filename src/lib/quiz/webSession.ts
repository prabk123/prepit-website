/**
 * The quiz's session id (PRE-327): made once per browser and kept in
 * localStorage, so the email gate's lead and the bridge's sign-in
 * (bridgeHandoff.readWebSessionId) can be matched up.
 */
import { readWebSessionId, WEB_SESSION_ID_KEY } from "@/lib/funnel/bridgeHandoff";

function newId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") return crypto.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
}

/** This browser's quiz session id, made now if there is none. Undefined when storage is blocked. */
export function getWebSessionId(): string | undefined {
  const existing = readWebSessionId();
  if (existing) return existing;
  const id = newId();
  try {
    window.localStorage.setItem(WEB_SESSION_ID_KEY, id);
  } catch {
    return undefined;
  }
  return readWebSessionId();
}
