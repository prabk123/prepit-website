import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";

export const ogCardSize = { width: 1200, height: 630 };

// Satori takes plain values, not CSS variables, so these mirror tokens.css.
const tokens = {
  page: "#110f0c",
  ink: "#f7f1e8",
  inkSecondary: "#e0d6c9",
  inkMuted: "#b8ad9f",
  energy: "#f5cc77",
  satiety: "#f38c61",
  mood: "#809ff9",
};

/**
 * The site's link preview card (guides and feature pages): the PrepIt mark,
 * an eyebrow, a title and a summary on the warm dark page.
 */
export async function renderOgCard({
  eyebrow,
  title,
  summary,
}: {
  eyebrow: string;
  title: string;
  summary: string;
}): Promise<ImageResponse> {
  const [clash, logo] = await Promise.all([
    // The preview renderer cannot read variable fonts, so it uses a static
    // weight-600 instance of the site's Clash Display.
    readFile(path.join(process.cwd(), "src/app/fonts/ClashDisplay-Semibold.ttf")),
    readFile(path.join(process.cwd(), "public/logo.png")),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          background: tokens.page,
          fontFamily: "Clash Display",
          color: tokens.ink,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`data:image/png;base64,${logo.toString("base64")}`}
            width={56}
            height={56}
            alt=""
          />
          <span style={{ fontSize: 40, fontWeight: 600, letterSpacing: "-0.02em" }}>PrepIt</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: 1000 }}>
          <span
            style={{
              fontSize: 24,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: tokens.inkMuted,
            }}
          >
            {eyebrow}
          </span>
          <span style={{ fontSize: 84, fontWeight: 600, lineHeight: 1, letterSpacing: "-0.025em" }}>
            {title}
          </span>
          <span style={{ fontSize: 32, lineHeight: 1.3, color: tokens.inkSecondary }}>{summary}</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          {[tokens.energy, tokens.satiety, tokens.mood].map((colour) => (
            <div
              key={colour}
              style={{ width: 22, height: 22, borderRadius: 11, border: `5px solid ${colour}` }}
            />
          ))}
          <span style={{ fontSize: 26, color: tokens.energy, marginLeft: 8 }}>
            Your personal AI nutritionist
          </span>
        </div>
      </div>
    ),
    {
      ...ogCardSize,
      fonts: [{ name: "Clash Display", data: clash, weight: 600, style: "normal" }],
    },
  );
}
