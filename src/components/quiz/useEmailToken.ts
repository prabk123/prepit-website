"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "prepit.emailToken";
const TOKEN = /^[A-Za-z0-9_.~-]{8,512}$/;

/**
 * The token from an email link (`?token=`), for /my-plan and
 * /email-preferences. It is taken out of the address bar straight away and
 * kept for this tab, so analytics page views and a shared screenshot never
 * carry it, and a refresh still works. Undefined until read, null if none.
 */
export function useEmailToken(): string | null | undefined {
  const [token, setToken] = useState<string | null | undefined>(undefined);

  useEffect(() => {
    const url = new URL(window.location.href);
    const fromUrl = url.searchParams.get("token")?.trim() ?? "";
    let value: string | null = TOKEN.test(fromUrl) ? fromUrl : null;
    try {
      if (value) window.sessionStorage.setItem(STORAGE_KEY, value);
      else value = window.sessionStorage.getItem(STORAGE_KEY);
    } catch {
      // Storage blocked: the token from the link still works for this view.
    }
    if (url.searchParams.has("token")) {
      url.searchParams.delete("token");
      window.history.replaceState(window.history.state, "", `${url.pathname}${url.search}${url.hash}`);
    }
    setToken(value && TOKEN.test(value) ? value : null);
  }, []);

  return token;
}
