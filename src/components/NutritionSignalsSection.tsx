"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import NutritionSignalsVisual from "@/components/NutritionSignalsVisual";
import PrepItIcon from "@/components/shareable/PrepItIcon";

const SIGNAL_CARDS = [
  {
    title: "Drive",
    body: "Will you have the energy and focus to get through the day? Built from your meal timing, glycaemic load and how early you front-load calories.",
  },
  {
    title: "Control",
    body: "Will you stay in control around food this afternoon? Driven by protein, fibre, and how processed your meals are.",
  },
  {
    title: "Balance",
    body: "Will you feel steady or on edge? Shaped by food quality, vegetables, alcohol and how deep your deficit runs.",
  },
] as const;

const SCIENCE_POINTS = [
  {
    title: "Drive",
    body: "Meal timing, glycaemic load, and circadian fuel patterns draw on cohort and feeding studies linking intake spread and glucose response to sustained energy and focus.",
  },
  {
    title: "Control",
    body: "Protein, fibre, and energy density reflect meta-analytic evidence on satiety hormones (ghrelin, PYY, GLP-1) and how filling different eating patterns feel in practice.",
  },
  {
    title: "Balance",
    body: "Food quality, produce, alcohol, and calorie adequacy connect to observational research on stress eating, sleep, and emotional stability — without needing a wearable.",
  },
] as const;

function SignalCard({ title, body }: { title: string; body: string }) {
  return (
    <article className="flex flex-col gap-2 border-b border-[var(--grey-10)] pb-6 text-left last:border-b-0 last:pb-0">
      <h3 className="text-base font-semibold leading-snug text-[var(--black-100)] lg:text-lg">
        {title}
      </h3>
      <p className="text-sm leading-relaxed text-[var(--grey-60)] lg:text-base lg:leading-[27px]">
        {body}
      </p>
    </article>
  );
}

function FuelScienceModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      id="fuel-science"
      className="m-auto w-[min(100%-2rem,560px)] max-h-[85vh] overflow-y-auto rounded-2xl border border-[var(--grey-10)] bg-white p-0 shadow-2xl backdrop:bg-black/40"
      onClose={onClose}
    >
      <div className="sticky top-0 flex items-center justify-between border-b border-[var(--grey-10)] bg-white px-6 py-4">
        <h3
          className="text-lg font-semibold text-[var(--black-100)]"
          style={{ fontFamily: "var(--font-brand)" }}
        >
          The science behind Fuel
        </h3>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full p-2 text-[var(--grey-60)] transition-colors hover:bg-[var(--grey-5)] hover:text-[var(--black-100)]"
          aria-label="Close"
        >
          <PrepItIcon name="close" size={18} color="currentColor" />
        </button>
      </div>
      <div className="flex flex-col gap-5 px-6 py-5">
        <p className="text-sm leading-relaxed text-[var(--grey-60)] lg:text-base lg:leading-[27px]">
          PrepIt&apos;s nutrition signals are built from published nutrition research — not vibes.
          Each 0–100 score blends weighted factors from your food log into a forward-looking read
          on how today&apos;s eating is likely to feel.
        </p>
        {SCIENCE_POINTS.map((point) => (
          <div key={point.title} className="flex flex-col gap-1.5">
            <p className="text-sm font-semibold text-[var(--black-100)]">{point.title}</p>
            <p className="text-sm leading-relaxed text-[var(--grey-60)]">{point.body}</p>
          </div>
        ))}
        <p className="text-xs leading-relaxed text-[var(--grey-60)]">
          Signals point to patterns nutrition research has looked at. They aren&apos;t a diagnosis,
          medical advice, or a substitute for professional care.
        </p>
      </div>
    </dialog>
  );
}

export default function NutritionSignalsSection() {
  const [scienceOpen, setScienceOpen] = useState(false);

  const openScience = useCallback(() => setScienceOpen(true), []);
  const closeScience = useCallback(() => setScienceOpen(false), []);

  return (
    <>
      <section
        id="nutrition-signals"
        aria-labelledby="nutrition-signals-heading"
        aria-describedby="nutrition-signals-body"
        className="flex w-full flex-col items-center bg-white px-4 py-16 lg:px-20 lg:py-24"
      >
        <div className="flex w-full max-w-[1200px] flex-col-reverse items-center gap-12 lg:flex-row lg:items-start lg:gap-16">
          <div className="flex min-w-0 flex-1 flex-col gap-8 text-left">
            <div className="flex flex-col gap-4">
              <h2
                id="nutrition-signals-heading"
                className="text-[32px] font-semibold leading-tight tracking-tight text-[var(--black-100)] lg:text-[40px]"
                style={{ fontFamily: "var(--font-brand)" }}
              >
                Calories tell you what you ate. Your nutrition signals tell you how you&apos;ll
                feel.
              </h2>
              <p
                id="nutrition-signals-body"
                className="text-base font-normal leading-relaxed text-[var(--grey-60)] lg:text-lg lg:leading-[27px]"
              >
                Your daily nutrition signals are a 0–100 score built from three things you actually
                care about. It&apos;s forward-looking: not a report card on yesterday, but a read
                on what today&apos;s food is setting you up for. And it needs nothing but your food
                log — no wearable, no CGM.
              </p>
            </div>

            <div className="flex flex-col gap-6">
              {SIGNAL_CARDS.map((card) => (
                <SignalCard key={card.title} title={card.title} body={card.body} />
              ))}
            </div>

            <div className="flex flex-col gap-4">
              <p className="text-base font-semibold leading-relaxed text-[var(--black-100)] lg:text-lg">
                No app connects what you ate to how you&apos;ll feel — in real time, with a
                specific food fix.
              </p>
              <p className="text-sm leading-relaxed text-[var(--grey-60)] lg:text-base">
                Every signal is grounded in published nutrition research, not vibes.{" "}
                <button
                  type="button"
                  onClick={openScience}
                  className="font-medium text-[var(--black-100)] underline decoration-[var(--grey-40)] underline-offset-2 transition-colors hover:decoration-[var(--black-100)]"
                >
                  The science behind Fuel
                </button>
              </p>
            </div>
          </div>

          <div className="flex w-full shrink-0 justify-center lg:sticky lg:top-24 lg:w-[380px]">
            <NutritionSignalsVisual />
          </div>
        </div>
      </section>

      <FuelScienceModal open={scienceOpen} onClose={closeScience} />
    </>
  );
}
