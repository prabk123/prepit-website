"use client";

import { useEffect, useState } from "react";
import { SECONDARY_BUTTON_CLASS, TEXT_BUTTON_CLASS } from "@/components/ui/buttons";
import { disconnectApp, fetchConnectedApps, type ConnectedApp } from "@/lib/connector/connectApi";
import { trackWebFunnelEvent, WEB_FUNNEL_EVENTS } from "@/lib/webFunnelAnalytics";

function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" });
}

type Row = ConnectedApp & { state: "idle" | "confirm" | "disconnecting" | "error" };

/**
 * Connected AI apps on the account page (PRE-507): each AI app connected to
 * this PrepIt account through the connector, with Disconnect. Only people
 * with the connector flag can connect one, so for everyone else the list is
 * empty and nothing shows. It also stays hidden on a backend without the
 * route, and if the list can't be loaded.
 */
export default function ConnectedAiApps({ uid }: { uid: string }) {
  const [loaded, setLoaded] = useState<{ uid: string; rows: Row[] } | null>(null);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let cancelled = false;
    fetchConnectedApps()
      .then((apps) => {
        if (!cancelled) setLoaded({ uid, rows: (apps ?? []).map((app) => ({ ...app, state: "idle" })) });
      })
      .catch(() => {
        if (!cancelled) setLoaded({ uid, rows: [] });
      });
    return () => {
      cancelled = true;
    };
  }, [uid]);

  const rows = loaded && loaded.uid === uid ? loaded.rows : [];

  function setRow(id: string, state: Row["state"]) {
    setLoaded((current) =>
      current ? { ...current, rows: current.rows.map((row) => (row.id === id ? { ...row, state } : row)) } : current,
    );
  }

  async function disconnect(row: Row) {
    setRow(row.id, "disconnecting");
    try {
      await disconnectApp(row.id);
      trackWebFunnelEvent(WEB_FUNNEL_EVENTS.connectedAppDisconnect, { outcome: "disconnected" });
      setLoaded((current) => (current ? { ...current, rows: current.rows.filter((r) => r.id !== row.id) } : current));
      setNotice(`${row.clientName} was disconnected. It can't read your PrepIt data any more.`);
    } catch {
      trackWebFunnelEvent(WEB_FUNNEL_EVENTS.connectedAppDisconnect, { outcome: "error" });
      setRow(row.id, "error");
    }
  }

  if (rows.length === 0) {
    return notice ? (
      <p role="status" aria-live="polite" className="text-small text-ink-secondary">
        {notice}
      </p>
    ) : null;
  }

  return (
    <section aria-labelledby="connected-ai-apps" className="flex w-full flex-col gap-3 border-t border-line pt-6 text-left">
      <h2 id="connected-ai-apps" className="text-body font-bold text-ink">
        Connected AI apps
      </h2>
      <p className="text-small text-ink-secondary">These apps can read your PrepIt data. They can&apos;t change anything.</p>
      <ul className="flex flex-col gap-3">
        {rows.map((row) => {
          const connected = formatDate(row.connectedAt);
          const lastUsed = row.lastUsedAt ? formatDate(row.lastUsedAt) : "";
          return (
            <li key={row.id} className="flex flex-col gap-3 rounded-button border border-line bg-surface-raised p-4">
              <div className="flex flex-col gap-1">
                <p className="text-body font-bold text-ink">{row.clientName}</p>
                <p className="text-small text-ink-muted">
                  {connected ? `Connected ${connected}` : "Connected"}
                  {lastUsed ? ` · Last used ${lastUsed}` : ""}
                </p>
              </div>
              {row.state === "confirm" || row.state === "disconnecting" ? (
                <div className="flex flex-col gap-2">
                  <p className="text-small text-ink">
                    Disconnect {row.clientName}? It will stop reading your PrepIt data straight away.
                  </p>
                  <button
                    type="button"
                    className={SECONDARY_BUTTON_CLASS}
                    disabled={row.state === "disconnecting"}
                    onClick={() => void disconnect(row)}
                  >
                    {row.state === "disconnecting" ? "Disconnecting…" : "Disconnect"}
                  </button>
                  <button
                    type="button"
                    className={`${TEXT_BUTTON_CLASS} self-center`}
                    disabled={row.state === "disconnecting"}
                    onClick={() => setRow(row.id, "idle")}
                  >
                    Keep connected
                  </button>
                </div>
              ) : (
                <button type="button" className={`${TEXT_BUTTON_CLASS} self-start`} onClick={() => setRow(row.id, "confirm")}>
                  Disconnect
                </button>
              )}
              {row.state === "error" && (
                <p role="status" className="text-small text-error">
                  We couldn&apos;t disconnect {row.clientName}. Please try again.
                </p>
              )}
            </li>
          );
        })}
      </ul>
      <p role="status" aria-live="polite" className={notice ? "text-small text-ink-secondary" : "sr-only"}>
        {notice}
      </p>
    </section>
  );
}
