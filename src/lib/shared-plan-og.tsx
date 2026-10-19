import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import { getMealPlanById } from "@/lib/meal-plan";
import { loadOgFonts, loadOgLogo, OgWordmark, ogTokens } from "@/lib/og-card";
import { countRecipes, firstRecipeImage, formatPlanRange } from "@/lib/plan-dates";

export const sharedPlanOgSize = { width: 1200, height: 630 };
export const sharedPlanOgAlt = "A PrepIt meal plan";

// The light site's colours (PRE-312), shared with the other preview cards.
const tokens = ogTokens;

const IMAGE_TIMEOUT_MS = 3000;
// Recipe photos are a few hundred KB; anything far bigger is skipped.
const IMAGE_MAX_BYTES = 5 * 1024 * 1024;

async function readPublic(file: string): Promise<Buffer> {
  return readFile(path.join(process.cwd(), "public", file));
}

function dataUrl(bytes: ArrayBuffer | Buffer, type: string): string {
  return `data:${type};base64,${Buffer.from(bytes as ArrayBuffer).toString("base64")}`;
}

/**
 * The plan's first recipe photo as a data URL, or null. Only JPEG and PNG
 * (what the preview renderer can draw), and never longer than three seconds,
 * so a slow image host still gets a preview without the photo.
 */
async function loadMealPhoto(src: string, planId: string): Promise<string | null> {
  try {
    if (src.startsWith("/")) {
      if (src.includes("..") || !/\.(jpe?g|png)$/i.test(src)) return null;
      const type = src.toLowerCase().endsWith(".png") ? "image/png" : "image/jpeg";
      return dataUrl(await readPublic(src.slice(1)), type);
    }
    const response = await fetch(src, { signal: AbortSignal.timeout(IMAGE_TIMEOUT_MS) });
    const type = response.headers.get("content-type")?.split(";")[0] ?? "";
    const declared = Number(response.headers.get("content-length") ?? 0);
    if (!response.ok || !["image/jpeg", "image/png"].includes(type) || declared > IMAGE_MAX_BYTES) {
      return null;
    }
    const bytes = await response.arrayBuffer();
    if (bytes.byteLength > IMAGE_MAX_BYTES) return null;
    return dataUrl(bytes, type);
  } catch (error) {
    console.warn("[shared-meal-plan] Preview photo skipped", {
      planId,
      error: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
}

/** The link preview for a shared plan: dates, size and a meal photo when there is one. */
export async function renderSharedPlanOg(id: string): Promise<ImageResponse> {
  // A database failure is already logged by the loader; fall back to the
  // generic card rather than no preview at all.
  const plan = await getMealPlanById(id).catch(() => null);
  const [fonts, logo, mark] = await Promise.all([loadOgFonts(), loadOgLogo(), readPublic("logo.png")]);

  const photoSrc = plan ? firstRecipeImage(plan.days) : null;
  const photo = photoSrc ? await loadMealPhoto(photoSrc, id) : null;

  const title = plan ? formatPlanRange(plan.days) : "Meal plan";
  const days = plan?.days.length ?? 0;
  const recipes = plan ? countRecipes(plan.days) : 0;
  const detail = plan
    ? `${days} day${days === 1 ? "" : "s"} · ${recipes} recipe${recipes === 1 ? "" : "s"}`
    : "Made with PrepIt";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: tokens.page,
          fontFamily: "Clash Display",
          color: tokens.ink,
        }}
      >
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "64px 0 64px 72px",
          }}
        >
          <OgWordmark logo={logo} />

          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ width: 40, height: 6, borderRadius: 3, background: tokens.accent }} />
              <span
                style={{
                  fontSize: 22,
                  fontWeight: 500,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: tokens.inkMuted,
                }}
              >
                Shared meal plan
              </span>
            </div>
            <span style={{ fontSize: 84, fontWeight: 500, lineHeight: 1.04, letterSpacing: "-0.01em" }}>
              {title}
            </span>
            <span style={{ fontSize: 32, fontWeight: 500, color: tokens.inkSecondary }}>{detail}</span>
          </div>

          <span style={{ fontSize: 24, fontWeight: 500, color: tokens.inkMuted }}>Planned by your personal AI nutritionist</span>
        </div>

        <div style={{ width: 470, display: "flex", alignItems: "center", justifyContent: "center", padding: 56 }}>
          {photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={photo}
              width={358}
              height={358}
              alt=""
              style={{ borderRadius: 40, objectFit: "cover", border: `1px solid ${tokens.line}` }}
            />
          ) : plan ? (
            <div
              style={{
                width: 358,
                height: 358,
                borderRadius: 40,
                background: tokens.surface,
                border: `1px solid ${tokens.line}`,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
              }}
            >
              <span style={{ fontSize: 120, fontWeight: 500, lineHeight: 1, color: tokens.ink }}>{days}</span>
              <span style={{ fontSize: 30, fontWeight: 500, color: tokens.inkMuted }}>
                {days === 1 ? "day of meals" : "days of meals"}
              </span>
            </div>
          ) : (
            // No plan to describe (not found, or the database failed): the PrepIt mark.
            // eslint-disable-next-line @next/next/no-img-element
            <img src={dataUrl(mark, "image/png")} width={180} height={180} alt="" />
          )}
        </div>
      </div>
    ),
    {
      ...sharedPlanOgSize,
      fonts,
    },
  );
}
