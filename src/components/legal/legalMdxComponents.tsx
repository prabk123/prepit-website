import type { ComponentPropsWithoutRef } from "react";
import { guideMdxComponents } from "@/components/guides/GuideBlocks";

/*
 * Legal pages use the guides' Markdown styles (headings, links, lists,
 * numbered steps) at body size, since they are long reads, plus tables that
 * scroll inside their own box on phones instead of widening the page.
 */
export const legalMdxComponents = {
  ...guideMdxComponents,
  p: (props: ComponentPropsWithoutRef<"p">) => (
    <p className="my-4 text-body text-ink-secondary text-pretty" {...props} />
  ),
  ul: (props: ComponentPropsWithoutRef<"ul">) => (
    <ul
      className="my-5 flex flex-col gap-2.5 text-body text-ink-secondary [&>li]:relative [&>li]:pl-6 [&>li]:before:absolute [&>li]:before:left-0 [&>li]:before:top-[0.7em] [&>li]:before:size-1.5 [&>li]:before:rounded-full [&>li]:before:bg-accent"
      {...props}
    />
  ),
  ol: (props: ComponentPropsWithoutRef<"ol">) => (
    <ol
      className="my-6 flex flex-col gap-4 text-body text-ink-secondary [counter-reset:step] [&>li]:relative [&>li]:min-h-8 [&>li]:pl-12 [&>li]:pt-1 [&>li]:[counter-increment:step] [&>li]:before:absolute [&>li]:before:left-0 [&>li]:before:top-0 [&>li]:before:flex [&>li]:before:size-8 [&>li]:before:items-center [&>li]:before:justify-center [&>li]:before:rounded-full [&>li]:before:border [&>li]:before:border-accent/50 [&>li]:before:font-display [&>li]:before:text-small [&>li]:before:text-accent-text [&>li]:before:content-[counter(step)]"
      {...props}
    />
  ),
  table: (props: ComponentPropsWithoutRef<"table">) => (
    <div className="my-6 overflow-x-auto rounded-tile border border-line bg-surface" tabIndex={0} role="region" aria-label="Table">
      <table className="w-full border-collapse text-left text-small" {...props} />
    </div>
  ),
  th: (props: ComponentPropsWithoutRef<"th">) => (
    <th
      className="border-b border-line-strong px-4 py-3 align-top font-medium text-ink"
      {...props}
      style={undefined}
    />
  ),
  td: (props: ComponentPropsWithoutRef<"td">) => (
    <td className="border-b border-line px-4 py-3 align-top text-ink-secondary [tr:last-child>&]:border-b-0" {...props} style={undefined} />
  ),
};
