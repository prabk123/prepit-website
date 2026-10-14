import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import LoopVideo from "@/components/media/LoopVideo";
import Section, { type SectionPhoto } from "@/components/ui/Section";
import SectionHeading from "@/components/ui/SectionHeading";
import {
  cookingClip,
  planFlatLays,
  signalsGym,
  textureHoney,
  widgetsDesk,
  type FeaturePhoto,
} from "@/content/featureImagery";

export const metadata: Metadata = {
  title: "Imagery preview",
  robots: { index: false, follow: false },
};

// Same rule as /dev/components: local development and Vercel previews only.
const previewEnabled =
  process.env.NODE_ENV !== "production" || process.env.VERCEL_ENV === "preview";

function Picture({ photo, className }: { photo: SectionPhoto; className?: string }) {
  return (
    <picture>
      {photo.avif && <source srcSet={photo.avif} type="image/avif" />}
      {photo.webp && <source srcSet={photo.webp} type="image/webp" />}
      <img
        src={photo.src}
        alt={photo.alt ?? ""}
        width={photo.width}
        height={photo.height}
        loading="lazy"
        decoding="async"
        className={className}
      />
    </picture>
  );
}

function Label({ children }: { children: ReactNode }) {
  return <p className="mb-8 border-b border-line pb-3 text-small text-ink-faint">{children}</p>;
}

/** The 16:9 photo from 1024 px, the phone crop below it, as a page section would. */
function PhotoSection({
  photo,
  id,
  eyebrow,
  title,
}: {
  photo: FeaturePhoto;
  id: string;
  eyebrow: string;
  title: string;
}) {
  const text = (
    <div className={`max-w-md ${photo.textSide === "end" ? "ml-auto" : ""}`}>
      <SectionHeading eyebrow={eyebrow} title={title} id={id} />
    </div>
  );
  return (
    <>
      <Section tone="photo" photo={photo.desktop} labelledBy={id} className="hidden lg:block">
        <div className="flex min-h-[520px] items-center">{text}</div>
      </Section>
      <Section tone="photo" photo={photo.mobile} className="lg:hidden">
        <div className="flex min-h-[560px] items-end">
          <SectionHeading eyebrow={eyebrow} title={title} />
        </div>
      </Section>
    </>
  );
}

export default function ImageryPreviewPage() {
  if (!previewEnabled) notFound();

  return (
    <div className="bg-page pt-16 text-ink [color-scheme:dark] lg:pt-[72px]">
      <Section labelledBy="imagery-title">
        <SectionHeading
          eyebrow="PRE-199 · dev only"
          title="Imagery preview"
          size="title"
          as="h1"
          id="imagery-title"
          lead="The features page photos, meal flat-lays, background texture and clips, at the sizes pages will use them. The homepage photos are previewed on the homepage."
        />
      </Section>

      <PhotoSection photo={signalsGym} id="gym" eyebrow="Signals" title="Know how your food made you feel." />
      <PhotoSection photo={widgetsDesk} id="desk" eyebrow="Widgets" title="Your day on your home screen." />

      <Section labelledBy="flatlays">
        <Label>Plan flat-lays, 1280 × 720</Label>
        <SectionHeading title="Meals from your plan" size="title" id="flatlays" />
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {Object.entries(planFlatLays).map(([key, photo]) => (
            <Picture key={key} photo={photo} className="h-auto w-full rounded-card" />
          ))}
        </div>
      </Section>

      <section aria-labelledby="texture" className="relative isolate overflow-hidden bg-page">
        <Picture photo={textureHoney} className="absolute inset-0 -z-10 h-full w-full object-cover" />
        <div className="mx-auto w-full max-w-content px-gutter py-section">
          <Label>Honey light texture behind a section with no photo</Label>
          <SectionHeading title="A section on the texture" size="title" id="texture" />
        </div>
      </section>

      <Section labelledBy="cooking">
        <Label>Cooking clip through LoopVideo, 1280 × 720, 8 s, no sound</Label>
        <SectionHeading title="Cooking clip" size="title" id="cooking" />
        <div className="mt-10 overflow-hidden rounded-card">
          <LoopVideo {...cookingClip} className="h-auto w-full" />
        </div>
      </Section>
    </div>
  );
}
