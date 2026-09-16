"use client";

import HeroLoopDemo from "@/components/HeroLoopDemo";

const AI_GRADIENT =
  "linear-gradient(to top right, #809FF9 0%, #D093D9 31%, #F38C61 63%, #F3CD7F 97.5%)";

const TITLE_GRADIENT =
  "linear-gradient(to right, #809FF9 0%, #D093D9 31%, #F38C61 63%, #F3CD7F 97.5%)";

export default function GetStartedPrimer({
  onGetStarted,
}: {
  onGetStarted: () => void;
}) {
  return (
    <div className="relative flex h-dvh max-h-dvh flex-col overflow-hidden bg-[var(--surface)]">
      <div
        className="flex min-h-0 flex-1 flex-col"
        style={{
          backgroundImage: AI_GRADIENT,
          paddingTop: "env(safe-area-inset-top)",
          paddingBottom: 20,
        }}
      >
        <div className="flex min-h-0 flex-1 px-4 py-2 [@media(max-height:699px)]:py-0.5">
          <HeroLoopDemo layout="fill" autoPlay />
        </div>
      </div>

      <div className="relative z-10 -mt-5 rounded-t-[24px] bg-[var(--surface)] px-4 pt-8 pb-[max(16px,env(safe-area-inset-bottom))] [@media(max-height:699px)]:pt-5">
        <div className="mx-auto w-full max-w-lg">
          <p
            className="bg-clip-text text-center font-clash text-xl font-semibold leading-6 text-transparent [@media(max-height:699px)]:text-lg"
            style={{ backgroundImage: TITLE_GRADIENT }}
          >
            Your AI nutritionist
          </p>
          <h1 className="mt-3 text-center font-clash text-[28px] font-semibold leading-8 text-[var(--text-primary)] [@media(max-height:699px)]:mt-2 [@media(max-height:699px)]:text-[22px] [@media(max-height:699px)]:leading-7">
            A system that actually improves how you eat.
          </h1>
          <button
            type="button"
            onClick={onGetStarted}
            className="mt-7 h-14 w-full rounded-2xl bg-[var(--primary)] text-base font-bold text-[var(--on-primary)] [@media(max-height:699px)]:mt-4"
          >
            Get Started
          </button>
        </div>
      </div>
    </div>
  );
}
