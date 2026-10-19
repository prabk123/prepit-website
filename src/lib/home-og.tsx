import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import sharp from "sharp";
import { AccentRule, dataUrl, loadOgFonts, loadOgLogo, ogCardSize, OgWordmark, ogTokens } from "@/lib/og-card";

// Its own module so sharp is only traced into the routes that draw this card,
// not the dynamic shared meal plan preview, which uses og-card.

export const homeOgAlt =
  "PrepIt, the nutritionist that notices: a phone on a cafe table showing the nutritionist's protein chart";

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
