"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import FakeLogScreenDemo from "@/components/FakeLogScreenDemo";
import NlReviewScreenDemo from "@/components/NlReviewScreenDemo";
import PrepItIcon from "@/components/shareable/PrepItIcon";
import PhoneDemoViewport from "@/features/onboarding/components/PhoneDemoViewport";
import { startDemoProgressTracker } from "@/features/onboarding/components/demoProgress";

const MEAL_TEXT = "chicken wrap, an apple and a flat white";

const LOADING_STAGES = [
  "Searching...",
  "Extracting items...",
  "Checking sources...",
  "Finalizing details...",
] as const;

type DemoPhase = "typing" | "submitting" | "loading" | "review";

const TYPE_MS = 52;
const SUBMIT_HOLD_MS = 580;
const LOADING_STAGE_MS = 850;
const REVIEW_HOLD_MS = 5200;
const RESET_MS = 480;
const PUSH_MS = 280;
const ZOOM_MS = 650;
const INPUT_ZOOM_SCALE = 1.85;
const PUSH_EASING = "cubic-bezier(0.32, 0.72, 0, 1)";

/** iPhone 15/16 logical display (390×844pt). Inner width = 300px frame − 12px border. */
const PHONE_INNER_WIDTH = 288;
const IPHONE_LOGICAL_WIDTH = 390;
const IPHONE_LOGICAL_HEIGHT = 844;
const PHONE_INNER_HEIGHT = Math.round(
  PHONE_INNER_WIDTH * (IPHONE_LOGICAL_HEIGHT / IPHONE_LOGICAL_WIDTH),
);

const pushTransition = `transform ${PUSH_MS}ms ${PUSH_EASING}`;

function PhoneShell({ children }: { children: ReactNode }) {
  return (
    <div
      className="relative mx-auto w-full max-w-[300px] overflow-hidden rounded-[40px] border-[6px] border-black bg-[var(--scaffold)] shadow-[0_24px_48px_rgba(0,0,0,0.12)]"
      aria-hidden="true"
    >
      <div className="absolute left-1/2 top-2 z-20 h-[22px] w-[88px] -translate-x-1/2 rounded-full bg-black" />
      <div
        className="relative overflow-hidden bg-[var(--scaffold)]"
        style={{ height: PHONE_INNER_HEIGHT }}
      >
        {children}
      </div>
    </div>
  );
}

function LoadingPill({ message }: { message: string }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full bg-[var(--primary)] px-3 py-2">
      <PrepItIcon name="sparkles" size={16} color="var(--on-primary)" />
      <span className="nl-loading-shimmer text-xs font-medium text-[var(--on-primary)]">{message}</span>
    </div>
  );
}

