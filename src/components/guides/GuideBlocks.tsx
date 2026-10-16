import type { ComponentPropsWithoutRef, ReactNode } from "react";
import Link from "next/link";
import DeviceFrame from "@/components/device/DeviceFrame";
import { BentoTile } from "@/components/ui/Bento";
import {
  appCapture,
  appVideo,
  appWidget,
  isAppClip,
  isAppStill,
  isAppWidget,
} from "@/lib/captures";

/*
 * The building blocks guide MDX files can use, on top of plain Markdown.
 * Media names must exist in `public/app`; an unknown name fails the build.
 */

function Figure({ caption, children }: { caption?: string; children: ReactNode }) {
  return (
    <figure className="flex flex-col items-center gap-4">
      {children}
      {caption && (
        <figcaption className="max-w-[30ch] text-center text-small text-ink-muted text-pretty">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

/** One app screen in a phone, from a still or a screen recording. */
export function Shot({ name, alt, caption }: { name: string; alt: string; caption?: string }) {
  let media;
  if (isAppClip(name)) media = { video: appVideo(name, alt) };
  else if (isAppStill(name)) media = { capture: appCapture(name, alt) };
  else throw new Error(`Guide capture "${name}" is not in public/app`);

  return (
    <Figure caption={caption}>
      {/* 400 px on desktop puts the app's 12 pt text at about 11 px, readable without zooming. */}
      <DeviceFrame
        className="[--device-w:260px] sm:[--device-w:340px] lg:[--device-w:400px]"
        {...media}
      />
    </Figure>
  );
}

/**
 * One to three <Shot>s. On desktop the row is wider than the 720 px reading
 * column, so two full-size phones still fit side by side.
 */
export function Shots({ children }: { children: ReactNode }) {
  return (
    <div className="my-12 flex flex-wrap items-start justify-center gap-x-10 gap-y-12 lg:relative lg:left-1/2 lg:w-[min(960px,calc(100vw-2*var(--spacing-gutter)))] lg:-translate-x-1/2">
      {children}
    </div>
  );
}

/**
 * The guide's header capture, repeated under its first steps on phones and
 * tablets, where the header leaves it out. Placed by remarkGuideHero in
 * lib/guides; guide files don't use it directly.
 */
export function GuideHero({ name, alt }: { name: string; alt: string }) {
  return (
    <div className="my-12 lg:hidden">
      <Shot name={name} alt={alt} />
    </div>
  );
}

/** A widget render, as it looks on a dark Home Screen. */
export function Widget({ name, alt, caption }: { name: string; alt: string; caption?: string }) {
  if (!isAppWidget(name)) throw new Error(`Guide widget "${name}" is not in public/app`);
  const widget = appWidget(name);
  // 474 px renders are small widgets; show them at a third of their size.
  const displayWidth = Math.round(widget.width / 3);

  return (
    <Figure caption={caption}>
      <picture>
        <source srcSet={widget.avif} type="image/avif" />
        <img
          src={widget.webp}
          alt={alt}
          width={widget.width}
          height={widget.height}
          loading="lazy"
          decoding="async"
          className="h-auto max-w-full"
          style={{ width: displayWidth }}
        />
      </picture>
    </Figure>
  );
}

/** A group of tips, two to a row on wider screens. */
export function Tips({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <div className="my-12 flex flex-col gap-5">
      {/* A label, not a heading: each tip inside is already an h3. */}
      {title && <p className="text-eyebrow font-medium uppercase text-ink-muted">{title}</p>}
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </div>
  );
}

export function Tip({ title, children }: { title: string; children: ReactNode }) {
  return (
    <BentoTile title={title} className="lg:p-6">
      {children}
    </BentoTile>
  );
}

/** A vague description next to a specific one, from the app's logging primer. */
export function Example({
  title,
  vague,
  vagueNote,
  specific,
  specificNote,
}: {
  title: string;
  vague: string;
  vagueNote: string;
  specific: string;
  specificNote: string;
}) {
  return (
    <div className="flex flex-col gap-4 rounded-tile border border-line bg-surface p-6">
      <h3 className="font-display text-card-title text-ink">{title}</h3>
      <dl className="grid gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1 rounded-2xl bg-page p-4">
          <dt className="text-eyebrow font-medium uppercase text-ink-faint">Vague</dt>
          <dd className="text-body text-ink-secondary">“{vague}”</dd>
          <dd className="text-small text-ink-muted">{vagueNote}</dd>
        </div>
        <div className="flex flex-col gap-1 rounded-2xl border border-accent/40 bg-page p-4">
          <dt className="text-eyebrow font-medium uppercase text-accent-text">Specific</dt>
          <dd className="text-body text-ink">“{specific}”</dd>
          <dd className="text-small text-ink-muted">{specificNote}</dd>
        </div>
      </dl>
    </div>
  );
}

export function Examples({ children }: { children: ReactNode }) {
  return <div className="my-12 flex flex-col gap-4">{children}</div>;
}

/** A short aside, for version requirements and the like. */
export function Note({ children }: { children: ReactNode }) {
  return (
    <p className="my-6 border-l-2 border-accent pl-4 text-body text-ink-muted [&_strong]:text-ink-secondary">
      {children}
    </p>
  );
}

function Anchor({ href = "", children, ...props }: ComponentPropsWithoutRef<"a">) {
  if (href.startsWith("/")) {
    return (
      <Link href={href} className="text-ink underline decoration-accent underline-offset-4 hover:text-accent-text" {...props}>
        {children}
      </Link>
    );
  }
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-ink underline decoration-accent underline-offset-4 hover:text-accent-text"
      {...props}
    >
      {children}
    </a>
  );
}

/**
 * Markdown elements in the D3 type scale. Numbered lists are the guide's
 * steps, so they get orange step numbers.
 */
export const guideMdxComponents = {
  h2: (props: ComponentPropsWithoutRef<"h2">) => (
    <h2 className="mt-16 mb-6 font-display text-title text-ink text-balance first:mt-0" {...props} />
  ),
  h3: (props: ComponentPropsWithoutRef<"h3">) => (
    <h3 className="mt-10 mb-4 font-display text-card-title text-ink" {...props} />
  ),
  p: (props: ComponentPropsWithoutRef<"p">) => (
    <p className="my-5 text-lead text-ink-secondary text-pretty" {...props} />
  ),
  ul: (props: ComponentPropsWithoutRef<"ul">) => (
    <ul
      className="my-6 flex flex-col gap-3 text-lead text-ink-secondary [&>li]:relative [&>li]:pl-6 [&>li]:before:absolute [&>li]:before:left-0 [&>li]:before:top-[0.7em] [&>li]:before:size-1.5 [&>li]:before:rounded-full [&>li]:before:bg-accent"
      {...props}
    />
  ),
  ol: (props: ComponentPropsWithoutRef<"ol">) => (
    <ol
      className="my-8 flex flex-col gap-5 text-lead text-ink-secondary [counter-reset:step] [&>li]:relative [&>li]:min-h-9 [&>li]:pl-14 [&>li]:pt-1 [&>li]:[counter-increment:step] [&>li]:before:absolute [&>li]:before:left-0 [&>li]:before:top-0 [&>li]:before:flex [&>li]:before:size-9 [&>li]:before:items-center [&>li]:before:justify-center [&>li]:before:rounded-full [&>li]:before:border [&>li]:before:border-accent/50 [&>li]:before:font-display [&>li]:before:text-body [&>li]:before:text-accent-text [&>li]:before:content-[counter(step)]"
      {...props}
    />
  ),
  strong: (props: ComponentPropsWithoutRef<"strong">) => (
    <strong className="font-medium text-ink" {...props} />
  ),
  a: Anchor,
  Shot,
  Shots,
  GuideHero,
  Widget,
  Tips,
  Tip,
  Example,
  Examples,
  Note,
};
