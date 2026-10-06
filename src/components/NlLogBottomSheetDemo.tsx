"use client";

import { MicrophoneIcon } from "@/components/demoIcons";
import PrepItIcon from "@/components/shareable/PrepItIcon";
import { useTypingExamples } from "@/hooks/useTypingExamples";

const EXAMPLES = [
  "chicken wrap, an apple and a flat white",
  "two eggs on toast and a coffee",
  "big bowl of pasta and two glasses of wine",
] as const;

type NlLogBottomSheetDemoProps = {
  overlay?: boolean;
  /** Compact card for the nutrition loop section — same UI, loop column sizing */
  loop?: boolean;
};

export default function NlLogBottomSheetDemo({
  overlay = false,
  loop = false,
}: NlLogBottomSheetDemoProps) {
  const text = useTypingExamples(EXAMPLES);
  const compact = overlay || loop;
  const hasText = text.length > 0;
  const tile = `flex shrink-0 items-center justify-center rounded-xl ${
    loop ? "h-8 w-8" : compact ? "h-10 w-10" : "h-12 w-12"
  }`;
  const iconSize = loop ? 16 : compact ? 20 : 24;

  return (
    <div
      className={`flex h-full flex-col overflow-hidden rounded-2xl border border-[var(--grey-10)] bg-white ${
        loop
          ? "w-full shadow-sm"
          : overlay
            ? "w-full shadow-[0_-4px_24px_rgba(0,0,0,0.12)]"
            : "w-full max-w-[380px] shadow-[0_-4px_24px_rgba(0,0,0,0.12)]"
      }`}
      aria-hidden="true"
    >
      <div
        className={`flex flex-col ${
          loop ? "px-3 pb-3 pt-2" : compact ? "px-3 pb-3 pt-2" : "px-4 pb-4 pt-3"
        }`}
      >
        <div className={`flex justify-center ${compact ? "mb-2" : "mb-3"}`}>
          <div className="h-1 w-10 rounded-full bg-[#D3D3D5]" />
        </div>

        <h3
          className={`font-semibold text-[var(--black-100)] ${
            loop
              ? "text-sm leading-5"
              : compact
                ? "text-base leading-6"
                : "text-xl leading-[30px]"
          }`}
        >
          Describe your meal
        </h3>
        <p
          className={`mt-0.5 text-[var(--grey-60)] ${
            loop
              ? "text-[11px] leading-4"
              : compact
                ? "text-xs leading-4"
                : "text-base leading-6"
          }`}
        >
          Amount, brand, and restaurant details help improve accuracy.{" "}
          <span className="underline">Learn more</span>
        </p>

        <div className={`flex items-end gap-1.5 ${compact ? "mt-2.5" : "mt-6"}`}>
          <div
            className={`min-h-[36px] min-w-0 flex-1 rounded-xl bg-[var(--grey-5)] px-3 py-2 ${
              compact ? "" : "min-h-[48px] px-4 py-3"
            }`}
          >
            <p
              className={`min-h-[20px] ${hasText ? "text-[var(--black-100)]" : "text-[#A6A6AC]"} ${
                loop
                  ? "text-xs leading-4"
                  : compact
                    ? "text-sm leading-5"
                    : "text-base leading-6"
              }`}
            >
              {hasText ? text : "What did you eat?"}
              <span
                className={`ml-px inline-block w-0.5 translate-y-0.5 animate-pulse bg-[var(--black-100)] ${
                  loop ? "h-3" : "h-[14px]"
                }`}
              />
            </p>
          </div>

          {hasText ? (
            <div className={`${tile} bg-[var(--black-100)]`}>
              <PrepItIcon name="arrowUp" size={iconSize} color="#ffffff" />
            </div>
          ) : (
            <>
              <div className={`${tile} bg-[var(--grey-5)]`}>
                <MicrophoneIcon size={iconSize} color="var(--black-100)" />
              </div>
              <div className={`${tile} bg-[var(--grey-5)]`}>
                <PrepItIcon name="camera" size={iconSize} color="var(--black-100)" />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
