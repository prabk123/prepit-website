import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import sharp from "sharp";
import type { CardThumb } from "@/lib/captures";

export const ogCardSize = { width: 1200, height: 630 };
export const homeOgAlt =
  "PrepIt, the nutritionist that notices: a phone on a cafe table showing the nutritionist's protein chart";

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

function dataUrl(bytes: Buffer, type: string): string {
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

// The long logo (mark and wordmark), 948 x 346.
const LONG_LOGO = { width: 948, height: 346 };
const LOGO_HEIGHT = 56;

export async function loadOgLogo(): Promise<string> {
  return dataUrl(await readFile(path.join(process.cwd(), "public/prepit-long-logo.png")), "image/png");
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
function AccentRule() {
  return <div style={{ width: 40, height: 6, borderRadius: 3, background: ogTokens.accent }} />;
}

/**
 * The site's default link preview (home, research and every page without its
 * own): the homepage hero, "The nutritionist that notices." on the cafe photo
 * whose phone shows the nutritionist's protein chart. Sent as JPEG: as a PNG
 * the photo makes it about 700 KB, over what some messaging apps will preview.
 */
export async function renderHomeOgCard(): Promise<Response> {
  const [fonts, logo, photo] = await Promise.all([
    loadOgFonts(),
    loadOgLogo(),
    readFile(path.join(process.cwd(), "src/assets/og/hero-cafe.jpg")),
  ]);

  const png = new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          background: ogTokens.page,
          fontFamily: "Clash Display",
          color: ogTokens.ink,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={dataUrl(photo, "image/jpeg")}
          width={1200}
          height={630}
          alt=""
          style={{ position: "absolute", top: 0, left: 0, width: 1200, height: 630, objectFit: "cover" }}
        />
        {/* A soft light wash behind the text only, as on the site's hero, so the phone stays as shot. */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: 820,
            height: 630,
            backgroundImage:
              "linear-gradient(90deg, rgba(250,248,245,0.96) 0%, rgba(250,248,245,0.9) 55%, rgba(250,248,245,0) 100%)",
          }}
        />
        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: 700,
            height: "100%",
            padding: "60px 0 60px 72px",
          }}
        >
          <OgWordmark logo={logo} />
          <div style={{ display: "flex", flexDirection: "column", gap: 26 }}>
            <AccentRule />
            <span style={{ fontSize: 80, fontWeight: 500, lineHeight: 1.04, letterSpacing: "-0.01em", wordSpacing: "0.08em" }}>
              The nutritionist that notices.
            </span>
            <span style={{ fontSize: 30, fontWeight: 500, lineHeight: 1.3, color: ogTokens.inkSecondary, maxWidth: 600 }}>
              It spots what&apos;s behind the 3pm slump and tells you what to change first.
            </span>
          </div>
          <span style={{ fontSize: 24, fontWeight: 500, color: ogTokens.inkMuted }}>
            Your AI nutritionist, on iPhone
          </span>
        </div>
      </div>
    ),
    { ...ogCardSize, fonts },
  );
  const jpeg = await sharp(Buffer.from(await png.arrayBuffer()))
    .jpeg({ quality: 86, mozjpeg: true })
    .toBuffer();
  return new Response(new Uint8Array(jpeg), {
    headers: { "Content-Type": "image/jpeg" },
  });
}

/**
 * The link preview for feature pages, guides and their indexes: the PrepIt
 * mark, an eyebrow, the page's headline and one line on the light page, with
 * the telling part of a real app screen beside it (a card thumbnail, the same
 * crop the site's cards use).
 */
export async function renderOgCard({
  eyebrow,
  title,
  summary,
  thumb,
}: {
  eyebrow: string;
  title: string;
  summary: string;
  thumb: CardThumb;
}): Promise<ImageResponse> {
  const [fonts, logo, screen] = await Promise.all([
    loadOgFonts(),
    loadOgLogo(),
    readFile(path.join(process.cwd(), "src/assets/og/thumbs", `${thumb}.jpg`)),
  ]);
  // Long headlines step down so they stay within three lines.
  const titleSize = title.length > 40 ? 58 : 66;

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
            <span style={{ fontSize: 28, fontWeight: 500, lineHeight: 1.3, color: ogTokens.inkSecondary }}>
              {summary}
            </span>
          </div>
          <span style={{ fontSize: 24, fontWeight: 500, color: ogTokens.inkMuted }}>The nutritionist that notices.</span>
        </div>

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
            <img
              src={dataUrl(screen, "image/jpeg")}
              width={416}
              height={259}
              alt=""
              style={{ borderRadius: 24, objectFit: "cover" }}
            />
          </div>
        </div>
      </div>
    ),
    { ...ogCardSize, fonts },
  );
}
