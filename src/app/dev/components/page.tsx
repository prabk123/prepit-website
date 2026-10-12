import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import DeviceFrame, { type DeviceCapture } from "@/components/device/DeviceFrame";
import DevicePair from "@/components/device/DevicePair";

export const metadata: Metadata = {
  title: "Component preview",
  robots: { index: false, follow: false },
};

// Local development and Vercel preview deployments only. Production builds
// return 404, and the page is not in the sitemap.
const previewEnabled =
  process.env.NODE_ENV !== "production" || process.env.VERCEL_ENV === "preview";

const recipeCapture: DeviceCapture = {
  alt: "PrepIt recipe screen with ingredients and preparation steps",
  // Light captures arrive with the simulator capture ticket (PRE-198); the
  // dark one stands in for both until then.
  light: {
    avif: "/dev-preview/capture-recipe.avif",
    webp: "/dev-preview/capture-recipe.webp",
    src: "/dev-preview/capture-recipe.webp",
  },
};

const groceryCapture: DeviceCapture = {
  alt: "PrepIt grocery list grouped by aisle",
  light: {
    avif: "/dev-preview/capture-grocery.avif",
    webp: "/dev-preview/capture-grocery.webp",
    src: "/dev-preview/capture-grocery.webp",
  },
};

const loopVideo = {
  mp4: "/dev-preview/loop.mp4",
  webm: "/dev-preview/loop.webm",
  poster: "/dev-preview/loop-poster.webp",
  width: 540,
  height: 1174,
  label: "PrepIt screens: a recipe, the grocery list and a plan day",
};

const swatches = [
  ["page", "bg-page"],
  ["surface", "bg-surface"],
  ["surface-raised", "bg-surface-raised"],
  ["ink", "bg-ink"],
  ["ink-secondary", "bg-ink-secondary"],
  ["ink-tertiary", "bg-ink-tertiary"],
  ["line", "bg-line"],
  ["line-strong", "bg-line-strong"],
  ["accent", "bg-accent"],
] as const;

function ThemePanels({ children }: { children: (scheme: "light" | "dark") => ReactNode }) {
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      {(["light", "dark"] as const).map((scheme) => (
        <div
          key={scheme}
          data-theme={scheme}
          className="min-w-0 overflow-hidden rounded-3xl border border-line bg-page p-4 text-ink sm:p-8"
        >
          <p className="mb-6 text-xs font-bold uppercase tracking-widest text-ink-secondary">
            {scheme}
          </p>
          {children(scheme)}
        </div>
      ))}
    </div>
  );
}

function Section({ title, note, children }: { title: string; note: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-4">
      <div>
        <h2 className="text-2xl font-semibold" style={{ fontFamily: "var(--font-brand)" }}>
          {title}
        </h2>
        <p className="text-base text-[var(--grey-60)]">{note}</p>
      </div>
      {children}
    </section>
  );
}

export default function ComponentPreviewPage() {
  if (!previewEnabled) notFound();

  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-16 px-4 pb-24 pt-28 lg:px-10">
      <header className="flex flex-col gap-2">
        <p className="text-xs font-bold uppercase tracking-widest text-[var(--grey-60)]">
          Website revamp
        </p>
        <h1 className="text-4xl font-semibold" style={{ fontFamily: "var(--font-brand)" }}>
          Component preview
        </h1>
        <p className="max-w-2xl text-base text-[var(--grey-60)]">
          Every revamp building block in light and dark. Colours are provisional
          (from the app) until the design direction is picked.
        </p>
      </header>

      <Section title="Theme tokens" note="Follow the system setting; forced per panel here.">
        <ThemePanels>
          {() => (
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
              {swatches.map(([name, className]) => (
                <div key={name} className="flex flex-col gap-2">
                  <div className={`h-14 rounded-2xl border border-line ${className}`} />
                  <span className="text-xs text-ink-secondary">{name}</span>
                </div>
              ))}
            </div>
          )}
        </ThemePanels>
      </Section>

      <Section title="DeviceFrame sizes" note="260 px (smallest), 320 px and 420 px with a real capture.">
        <ThemePanels>
          {(scheme) => (
            <div className="flex flex-wrap items-end justify-center gap-8">
              <DeviceFrame width={260} capture={recipeCapture} scheme={scheme} priority />
              <DeviceFrame width={320} capture={groceryCapture} scheme={scheme} />
              <DeviceFrame
                width={420}
                capture={recipeCapture}
                scheme={scheme}
                className="hidden md:block"
              />
            </div>
          )}
        </ThemePanels>
      </Section>

      <Section
        title="DevicePair with tilt"
        note="Two frames, the second overlapping and lower. Sized by classes: 260 px on phones, 320 px from md. Phones show one frame."
      >
        <ThemePanels>
          {(scheme) => (
            <DevicePair className="py-6">
              <DeviceFrame
                tilt={-4}
                capture={groceryCapture}
                scheme={scheme}
                className="[--device-w:260px] md:[--device-w:320px]"
              />
              <DeviceFrame
                tilt={4}
                capture={recipeCapture}
                scheme={scheme}
                className="hidden [--device-w:260px] sm:block md:[--device-w:320px]"
              />
            </DevicePair>
          )}
        </ThemePanels>
      </Section>

      <Section
        title="LoopVideo in a DeviceFrame"
        note="Muted, inline, plays only in view, poster under reduced motion. MP4 and WebM."
      >
        <ThemePanels>
          {() => (
            <div className="flex justify-center">
              <DeviceFrame width={300} video={loopVideo} />
            </div>
          )}
        </ThemePanels>
      </Section>
    </div>
  );
}
