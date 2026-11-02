"use client";

import { useEffect, useRef, useState } from "react";
import { V9Photo } from "@/components/landing/v9/V9Photo";

/** The six cards, most likely reason first (Charlie's plain lines, 30 Oct). */
const CARDS = [
  { tag: "Log Meal", line: "For anyone tired of counting calories.", photo: "who-log-meal", alt: "A half-eaten roast chicken dinner, with a switched-off kitchen scale pushed to one side." },
  { tag: "Energy", line: "For the 3pm energy crash.", photo: "who-energy", alt: "A half-eaten sandwich in its paper, an empty cup, a notebook and pen on a desk in low afternoon light." },
  { tag: "Weekly Check-in", line: "For sticking with it this time.", photo: "who-check-in", alt: "A nearly finished yogurt bowl and a half-drunk coffee beside a notepad with three weeks of pencil tallies." },
  { tag: "Meal plan", line: "For more protein from real food.", photo: "who-meal-plan", alt: "A glass lunch box of chicken, rice, broccoli and spinach, partly eaten, beside worn lifting straps and a water bottle." },
  { tag: "Ask Nutritionist", line: "For eating out without the guesswork.", photo: "who-ask", alt: "A restaurant table from above: a paper menu, water with lemon, grilled fish and a salad already started." },
  { tag: "Apple Health", line: "For tracking your workouts but not your food.", photo: "who-apple-health", alt: "A black sports watch beside a half-eaten plate of eggs on toast." },
] as const;

const TICKER = [
  "For “what’s for dinner?” every night.",
  "For feeling hungry an hour after eating.",
  "For weekends that undo your week.",
  "For night shifts and odd hours.",
  "For eating well as you get older.",
  "For busy weeks with no time to plan.",
];

function ArrowIcon({ back }: { back?: boolean }) {
  return (
    <svg viewBox="0 0 16 16" className={`h-4 w-4 ${back ? "rotate-180" : ""}`} aria-hidden>
      <path d="M3 8h10M9 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function TickerLine({ hidden }: { hidden?: boolean }) {
  return (
    <ul aria-hidden={hidden} className="flex shrink-0 items-center">
      {TICKER.map((line) => (
        <li key={line} className="flex items-center whitespace-nowrap font-display text-[clamp(20px,17px+0.8vw,26px)] leading-none text-ink-secondary">
          <span aria-hidden className="mx-6 h-1.5 w-1.5 rounded-full bg-accent" />
          {line}
        </li>
      ))}
    </ul>
  );
}

/**
 * "Who it's for": a swipeable row of six photo cards, with a progress line
 * and previous and next buttons, then a slow ticker of six more reasons.
 */
export default function WhoItsFor() {
  const trackRef = useRef<HTMLOListElement>(null);
  const [progress, setProgress] = useState({ start: 0, size: 1, atStart: true, atEnd: false });

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const update = () => {
      const max = track.scrollWidth - track.clientWidth;
      setProgress({
        start: max > 0 ? track.scrollLeft / track.scrollWidth : 0,
        size: track.scrollWidth > 0 ? track.clientWidth / track.scrollWidth : 1,
        atStart: track.scrollLeft <= 4,
        atEnd: track.scrollLeft >= max - 4,
      });
    };
    update();
    track.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      track.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  const step = (direction: 1 | -1) => {
    const track = trackRef.current;
    const card = track?.firstElementChild as HTMLElement | null;
    if (!track || !card) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    track.scrollBy({ left: direction * (card.offsetWidth + 12), behavior: reduce ? "auto" : "smooth" });
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="mx-auto w-full max-w-content px-gutter">
        <ol
          ref={trackRef}
          tabIndex={0}
          aria-label="Who it’s for"
          className="v9-carousel -mx-gutter flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-px-gutter px-gutter focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus"
        >
          {CARDS.map((card) => (
            <li
              key={card.tag}
              className="relative aspect-[4/5] w-[72vw] max-w-[340px] shrink-0 snap-start overflow-hidden rounded-[20px] bg-[#2a2520] text-white min-[900px]:w-[calc((100%-24px)/3)] min-[900px]:max-w-none"
            >
              <V9Photo
                name={card.photo}
                widths={[560, 880]}
                width={880}
                height={1093}
                sizes="(min-width: 900px) 380px, 72vw"
                alt={card.alt}
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div aria-hidden className="absolute inset-0 bg-[linear-gradient(180deg,rgb(0_0_0/0.22)_0%,rgb(0_0_0/0)_24%,rgb(0_0_0/0)_52%,rgb(0_0_0/0.62)_100%)]" />
              <span className="absolute left-3.5 top-3.5 inline-flex items-center gap-[7px] rounded-full border border-white/25 bg-white/15 px-[11px] py-2 text-[12.5px] font-medium leading-none backdrop-blur-md">
                <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-accent" />
                {card.tag}
              </span>
              <p className="absolute inset-x-5 bottom-5 font-display text-[clamp(22px,19px+0.8vw,28px)] leading-[1.12] text-balance">
                {card.line}
              </p>
            </li>
          ))}
        </ol>
        <div className="mt-6 flex items-center gap-4">
          <div aria-hidden className="relative h-0.5 flex-1 overflow-hidden rounded-full bg-line-strong">
            <i
              className="absolute inset-y-0 rounded-full bg-ink"
              style={{ left: `${progress.start * 100}%`, width: `${progress.size * 100}%` }}
            />
          </div>
          <button
            type="button"
            aria-label="Previous"
            disabled={progress.atStart}
            onClick={() => step(-1)}
            className="grid h-11 w-11 place-items-center rounded-full border border-line-strong text-ink transition-opacity disabled:opacity-35 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus"
          >
            <ArrowIcon back />
          </button>
          <button
            type="button"
            aria-label="Next"
            disabled={progress.atEnd}
            onClick={() => step(1)}
            className="grid h-11 w-11 place-items-center rounded-full bg-primary text-on-primary transition-opacity disabled:opacity-35 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus"
          >
            <ArrowIcon />
          </button>
        </div>
      </div>

      <div className="v9-ticker-wrap overflow-hidden border-y border-line py-4">
        <div className="v9-ticker">
          <TickerLine />
          <TickerLine hidden />
        </div>
      </div>
    </div>
  );
}
