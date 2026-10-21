import { ImageResponse } from "next/og";
import { getMealPlanById } from "@/lib/meal-plan";
import { loadOgFonts, loadOgLogo, loadOgPhone, OgPhone, OgWordmark, ogTokens } from "@/lib/og-card";
import { countRecipes, formatPlanRange } from "@/lib/plan-dates";

export const sharedPlanOgSize = { width: 1200, height: 630 };
export const sharedPlanOgAlt = "A PrepIt meal plan";

// The light site's colours (PRE-312), shared with the other preview cards.
const tokens = ogTokens;

/** The link preview for a shared plan: dates and size beside the phone from the meal plans hero. */
export async function renderSharedPlanOg(id: string): Promise<ImageResponse> {
  // A database failure is already logged by the loader; fall back to the
  // generic card rather than no preview at all.
  const plan = await getMealPlanById(id).catch(() => null);
  const [fonts, logo, phone] = await Promise.all([loadOgFonts(), loadOgLogo(), loadOgPhone("meal-plans")]);

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

        <div style={{ width: 400, display: "flex", alignItems: "center", justifyContent: "center", paddingRight: 32 }}>
          <OgPhone screen={phone} />
        </div>
      </div>
    ),
    {
      ...sharedPlanOgSize,
      fonts,
    },
  );
}
