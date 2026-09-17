"use client";

const STORAGE_KEY = "prepit.attribution";

export type Attribution = {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  fbclid?: string;
};

const KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "fbclid",
] as const;

function readStored(): Attribution {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Attribution;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeStored(value: Attribution) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    // Ignore quota / private-mode failures.
  }
}

export function captureAttributionFromLocation(): Attribution {
  if (typeof window === "undefined") return {};
  const params = new URLSearchParams(window.location.search);
  const incoming: Attribution = {};
  for (const key of KEYS) {
    const value = params.get(key)?.trim();
    if (value) incoming[key] = value;
  }
  const stored = readStored();
  const merged: Attribution = { ...incoming, ...stored };
  if (Object.keys(merged).length > 0) writeStored(merged);
  return merged;
}

export function getAttribution(): Attribution {
  if (typeof window === "undefined") return {};
  const stored = readStored();
  if (Object.keys(stored).length > 0) return stored;
  return captureAttributionFromLocation();
}

export function attributionProperties(): Record<string, string> {
  const attribution = getAttribution();
  const properties: Record<string, string> = {};
  for (const key of KEYS) {
    const value = attribution[key];
    if (value) properties[key] = value;
  }
  return properties;
}

/** Meta click ID cookie, or a reconstructed value from `fbclid`. */
export function facebookClickId(): string | undefined {
  if (typeof document === "undefined") return undefined;
  const match = document.cookie.match(/(?:^|; )_fbc=([^;]*)/);
  if (match?.[1]) return decodeURIComponent(match[1]);
  const fbclid = getAttribution().fbclid;
  if (!fbclid) return undefined;
  return `fb.1.${Date.now()}.${fbclid}`;
}

export function facebookBrowserId(): string | undefined {
  if (typeof document === "undefined") return undefined;
  const match = document.cookie.match(/(?:^|; )_fbp=([^;]*)/);
  return match?.[1] ? decodeURIComponent(match[1]) : undefined;
}
