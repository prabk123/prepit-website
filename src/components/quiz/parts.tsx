import Image from "next/image";
import type { ReactNode } from "react";
import type { Option } from "@/lib/quiz/quiz";

/**
 * The quiz's building blocks (PRE-322; v9.2 cream ground, PRE-441), drawn
 * with the site's tokens: the app's 56 px answer buttons with 16 px corners,
 * light cards on the page, the nutritionist's notes under the AI label, and
 * real app screens.
 */

export const REAL_SCREENS = "Real app screens from an example account.";
export const ESTIMATES = "Estimates, not a medical measurement.";
const NUDGE_TAG = "After a few weeks";

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="-mb-2 text-eyebrow font-medium uppercase tracking-[0.12em]">
      <span className="text-gradient-brand">{children}</span>
    </p>
  );
}

/** The screen's question; focused on each new screen so screen readers start there. */
export function Question({ children, id }: { children: ReactNode; id?: string }) {
  return (
    <h1
      id={id}
      tabIndex={-1}
      data-quiz-heading=""
      className="font-display text-[30px] font-medium leading-[1.1] tracking-[-0.015em] text-balance min-[900px]:text-[40px] text-ink [word-spacing:var(--word-spacing-display)] outline-none"
    >
      {children}
    </h1>
  );
}

export function Sub({ children }: { children: ReactNode }) {
  return <p className="-mt-2 text-[16px] leading-[1.45] text-ink-secondary">{children}</p>;
}

const TICK = (
  <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden>
    <path d="M4 8.5l2.5 2.5L12 5.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/** One answer: a single choice, or a ticked row when several can be picked. */
export function OptionButton({
  option,
  selected,
  multi,
  onClick,
}: {
  option: Option;
  selected: boolean;
  multi?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`flex min-h-14 w-full items-center gap-3 rounded-button border px-4 py-3.5 text-left text-[16px] font-medium leading-[1.3] text-ink transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus ${
        selected ? "border-primary bg-surface-raised" : "border-line-strong bg-surface hover:border-ink-faint"
      }`}
    >
      <span className="min-w-0">
        {option.label ?? option.value}
        {option.detail && <small className="mt-0.5 block text-small font-normal text-ink-muted">{option.detail}</small>}
      </span>
      {multi && (
        <span
          className={`ml-auto grid size-[22px] flex-none place-items-center rounded-[7px] border-[1.5px] ${
            selected ? "border-primary bg-primary text-on-primary" : "border-line-strong text-transparent"
          }`}
        >
          {TICK}
        </span>
      )}
    </button>
  );
}

export function Options({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div role="group" aria-label={label} className="flex flex-col gap-2">
      {children}
    </div>
  );
}

export function Chip({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`rounded-control border px-3.5 py-2 text-[15px] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus ${
        selected ? "border-primary bg-primary text-on-primary" : "border-line-strong bg-surface text-ink hover:border-ink-faint"
      }`}
    >
      {children}
    </button>
  );
}

/** The nutritionist's reply to an answer: a card with the accent dot. Announced when it changes. */
export function ReplyCard({ children }: { children: ReactNode }) {
  return (
    <div
      role="status"
      className="flex gap-2.5 rounded-button border border-line bg-surface px-3.5 py-3 text-[15px] leading-[1.45] text-ink"
    >
      <span aria-hidden className="mt-[7px] size-2 flex-none rounded-full bg-accent shadow-[0_0_0_4px_rgb(255_100_79/0.18)]" />
      <div className="min-w-0">{children}</div>
    </div>
  );
}

/** A plain eyebrow that mirrors the answer, e.g. "You said · Lose fat". */
export function Said({ children }: { children: ReactNode }) {
  return <p className="-mb-2 text-[12px] font-bold uppercase leading-[1.2] tracking-[0.12em] text-ink-muted">{children}</p>;
}

/** The AI label: the brand gradient is kept for the nutritionist alone. */
export function AiLabel({ children = "Your AI nutritionist" }: { children?: ReactNode }) {
  return (
    <p className="text-[12px] font-bold uppercase leading-[1.2] tracking-[0.12em]">
      <span className="text-gradient-brand">{children}</span>
    </p>
  );
}

