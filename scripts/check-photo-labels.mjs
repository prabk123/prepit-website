#!/usr/bin/env node
/**
 * Checks that photo labels (the amber annotations on lifestyle photos) never
 * cover the page text, each other or the photo's edge (PRE-233).
 *
 * Run it against a running site (`yarn build && yarn start`):
 *
 *   npx -y -p playwright@1 node scripts/check-photo-labels.mjs [base-url]
 *
 * Playwright isn't a dependency of this repo; on a machine without its
 * browsers, run `npx playwright install chromium` once, or point
 * PLAYWRIGHT_CHROMIUM at a Chromium binary. Exits 1 when a label overlaps.
 */
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
let chromium;
try {
  ({ chromium } = require("playwright"));
} catch {
  console.error("Playwright not found. Run: npx -y -p playwright@1 node scripts/check-photo-labels.mjs");
  process.exit(2);
}

const BASE = process.argv[2] ?? "http://localhost:3000";
const WIDTHS = [1024, 1280, 1440, 1920];
// Pages with annotated photos.
const PATHS = ["/", "/features/nutrition-signals", "/features/widgets-and-siri", "/features/ai-nutritionist"];

const browser = await chromium.launch(
  process.env.PLAYWRIGHT_CHROMIUM ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM } : {},
);
let failures = 0;

for (const path of PATHS) {
  for (const width of WIDTHS) {
    // Reduced motion shows the labels in place without the draw-in.
    const page = await browser.newPage({ viewport: { width, height: 900 }, reducedMotion: "reduce" });
    const response = await page.goto(BASE + path, { waitUntil: "networkidle" });
    if (!response?.ok()) {
      console.log(`${path} @${width}: skipped (HTTP ${response?.status()})`);
      await page.close();
      continue;
    }
    const problems = await page.evaluate(() => {
      const PAD = 4;
      const box = (el) => el.getBoundingClientRect();
      const meets = (a, b) =>
        a.left < b.right + PAD && a.right > b.left - PAD && a.top < b.bottom + PAD && a.bottom > b.top - PAD;
      const found = [];
      for (const photo of document.querySelectorAll(".annotated-photo")) {
        const notes = [...photo.querySelectorAll(".photo-annotation")].filter((li) => li.offsetParent);
        if (notes.length === 0) continue;
        const section = photo.closest("section") ?? photo;
        const media = box(photo.querySelector(".annotated-photo__media"));
        const areas = notes.map((li) => {
          const parts = [...li.children].map(box);
          return {
            name: li.textContent.trim(),
            left: Math.min(...parts.map((p) => p.left)),
            right: Math.max(...parts.map((p) => p.right)),
            top: Math.min(...parts.map((p) => p.top)),
            bottom: Math.max(...parts.map((p) => p.bottom)),
          };
        });
        // Every bit of page text in the section that isn't a label.
        const texts = [...section.querySelectorAll("h1,h2,h3,p,li,a,dt,dd,span,b")]
          .filter((el) => !el.closest(".photo-annotation") && el.offsetParent)
          .filter((el) => [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()));
        areas.forEach((area, i) => {
          for (const el of texts) {
            if (meets(area, box(el))) found.push(`"${area.name}" covers "${el.textContent.trim().slice(0, 40)}"`);
          }
          for (const other of areas.slice(i + 1)) {
            if (meets(area, other)) found.push(`"${area.name}" meets "${other.name}"`);
          }
          if (area.left < media.left || area.right > media.right || area.top < media.top || area.bottom > media.bottom) {
            found.push(`"${area.name}" runs off the photo`);
          }
        });
      }
      return found;
    });
    console.log(`${path} @${width}: ${problems.length ? problems.join("; ") : "ok"}`);
    failures += problems.length;
    await page.close();
  }
}

await browser.close();
process.exit(failures ? 1 : 0);
