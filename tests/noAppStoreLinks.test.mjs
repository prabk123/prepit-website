// Every visitor starts on the website (PRE-448): App Store links, buttons and
// QR codes are only for people who have already bought, on /welcome and /open.
// Run with `yarn test`.
import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { test } from "node:test";

const ROOT = new URL("..", import.meta.url).pathname;
const SRC = join(ROOT, "src");

/** Files allowed to link to the App Store: the pages after a purchase and the components they use. */
const ALLOWED = new Set([
  "src/app/welcome/page.tsx",
  "src/app/welcome/OpenAppLink.tsx",
  "src/app/open/page.tsx",
  // "You're already a member" opens the app for someone who already pays.
  "src/app/start/StartBridge.tsx",
  "src/components/AppStoreLink.tsx",
  "src/components/ui/AppStoreButton.tsx",
  "src/components/ui/AppStoreCta.tsx",
  "src/components/ui/AppStoreQr.tsx",
  "src/lib/appStore.ts",
  // The click events those buttons send.
  "src/lib/metaPixel.ts",
  "src/lib/posthogAnalytics.ts",
]);

/** An App Store link, button, QR code, URL or Smart App Banner. `AppleLogo` alone is fine (sign-in buttons). */
const APP_STORE_USE = /\b(AppStoreLink|AppStoreCta|AppStoreQr|APP_STORE_URL|APP_STORE_ID|openAppUrl|trackAppStoreClick)\b|import AppStoreButton\b|apps\.apple\.com/;

function sourceFiles(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return sourceFiles(path);
    return /\.(ts|tsx|mdx?)$/.test(name) ? [path] : [];
  });
}

test("only the pages after a purchase link to the App Store", () => {
  const offenders = sourceFiles(SRC)
    .map((path) => relative(ROOT, path))
    .filter((path) => !ALLOWED.has(path))
    .filter((path) => APP_STORE_USE.test(readFileSync(join(ROOT, path), "utf8")));
  assert.deepEqual(offenders, []);
});