/** The nutritionist's line on a reply, in the first person, with an optional study behind "Source". */
export function Note({ say, source }: { say: string; source?: string }) {
  return (
    <div className="flex flex-col gap-2 rounded-[20px] border border-line bg-surface px-[18px] py-4">
      <AiLabel />
      <p className="text-[17px] leading-[1.5] text-pretty text-ink">{say}</p>
      {source && (
        <details className="text-[13px] text-ink-muted">
          <summary className="w-fit cursor-pointer list-none underline underline-offset-[3px] [&::-webkit-details-marker]:hidden">Source</summary>
          <p className="mt-1.5 leading-[1.45]">{source}</p>
        </details>
      )}
    </div>
  );
}

/** A short line from the nutritionist inside a question screen (metabolism, Mostly sitting, safety, goal weight). */
export function InlineReply({ children, ai = true }: { children: ReactNode; ai?: boolean }) {
  return (
    <div role="status" className="quiz-fade flex flex-col gap-1 rounded-[14px] border border-line bg-surface px-3.5 py-3">
      {ai && <AiLabel />}
      <p className="text-[14px] leading-[1.45] text-ink">{children}</p>
    </div>
  );
}

/** The one fine-print line under Continue on a reply. */
export function FinePrint({ children }: { children: ReactNode }) {
  return <p className="mt-2 text-center text-[11.5px] leading-[1.4] text-ink-muted min-[900px]:max-w-[520px] min-[900px]:text-left">{children}</p>;
}

