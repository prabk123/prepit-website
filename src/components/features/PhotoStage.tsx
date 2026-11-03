import type { CSSProperties, ReactNode } from "react";
import { V9Photo } from "@/components/landing/v9/V9Photo";
import { DotTag, Glass } from "@/components/landing/v9/V9Sections";

/** A 4:5 still from public/landing/v9 (Charlie's site pages handoff, PRE-450). */
export type StagePhoto = {
  name: string;
  /** Exported widths; the largest is the intrinsic size. */
  widths: number[];
  alt: string;
  /** CSS object-position, where the handoff crops the still. */
  position?: string;
};

/** Height of each 4:5 still at its largest exported width. */
const HEIGHT_PER_WIDTH = 1490 / 1200;

/**
 * A hard-light food still with real app cards lifted over it, as on the
 * homepage: the photo sits in a rounded box offset to one side, and each
 * `Lift` child is placed on top in percentages of the stage. `size="hero"`
 * is the wider overview hero; `feature` is the near-square stage beside a
 * section's copy. `flip` puts the photo's free edge on the left, for a
 * section whose media sits on the left.
 */
export function PhotoStage({
  photo,
  size = "feature",
  flip,
  priority,
  className,
  children,
}: {
  photo: StagePhoto;
  size?: "hero" | "feature";
  flip?: boolean;
  priority?: boolean;
  className?: string;
  children?: ReactNode;
}) {
  const largest = photo.widths[photo.widths.length - 1];
  const box =
    size === "hero"
      ? "aspect-[1100/1000] [--still-inset:0px] min-[900px]:[--still-inset:8%]"
      : "aspect-[1/1.02] max-w-[560px] [--still-inset:12%]";
  const still = flip ? "left-[var(--still-inset)] right-0" : "left-0 right-[var(--still-inset)]";
  return (
    <div className={`relative mx-auto w-full ${box} ${className ?? ""}`}>
      <div className={`absolute inset-y-0 overflow-hidden rounded-[26px] bg-[var(--color-v9-band)] ${size === "hero" ? "left-[var(--still-inset)] right-0" : still}`}>
        <V9Photo
          name={photo.name}
          widths={photo.widths}
          width={largest}
          height={Math.round(largest * HEIGHT_PER_WIDTH)}
          sizes="(min-width: 900px) 560px, 92vw"
          alt={photo.alt}
          priority={priority}
          className="absolute inset-0 h-full w-full object-cover"
          style={photo.position ? { objectPosition: photo.position } : undefined}
        />
      </div>
      {children}
    </div>
  );
}

/**
 * One real app card lifted over a PhotoStage, placed with `style` (left or
 * right, top or bottom, width, in % of the stage), with an optional black
 * dot tag over its top edge ("Energy +34").
 */
export function Lift({ style, tag, className, children }: { style: CSSProperties; tag?: string; className?: string; children: ReactNode }) {
  return (
    <div className={`absolute z-[1] ${className ?? ""}`} style={style}>
      {tag && (
        <span className="absolute -top-3 left-3.5 z-[2]">
          <DotTag pill>{tag}</DotTag>
        </span>
      )}
      <Glass>{children}</Glass>
    </div>
  );
}

/** The app's Log Meal field with a meal typed in and the send arrow, drawn as a picture. */
export function TypedField({ text }: { text: string }) {
  return (
    <div role="img" aria-label={`The Log Meal field with “${text}” typed in`} className="flex items-center gap-2.5 py-1.5 pl-3.5 pr-1.5 text-[14.5px] text-ink">
      <span className="min-w-0 flex-1">
        {text}
        <span aria-hidden className="ml-px inline-block h-[18px] w-[1.5px] translate-y-[3px] bg-ink motion-safe:animate-pulse" />
      </span>
      <span aria-hidden className="grid h-[34px] w-[34px] flex-none place-items-center rounded-full bg-primary font-medium text-on-primary">
        ↑
      </span>
    </div>
  );
}

/** A nutritionist message with its numbered reply options, drawn the way the chat shows them. */
export function MessageCard({ text, options, selected }: { text: string; options: string[]; /** The reply shown as tapped, by index. */ selected?: number }) {
  return (
    <div className="px-3.5 pb-3.5 pt-4">
      <p className="text-[15px] leading-normal text-ink">{text}</p>
      <ol className="mt-3 flex flex-col gap-[7px]" aria-label="Replies to choose from">
        {options.map((option, index) => (
          <li
            key={option}
            className={`flex items-center gap-2.5 rounded-xl border px-3 py-2 text-[13.5px] ${
              index === selected ? "border-primary bg-primary text-on-primary" : "border-line text-ink"
            }`}
          >
            <span
              aria-hidden
              className={`inline-grid h-5 w-5 flex-none place-items-center rounded-full border text-[11px] ${
                index === selected ? "border-white/50" : "border-line-strong"
              }`}
            >
              {index + 1}
            </span>
            {option}
            <span aria-hidden className="ml-auto opacity-50">
              ›
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}
