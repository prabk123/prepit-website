/**
 * What checkout shows while RevenueCat's web paywall loads (PRE-464): the
 * shape of Charlie's paywall (rating line, heading, lead, saved plan, the
 * week's timeline, both plan cards and the "Due today" card with its button)
 * in quiet bones on the paywall's cream, so the page doesn't jump when the
 * real paywall fades in over it.
 *
 * The paywall is always light (lightPaywall.ts) and sits on cream in light and
 * dark (globals.css, `data-paywall-page="web"`), so the bones use fixed
 * translucent black and white rather than theme tokens that turn dark.
 * Screen readers hear "Loading your plans…".
 */

const BONE = "rounded-full bg-black/[0.07] motion-safe:animate-pulse";
const CARD = "rounded-2xl border border-black/[0.06] bg-white/55";

function Bone({ className = "" }: { className?: string }) {
  return <div className={`${BONE} ${className}`} />;
}

const TIMELINE_ROWS = [
  { title: "w-40", body: ["w-full", "w-3/5"] },
  { title: "w-44", body: ["w-4/5"] },
  { title: "w-48", body: ["w-2/5"] },
  { title: "w-36", body: ["w-4/5"] },
];

export default function PaywallSkeleton({ className = "" }: { className?: string }) {
  return (
    <div role="status" aria-live="polite" className={`flex w-full flex-col gap-7 ${className}`} data-testid="paywall-skeleton">
      <span className="sr-only">Loading your plans…</span>

      {/* Rating, heading and lead. */}
      <div aria-hidden className="flex flex-col gap-3.5">
        <Bone className="h-3.5 w-56" />
        <div className="flex flex-col gap-2.5 pt-1">
          <Bone className="h-9 w-[78%] rounded-xl sm:h-11" />
          <Bone className="h-9 w-[52%] rounded-xl sm:h-11" />
        </div>
        <div className="flex flex-col gap-2 pt-1">
          <Bone className="h-4 w-full" />
          <Bone className="h-4 w-[88%]" />
          <Bone className="h-4 w-[45%]" />
        </div>
      </div>

      {/* The saved plan. */}
      <div aria-hidden className="flex flex-col gap-2 border-t border-black/[0.08] pt-5">
        <Bone className="h-3 w-52" />
        <Bone className="h-3.5 w-60" />
      </div>

      {/* Your week, and when you pay. */}
      <div aria-hidden className="flex flex-col gap-5">
        <Bone className="h-6 w-64 rounded-lg" />
        {TIMELINE_ROWS.map((row, index) => (
          <div key={index} className="flex gap-3.5">
            <div className={`${BONE} h-7 w-7 shrink-0`} />
            <div className="flex flex-1 flex-col gap-2 pt-0.5">
              <Bone className="h-2.5 w-28" />
              <Bone className={`h-4 ${row.title}`} />
              {row.body.map((width, line) => (
                <Bone key={line} className={`h-3.5 ${width}`} />
              ))}
            </div>
          </div>
        ))}
        <div className="flex gap-3.5">
          <div className={`${BONE} h-7 w-7 shrink-0`} />
          <div className={`${CARD} flex flex-1 flex-col gap-2 p-4`}>
            <Bone className="h-2.5 w-24" />
            <Bone className="h-4 w-56" />
            <Bone className="h-3.5 w-full" />
            <Bone className="h-3.5 w-2/3" />
          </div>
        </div>
      </div>

      {/* The plans. */}
      <div aria-hidden className="flex flex-col gap-3">
        <Bone className="h-2.5 w-36" />
        {[0, 1].map((plan) => (
          <div
            key={plan}
            className={`${CARD} flex items-center gap-4 px-4 py-5 ${plan === 0 ? "border-black/[0.14]" : ""}`}
          >
            <div className={`${BONE} h-5 w-5 shrink-0`} />
            <div className="flex flex-1 flex-col gap-2">
              <Bone className="h-4 w-24" />
              <Bone className="h-3 w-40" />
            </div>
            <div className="flex flex-col items-end gap-2">
              <Bone className="h-5 w-16" />
              <Bone className="h-2.5 w-12" />
            </div>
          </div>
        ))}
      </div>

      {/* Due today, with the button. */}
      <div aria-hidden className="flex flex-col gap-4 rounded-2xl bg-white/80 p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)] sm:p-5">
        <Bone className="h-2.5 w-36" />
        <div className="flex items-end justify-between gap-4">
          <div className="flex flex-col gap-2">
            <Bone className="h-4 w-24" />
            <Bone className="h-3.5 w-48" />
          </div>
          <Bone className="h-9 w-24 rounded-xl" />
        </div>
        <div className={`${BONE} h-12 w-full`} />
        <Bone className="mx-auto h-3 w-3/4" />
        <Bone className="mx-auto h-3 w-1/2" />
      </div>
    </div>
  );
}