export function Caption({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <p className={`text-center text-[12.5px] leading-[1.4] text-ink-faint ${className}`}>{children}</p>;
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-[24px] border border-line bg-surface p-[18px] ${className}`}>{children}</div>;
}

export function CardTitle({ children }: { children: ReactNode }) {
  return (
    <h2 className="mb-1.5 font-display text-[21px] font-medium leading-[1.2] text-ink [word-spacing:var(--word-spacing-display)]">
      {children}
    </h2>
  );
}

export function Tag({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-control bg-ink px-2.5 py-[3px] text-[11px] font-semibold uppercase tracking-[0.06em] text-on-primary">
      {children}
    </span>
  );
}

/** A small phone around a full app capture, for strips and single screens. */
export function MiniPhone({ name, alt, className = "" }: { name: string; alt: string; className?: string }) {
  return (
    <div className={`rounded-[30px] bg-device-bezel p-[5px] shadow-[0_26px_40px_-22px_rgb(26_26_46/0.45)] ${className}`}>
      <picture>
        <source srcSet={`/app/${name}-light@1x.avif 1x, /app/${name}-light@2x.avif 2x`} type="image/avif" />
        <img
          src={`/app/${name}-light@2x.webp`}
          alt={alt}
          width={402}
          height={874}
          loading="lazy"
          decoding="async"
          className="block aspect-[402/874] w-full rounded-[25px] bg-surface object-cover object-top"
        />
      </picture>
    </div>
  );
}

/** A cut-out screen with a caption, for the plans reply. */
export function Shot({
  src,
  alt,
  width,
  height,
  caption,
  tag,
  className = "",
}: {
  src: string;
  alt: string;
  width: number;
  height: number;
  caption?: string;
  tag?: boolean;
  className?: string;
}) {
  return (
    <figure className={`relative flex flex-col overflow-hidden rounded-[14px] border border-line bg-page ${className}`}>
      {tag && (
        <span className="mb-0.5 ml-3 mt-2.5 self-start">
          <Tag>{NUDGE_TAG}</Tag>
        </span>
      )}
      <Image src={src} alt={alt} width={width} height={height} sizes="260px" className="block h-auto w-full" />
      {caption && (
        <figcaption className="mt-auto border-t border-line bg-surface px-3 pb-2.5 pt-2 text-[13px] font-semibold text-ink">{caption}</figcaption>
      )}
    </figure>
  );
}

export type TimelineItem = { when: string; what: string; how: string; state?: "now" | "pay" };

export function Timeline({ items }: { items: TimelineItem[] }) {
  return (
    <ol className="m-0 flex list-none flex-col p-0">
      {items.map((item, index) => (
        <li key={item.what} className="relative grid grid-cols-[22px_minmax(0,1fr)] gap-3 pb-4">
          {index < items.length - 1 && <span aria-hidden className="absolute bottom-0 left-[10px] top-5 w-0.5 bg-line" />}
          <span
            aria-hidden
            className={`mt-px size-[22px] rounded-full border-2 ${
              item.state === "now" ? "border-primary bg-primary" : item.state === "pay" ? "border-accent bg-surface" : "border-line-strong bg-surface"
            }`}
          />
          <div>
            <div className="text-[12px] uppercase tracking-[0.06em] text-ink-faint">{item.when}</div>
            <div className="text-[15.5px] font-semibold text-ink">{item.what}</div>
            <div className="text-small text-ink-secondary">{item.how}</div>
          </div>
        </li>
      ))}
    </ol>
  );
}

/** The app's macro colours (Calories, Protein, Carbs, Fat). */
const TILE_COLOURS = { calories: "#FF644F", protein: "#0074E8", carbs: "#E800C9", fats: "#E88B00" } as const;

export function TargetTiles({
  targets,
  proteinFirst,
}: {
  targets: { calories: number; protein: number; carbs: number; fats: number };
  proteinFirst?: boolean;
}) {
  const tiles: [keyof typeof TILE_COLOURS, string, string, string][] = [
    ["calories", "Calories", targets.calories.toLocaleString("en-US"), "kcal"],
    ["protein", "Protein", String(targets.protein), "g"],
    ["carbs", "Carbs", String(targets.carbs), "g"],
    ["fats", "Fat", String(targets.fats), "g"],
  ];
  if (proteinFirst) tiles.splice(0, 2, tiles[1], tiles[0]);
  return (
    <dl className="mt-2.5 grid grid-cols-4 gap-1.5 text-center">
      {tiles.map(([key, label, value, unit]) => (
        <div key={key} className="flex flex-col-reverse rounded-[14px] bg-page px-1 py-2.5">
          <dt className="text-[11.5px] text-ink-muted">
            {label} ({unit})
            <i aria-hidden className="mx-auto mt-1 block h-[3px] w-4 rounded-sm" style={{ background: TILE_COLOURS[key] }} />
          </dt>
          <dd className="m-0 font-display text-[20px] font-medium tabular-nums text-ink">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

export const QUIZ_BUTTON_CLASS =
  "flex h-14 w-full items-center justify-center gap-2 rounded-button bg-primary px-6 text-[17px] font-semibold text-on-primary transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus disabled:cursor-not-allowed disabled:bg-[#c9c9cf] disabled:opacity-100";

export const QUIZ_GHOST_BUTTON_CLASS =
  "flex h-14 w-full items-center justify-center gap-2 rounded-button border border-line-strong bg-transparent px-6 text-[17px] font-semibold text-ink transition-colors hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus";

export const INPUT_CLASS =
  "h-14 w-full rounded-button border border-line-strong bg-surface px-4 text-[17px] font-medium text-ink placeholder:text-ink-faint focus:outline-2 focus:outline-offset-0 focus:outline-primary";

export function FieldLabel({ htmlFor, children }: { htmlFor?: string; children: ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block text-[13px] text-ink-muted">
      {children}
    </label>
  );
}

/** A number field with its unit inside it. */
export function UnitField({
  id,
  value,
  unit,
  label,
  decimal,
  onChange,
}: {
  id: string;
  value: string;
  unit: string;
  label: string;
  decimal?: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <span className="relative block min-w-0 flex-1">
      <input
        id={id}
        className={`${INPUT_CLASS} pr-11`}
        inputMode={decimal ? "decimal" : "numeric"}
        aria-label={label}
        value={value}
        onChange={(event) => onChange(event.target.value.replace(decimal ? /[^\d.]/g : /\D/g, "").slice(0, 6))}
      />
      <span aria-hidden className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[15px] text-ink-muted">
        {unit}
      </span>
    </span>
  );
}
