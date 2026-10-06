"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  DAY_AFTER,
  DAY_BEFORE,
  DesignCanvas,
  LogScreen,
} from "@/components/FakeLogScreenDemo";
import { MicrophoneIcon } from "@/components/demoIcons";
import PrepItIcon from "@/components/shareable/PrepItIcon";

const MEAL_TEXT = "chicken wrap, an apple and a flat white";

/**
 * Log-first flow, as in the app: describe the meal, the sheet closes, the Log
 * shows a calculating card, then calories and Energy / Satiety / Mood appear.
 */
type DemoPhase = "typing" | "submitting" | "calculating" | "resolved" | "summary";

const TYPE_MS = 52;
const SUBMIT_HOLD_MS = 580;
const SHEET_DISMISS_MS = 320;
const CALCULATING_MS = 2200;
const RESOLVED_HOLD_MS = 1800;
const SCROLL_MS = 700;
const SUMMARY_HOLD_MS = 3400;
const RESET_MS = 480;

/** iPhone 15/16 logical display (390×844pt). Inner width = 300px frame − 12px border. */
const PHONE_INNER_WIDTH = 288;
const IPHONE_LOGICAL_WIDTH = 390;
const IPHONE_LOGICAL_HEIGHT = 844;
const PHONE_INNER_HEIGHT = Math.round(
  PHONE_INNER_WIDTH * (IPHONE_LOGICAL_HEIGHT / IPHONE_LOGICAL_WIDTH),
);

const dmSans = { fontFamily: "var(--font-dm-sans)" } as const;

function PhoneShell({ children }: { children: ReactNode }) {
  return (
    <div
      className="relative mx-auto w-full max-w-[300px] overflow-hidden rounded-[40px] border-[6px] border-[var(--black-100)] bg-[var(--grey-5)] shadow-[0_24px_48px_rgba(0,0,0,0.12)]"
      aria-hidden="true"
    >
      <div className="absolute left-1/2 top-2 z-20 h-[22px] w-[88px] -translate-x-1/2 rounded-full bg-[var(--black-100)]" />
      <div className="relative overflow-hidden bg-[#F4F4F5]" style={{ height: PHONE_INNER_HEIGHT }}>
        {children}
      </div>
    </div>
  );
}

function ComposerTile({ dark, children }: { dark?: boolean; children: ReactNode }) {
  return (
    <div
      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
        dark ? "bg-black" : "bg-[#F4F4F5]"
      }`}
    >
      {children}
    </div>
  );
}

/** Log Meal sheet in design units: title, helper with Learn more, field, mic / camera or send. */
function LogMealSheet({
  text,
  showCursor,
  sendActive,
  visible,
}: {
  text: string;
  showCursor: boolean;
  sendActive: boolean;
  visible: boolean;
}) {
  const hasText = text.length > 0;

  return (
    <div
      className="absolute inset-x-0 bottom-0 z-10 rounded-t-[24px] bg-white px-4 pb-[46px] pt-2 shadow-[0_-8px_40px_rgba(0,0,0,0.18)]"
      style={{
        transform: visible ? "translateY(0)" : "translateY(105%)",
        transition: `transform ${SHEET_DISMISS_MS}ms cubic-bezier(0.32, 0.72, 0, 1)`,
      }}
    >
      <div className="flex justify-center">
        <div className="h-1 w-10 rounded-full bg-[#D3D3D5]" />
      </div>
      <h3 className="mt-3 text-xl font-semibold leading-[28px] text-black" style={dmSans}>
        Describe your meal
      </h3>
      <p className="mt-1 text-sm leading-5 text-[#7A7A82]" style={dmSans}>
        Amount, brand, and restaurant details help improve accuracy.{" "}
        <span className="underline">Learn more</span>
      </p>
      <div className="mt-4 flex items-end gap-2">
        <div className="flex min-h-12 flex-1 items-center rounded-xl bg-[#F4F4F5] px-4 py-3">
          <p
            className={`text-base leading-6 ${hasText ? "text-black" : "text-[#A6A6AC]"}`}
            style={dmSans}
          >
            {hasText ? text : "What did you eat?"}
            {showCursor && (
              <span className="ml-px inline-block h-4 w-0.5 translate-y-0.5 animate-pulse bg-black" />
            )}
          </p>
        </div>
        {hasText ? (
          <div className={`transition-transform ${sendActive ? "scale-90" : ""}`}>
            <ComposerTile dark>
              <PrepItIcon name="arrowUp" size={20} color="#ffffff" />
            </ComposerTile>
          </div>
        ) : (
          <>
            <ComposerTile>
              <MicrophoneIcon size={20} color="#000000" />
            </ComposerTile>
            <ComposerTile>
              <PrepItIcon name="camera" size={20} color="#000000" />
            </ComposerTile>
          </>
        )}
      </div>
    </div>
  );
}

export default function NlLogFlowPhoneDemo() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  const [phase, setPhase] = useState<DemoPhase>("typing");
  const [typedText, setTypedText] = useState("");
  const [fadeKey, setFadeKey] = useState(0);

  useEffect(() => {
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
  }, []);

  useEffect(() => {
    if (!active) return;

    let cancelled = false;
    let timeout: ReturnType<typeof setTimeout>;

    const wait = (ms: number) =>
      new Promise<void>((resolve) => {
        timeout = setTimeout(() => {
          if (!cancelled) resolve();
        }, ms);
      });

    const runCycle = async () => {
      while (!cancelled) {
        setPhase("typing");
        setTypedText("");
        setFadeKey((k) => k + 1);

        for (let i = 1; i <= MEAL_TEXT.length; i += 1) {
          if (cancelled) return;
          setTypedText(MEAL_TEXT.slice(0, i));
          await wait(TYPE_MS);
        }

        if (cancelled) return;
        setPhase("submitting");
        await wait(SUBMIT_HOLD_MS);

        if (cancelled) return;
        setPhase("calculating");
        await wait(SHEET_DISMISS_MS + CALCULATING_MS);

        if (cancelled) return;
        setPhase("resolved");
        await wait(RESOLVED_HOLD_MS);

        if (cancelled) return;
        setPhase("summary");
        await wait(SCROLL_MS + SUMMARY_HOLD_MS);

        if (cancelled) return;
        await wait(RESET_MS);
      }
    };

    void runCycle();

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [active]);

  const composing = phase === "typing" || phase === "submitting";

  return (
    <div ref={containerRef} className="w-full">
      <PhoneShell>
        <div key={fadeKey} className="nl-demo-fade absolute inset-0">
          <DesignCanvas>
            <LogScreen
              showLunch={!composing}
              lunchResolved={phase === "resolved" || phase === "summary"}
              lunchTypedText={MEAL_TEXT}
              focusLunch={phase === "calculating" || phase === "resolved"}
              day={phase === "summary" ? DAY_AFTER : DAY_BEFORE}
            />
            <div
              className="absolute inset-0 z-[5] bg-black/55"
              style={{
                opacity: composing ? 1 : 0,
                transition: `opacity ${SHEET_DISMISS_MS}ms ease-out`,
              }}
              aria-hidden
            />
            <LogMealSheet
              text={typedText}
              showCursor={phase === "typing"}
              sendActive={phase === "submitting"}
              visible={composing}
            />
          </DesignCanvas>
        </div>
      </PhoneShell>
    </div>
  );
}
