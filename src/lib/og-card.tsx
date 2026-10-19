import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import type { CardThumb } from "@/lib/captures";
import type { FeatureSlug } from "@/lib/features";

export const ogCardSize = { width: 1200, height: 630 };

// Satori takes plain values, not CSS variables, so these mirror tokens.css.
export const ogTokens = {
  page: "#f4f4f5",
  surface: "#ffffff",
  line: "#e4e4e7",
  lineStrong: "#d4d4d8",
  ink: "#1a1a2e",
  inkSecondary: "#4d4d59",
  inkMuted: "#5c5c68",
  accent: "#ff644f",
  accentText: "#b24637",
};

export function dataUrl(bytes: Buffer, type: string): string {
  return `data:${type};base64,${bytes.toString("base64")}`;
}

/**
 * Clash Display at the light site's calmer headline weight (500) and the
 * semibold wordmark weight (600). The renderer cannot read variable fonts, so
 * both are static instances (scripts/make-og-assets.py makes the 500 one).
 */
export async function loadOgFonts() {
  const [medium, semibold] = await Promise.all([
    readFile(path.join(process.cwd(), "src/app/fonts/ClashDisplay-Medium.ttf")),
    readFile(path.join(process.cwd(), "src/app/fonts/ClashDisplay-Semibold.ttf")),
  ]);
  return [
    { name: "Clash Display", data: medium, weight: 500 as const, style: "normal" as const },
    { name: "Clash Display", data: semibold, weight: 600 as const, style: "normal" as const },
  ];
}

// The long logo (mark and wordmark) from Figma, as in the site header. Its
// viewBox is 923 x 256.
const LONG_LOGO = { width: 923, height: 256 };
const LOGO_HEIGHT = 48;

export async function loadOgLogo(): Promise<string> {
  return dataUrl(await readFile(path.join(process.cwd(), "public/prepit-long-logo.svg")), "image/svg+xml");
}

/** The long PrepIt logo in the card's top left, as in the site header. */
export function OgWordmark({ logo }: { logo: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={logo}
      width={Math.round((LOGO_HEIGHT * LONG_LOGO.width) / LONG_LOGO.height)}
      height={LOGO_HEIGHT}
      alt="PrepIt"
    />
  );
}

/** The short calories-orange rule above an eyebrow, the card's one accent. */
export function AccentRule() {
  return <div style={{ width: 40, height: 6, borderRadius: 3, background: ogTokens.accent }} />;
}

// Satori cannot use container units, so the phone is drawn at one size with
// the site frame's proportions (.device-frame in globals.css): shell 1.1%,
// bezel 2.9%, screen 402 x 874.
const PHONE = { shell: 3, bezel: 8, screenWidth: 252, screenHeight: 548 };

/** The phone screen from a feature's hero (scripts/make-og-assets.py), as a data URL. */
export async function loadOgPhone(feature: FeatureSlug): Promise<string> {
  return dataUrl(await readFile(path.join(process.cwd(), "src/assets/og/phones", `${feature}.jpg`)), "image/jpeg");
}

/** The whole iPhone from a feature's hero, in the site's device frame. */
export function OgPhone({ screen }: { screen: string }) {
  return (
    <div
      style={{
        display: "flex",
        padding: PHONE.shell,
        borderRadius: 47,
        background: "linear-gradient(145deg, #8a8a8f 0%, #3c3c40 18%, #2a2a2d 50%, #3c3c40 82%, #8a8a8f 100%)",
        boxShadow: "0 28px 56px -20px rgba(26,26,46,0.35), 0 10px 20px -10px rgba(26,26,46,0.2)",
      }}
    >
      <div style={{ display: "flex", padding: PHONE.bezel, borderRadius: 44, background: "#050505" }}>
        <div
          style={{
            display: "flex",
            position: "relative",
            width: PHONE.screenWidth,
            height: PHONE.screenHeight,
            borderRadius: 36,
            overflow: "hidden",
            background: "#050505",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={screen} width={PHONE.screenWidth} height={PHONE.screenHeight} alt="" />
          <div
            style={{
              position: "absolute",
              top: 7,
              left: (PHONE.screenWidth - 80) / 2,
              width: 80,
              height: 24,
              borderRadius: 12,
              background: "#050505",
            }}
          />
        </div>
      </div>
    </div>
  );
}

type OgCardMedia =
  /** The telling part of a real app screen (a card thumbnail, the site cards' crop). */
  | { thumb: CardThumb; phone?: never }
  /** The whole phone from that feature's hero. */
  | { phone: FeatureSlug; thumb?: never };

/**
 * The link preview for feature pages, guides and their indexes: the PrepIt
 * mark, an eyebrow, the page's headline and one line on the light page, with
 * a real app screen beside it: a feature's hero phone, or a card thumbnail.
 */
export async function renderOgCard({
  eyebrow,
  title,
  summary,
  thumb,
  phone,
}: {
  eyebrow: string;
  title: string;
  summary: string;
} & OgCardMedia): Promise<ImageResponse> {
  const [fonts, logo, screen] = await Promise.all([
    loadOgFonts(),
    loadOgLogo(),
    phone
      ? loadOgPhone(phone)
      : readFile(path.join(process.cwd(), "src/assets/og/thumbs", `${thumb}.jpg`)).then((bytes) =>
          dataUrl(bytes, "image/jpeg"),
        ),
  ]);
  // Long headlines step down so they stay within two or three lines.
  const titleSize = title.length > 34 ? 52 : title.length > 24 ? 58 : 66;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: ogTokens.page,
          fontFamily: "Clash Display",
          color: ogTokens.ink,
        }}
      >
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "60px 40px 60px 72px",
          }}
        >
          <OgWordmark logo={logo} />
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <AccentRule />
              <span
                style={{
                  fontSize: 22,
                  fontWeight: 500,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: ogTokens.inkMuted,
                }}
              >
                {eyebrow}
              </span>
            </div>
            <span
              style={{
                fontSize: titleSize,
                fontWeight: 500,
                lineHeight: 1.06,
                letterSpacing: "-0.01em",
                wordSpacing: "0.08em",
              }}
            >
              {title}
            </span>
            <span
              style={{
                display: "block",
                fontSize: 26,
                fontWeight: 500,
                lineHeight: 1.3,
                color: ogTokens.inkSecondary,
                lineClamp: 3,
              }}
            >
              {summary}
            </span>
          </div>
          <span style={{ fontSize: 24, fontWeight: 500, color: ogTokens.inkMuted }}>The nutritionist that notices.</span>
        </div>

        {phone ? (
          <div style={{ width: 400, display: "flex", alignItems: "center", justifyContent: "center", paddingRight: 32 }}>
            <OgPhone screen={screen} />
          </div>
        ) : (
          <div style={{ width: 500, display: "flex", alignItems: "center", paddingRight: 64 }}>
            <div
              style={{
                display: "flex",
                padding: 10,
                borderRadius: 32,
                background: ogTokens.surface,
                border: `1px solid ${ogTokens.line}`,
                boxShadow: "0 24px 60px rgba(26,26,46,0.12)",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={screen} width={416} height={259} alt="" style={{ borderRadius: 24, objectFit: "cover" }} />
            </div>
          </div>
        )}
      </div>
    ),
    { ...ogCardSize, fonts },
  );
}
