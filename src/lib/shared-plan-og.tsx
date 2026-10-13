import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import { getMealPlanById } from "@/lib/meal-plan";
import { countRecipes, firstRecipeImage, formatPlanRange } from "@/lib/plan-dates";

export const sharedPlanOgSize = { width: 1200, height: 630 };
export const sharedPlanOgAlt = "A PrepIt meal plan";

// Satori takes plain values, not CSS variables, so these mirror tokens.css.
const tokens = {
  page: "#110f0c",
  surfaceRaised: "#241d18",
  line: "#3a3029",
  ink: "#f7f1e8",
  inkSecondary: "#e0d6c9",
  inkMuted: "#b8ad9f",
  energy: "#f5cc77",
  satiety: "#f38c61",
};

const IMAGE_TIMEOUT_MS = 3000;

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
      const type = src.endsWith(".png") ? "image/png" : "image/jpeg";
      return dataUrl(await readPublic(src.slice(1)), type);
    }
    const response = await fetch(src, { signal: AbortSignal.timeout(IMAGE_TIMEOUT_MS) });
    const type = response.headers.get("content-type")?.split(";")[0] ?? "";
    if (!response.ok || !["image/jpeg", "image/png"].includes(type)) return null;
    return dataUrl(await response.arrayBuffer(), type);
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
  const [clash, logo] = await Promise.all([
    // The preview renderer cannot read variable fonts, so it uses a static
    // weight-600 instance of the site's Clash Display.
    readFile(path.join(process.cwd(), "src/app/fonts/ClashDisplay-Semibold.ttf")),
    readPublic("logo.png"),
  ]);

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
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={dataUrl(logo, "image/png")} width={56} height={56} alt="" />
            <span style={{ fontSize: 40, fontWeight: 600, letterSpacing: "-0.02em" }}>PrepIt</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <span
              style={{
                fontSize: 24,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: tokens.inkMuted,
              }}
            >
              Shared meal plan
            </span>
            <span style={{ fontSize: 92, fontWeight: 600, lineHeight: 1, letterSpacing: "-0.025em" }}>
              {title}
            </span>
            <span style={{ fontSize: 34, color: tokens.inkSecondary }}>{detail}</span>
          </div>

          <span style={{ fontSize: 26, color: tokens.energy }}>Planned by your personal AI nutritionist</span>
        </div>

        <div style={{ width: 470, display: "flex", alignItems: "center", justifyContent: "center", padding: 56 }}>
          {photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={photo}
              width={358}
              height={358}
              alt=""
              style={{ borderRadius: 40, objectFit: "cover", border: `2px solid ${tokens.line}` }}
            />
          ) : (
            <div
              style={{
                width: 358,
                height: 358,
                borderRadius: 40,
                background: tokens.surfaceRaised,
                border: `2px solid ${tokens.line}`,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
              }}
            >
              <span style={{ fontSize: 120, fontWeight: 600, lineHeight: 1, color: tokens.satiety }}>
                {plan ? days : "–"}
              </span>
              <span style={{ fontSize: 30, color: tokens.inkMuted }}>
                {days === 1 ? "day of meals" : "days of meals"}
              </span>
            </div>
          )}
        </div>
      </div>
    ),
    {
      ...sharedPlanOgSize,
      fonts: [{ name: "Clash Display", data: clash, weight: 600, style: "normal" }],
    },
  );
}