function InputSheet({
  text,
  showCursor,
  sendActive,
  loadingMessage,
}: {
  text: string;
  showCursor: boolean;
  sendActive?: boolean;
  loadingMessage?: string;
}) {
  return (
    <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col overflow-hidden rounded-t-[24px] bg-[var(--surface)] shadow-[0_-8px_40px_rgba(0,0,0,0.18)]">
      <div className="px-3 pb-3 pt-2">
        <div className="mb-2 flex justify-center">
          <div className="h-1 w-10 rounded-full bg-[var(--border-strong)]" />
        </div>
        <h3 className="text-sm font-semibold leading-5 text-[var(--black-100)]">
          Describe your meal
        </h3>
        <p className="mt-0.5 text-[11px] leading-4 text-[var(--grey-60)]">
          Amount, brand, and restaurant details help improve accuracy.
        </p>
        <div className="mt-2.5 flex items-end gap-1.5">
          <div className="min-h-[36px] flex-1 rounded-xl bg-[var(--input-fill)] px-3 py-2">
            <p className="min-h-[20px] text-xs leading-4 text-[var(--black-100)]">
              {text}
              {showCursor && (
                <span className="ml-px inline-block h-3 w-0.5 translate-y-0.5 animate-pulse bg-[var(--black-100)]" />
              )}
            </p>
          </div>
          <div
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[var(--primary)] transition-transform ${
              sendActive ? "scale-95" : ""
            }`}
          >
            <PrepItIcon name="arrowUp" size={16} color="var(--on-primary)" />
          </div>
        </div>
        {loadingMessage && (
          <div className="mt-4 flex justify-center">
            <LoadingPill message={loadingMessage} />
          </div>
        )}
      </div>
    </div>
  );
}

const CYCLE_MS =
  350 +
  ZOOM_MS +
  MEAL_TEXT.length * TYPE_MS +
  SUBMIT_HOLD_MS +
  LOADING_STAGES.length * LOADING_STAGE_MS +
  REVIEW_HOLD_MS +
  RESET_MS;

export default function NlLogFlowPhoneDemo({
  fit = false,
  onProgressChanged,
}: {
  fit?: boolean;
  onProgressChanged?: (progress: number) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(fit);
  const [phase, setPhase] = useState<DemoPhase>("typing");
  const [typedText, setTypedText] = useState("");
  const [loadingStage, setLoadingStage] = useState(0);
  const [fadeKey, setFadeKey] = useState(0);
  const [reviewSlideIn, setReviewSlideIn] = useState(false);
  const [inputFlowVisible, setInputFlowVisible] = useState(true);
  const [inputZoomed, setInputZoomed] = useState(false);

  const reviewOpen = phase === "review";

  useEffect(() => {
    if (fit) {
      setActive(true);
      return;
    }
    const node = containerRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setActive(entry.isIntersecting);
      },
      { threshold: 0.25, rootMargin: "0px 0px -8% 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [fit]);

  useEffect(() => {
    if (phase === "review") {
      setReviewSlideIn(false);
      setInputFlowVisible(true);

      let slideFrame = 0;
      const startFrame = requestAnimationFrame(() => {
        slideFrame = requestAnimationFrame(() => {
          setReviewSlideIn(true);
        });
      });

      const hideInputTimer = setTimeout(() => {
        setInputFlowVisible(false);
      }, PUSH_MS);

      return () => {
        cancelAnimationFrame(startFrame);
        cancelAnimationFrame(slideFrame);
        clearTimeout(hideInputTimer);
      };
    }

    setReviewSlideIn(false);
    setInputFlowVisible(true);
    return undefined;
  }, [phase]);

  useEffect(() => {
    if (!active) return;

    let cancelled = false;
    let timeout: ReturnType<typeof setTimeout>;
    let stopProgress = () => {};

    const wait = (ms: number) =>
      new Promise<void>((resolve) => {
        timeout = setTimeout(() => {
          if (!cancelled) resolve();
        }, ms);
      });

    const runCycle = async () => {
      while (!cancelled) {
        stopProgress();
        stopProgress = startDemoProgressTracker(CYCLE_MS, onProgressChanged);
        setPhase("typing");
        setTypedText("");
        setLoadingStage(0);
        setInputZoomed(false);
        setFadeKey((k) => k + 1);
        await wait(350);
        if (cancelled) return;
        setInputZoomed(true);
        await wait(ZOOM_MS);

        for (let i = 1; i <= MEAL_TEXT.length; i += 1) {
          if (cancelled) return;
          setTypedText(MEAL_TEXT.slice(0, i));
          await wait(TYPE_MS);
        }

        if (cancelled) return;
        setPhase("submitting");
        await wait(SUBMIT_HOLD_MS);

        if (cancelled) return;
        setPhase("loading");
        const zoomOutAfter = Math.floor(LOADING_STAGES.length / 2);
        for (let stage = 0; stage < LOADING_STAGES.length; stage += 1) {
          if (cancelled) return;
          if (stage === zoomOutAfter) setInputZoomed(false);
          setLoadingStage(stage);
          await wait(LOADING_STAGE_MS);
        }

        if (cancelled) return;
        setPhase("review");
        await wait(REVIEW_HOLD_MS);

        if (cancelled) return;
        await wait(RESET_MS);
      }
    };

    void runCycle();

    return () => {
      cancelled = true;
      stopProgress();
      clearTimeout(timeout);
    };
  }, [active, onProgressChanged]);

  const screen = (
    <div key={fadeKey} className="nl-demo-fade relative h-full overflow-hidden">
      <div
        className="relative h-full will-change-transform"
        style={{
          transition: pushTransition,
          transform: reviewSlideIn ? "translateX(-30%)" : "translateX(0)",
        }}
      >
        <FakeLogScreenDemo />
        {inputFlowVisible && (
          <>
            <div className="absolute inset-0 z-[1] bg-black/60" aria-hidden />
            <InputSheet
              text={typedText}
              showCursor={phase === "typing"}
              sendActive={phase === "submitting"}
              loadingMessage={
                phase === "loading" ? LOADING_STAGES[loadingStage] : undefined
              }
            />
          </>
        )}
      </div>
      <div
        className="absolute inset-0 z-20 bg-[var(--scaffold)] shadow-[-4px_0_16px_rgba(0,0,0,0.12)] will-change-transform"
        style={{
          transition: pushTransition,
          transform: reviewSlideIn ? "translateX(0)" : "translateX(100%)",
          visibility: reviewOpen ? "visible" : "hidden",
          pointerEvents: reviewOpen ? "auto" : "none",
        }}
      >
        {reviewOpen && <NlReviewScreenDemo />}
      </div>
    </div>
  );

  if (fit) {
    return (
      <div ref={containerRef} className="h-full w-full min-h-0">
        <PhoneDemoViewport
          zoom={inputZoomed ? INPUT_ZOOM_SCALE : 1}
          zoomOrigin="bottom"
        >
          {screen}
        </PhoneDemoViewport>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="w-full">
      <PhoneShell>{screen}</PhoneShell>
    </div>
  );
}
