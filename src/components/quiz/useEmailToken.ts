"use client";

import { useEffect, useState } from "react";

const DEFAULT_STORAGE_KEY = "prepit.emailToken";
const TOKEN = /^[A-Za-z0-9_.~-]{8,512}$/;

/**
 * The token from an email link (`?token=`), for /my-plan and
 * /email-preferences, and for /account under its own `storageKey` so a quiz
 * token is never sent as a subscription link or the other way round. It is
 * taken out of the address bar straight away and kept for this tab, so
 * analytics page views and a shared screenshot never carry it, and a refresh
 * still works. Undefined until read, null if none.
 */
export function useEmailToken(storageKey: string = DEFAULT_STORAGE_KEY): string | null | undefined {
  const [token, setToken] = useState<string | null | undefined>(undefined);

  useEffect(() => {
    const url = new URL(window.location.href);
    const fromUrl = url.searchParams.get("token")?.trim() ?? "";
    let value: string | null = TOKEN.test(fromUrl) ? fromUrl : null;
    try {
      if (value) window.sessionStorage.setItem(storageKey, value);
      else value = window.sessionStorage.getItem(storageKey);
    } catch {
      // Storage blocked: the token from the link still works for this view.
    }
    if (url.searchParams.has("token")) {
      url.searchParams.delete("token");
      window.history.replaceState(window.history.state, "", `${url.pathname}${url.search}${url.hash}`);
    }
    setToken(value && TOKEN.test(value) ? value : null);
    // Each caller passes a constant key, so reading it once is enough.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return token;
}
