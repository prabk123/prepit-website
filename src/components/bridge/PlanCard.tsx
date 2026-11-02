import Image from "next/image";
import type { BridgeHandoff } from "@/lib/funnel/bridgeHandoff";
import { cartWho } from "@/lib/funnel/cart";
import type { BridgeSource } from "@/lib/funnel/params";

const SESSIONS = [
  { title: "Getting to know you", when: "Today · about 5 minutes", body: "Your routine, your goal and what a normal day looks like." },
  { title: "What I’ve noticed so far", when: "After 3 days of meals", body: "The patterns in your meals, and one focus you pick together." },
  { title: "Week-in-review", when: "Around day 7", body: "A review of your week, and a custom meal plan for the next one." },
];

/** The parts the quiz's loader turns on one by one (PRE-446); the still itself is always there. */
export type PlanCardPart = "line" | "said" | "sessions" | "targets";
const ALL_PARTS: ReadonlySet<PlanCardPart> = new Set(["line", "said", "sessions", "targets"]);

/**
 * The cart's plan card (PRE-437): the one-bite still with the visitor's
 * "For…" line, what they said, the three consultation sessions and (quiz)
 * their targets. The quiz's loader builds the same card part by part
 * (PRE-446), so the card the visitor watched being made is the one at the
 * top of the cart.
 *
 * `parts` are the pieces that are on (the "For…" line, "You said…", the
 * sessions, the targets); the cart shows them all. `spread` pulls the parts apart for
 * the loader's last beat before the card holds.
 */
export default function PlanCard({
  from,
  handoff,
  parts = ALL_PARTS,
  spread = false,
  animate = false,
}: {
  from: BridgeSource;
  handoff: Pick<BridgeHandoff, "startingPoint" | "planSummary"> | null;
  parts?: ReadonlySet<PlanCardPart>;
  spread?: boolean;
  /** Each part rises in as it arrives (the loader); never under reduced motion. */
  animate?: boolean;
}) {
  const who = cartWho(from, handoff?.startingPoint);
  const summary = from === "quiz" ? handoff?.planSummary : undefined;
  const targets = [
    summary?.calories ? `${summary.calories.toLocaleString("en-US")} kcal` : null,
    summary?.proteinGrams ? `${summary.proteinGrams} g protein` : null,
  ].filter(Boolean);
  const arrive = animate ? "plan-part-in" : "";
  return (
    <section
      // The heading arrives with the sessions part; until then the card names itself.
      aria-labelledby={parts.has("sessions") ? "cart-plan" : undefined}
      aria-label={parts.has("sessions") ? undefined : "Your plan"}
      className={`overflow-hidden rounded-tile border border-line bg-surface transition-shadow duration-500 ${spread ? "shadow-[0_18px_40px_-18px_rgb(26_26_46/0.35)]" : ""}`}
    >
      <div className="relative h-[150px] bg-[#eadccf] lg:h-[240px]">
        <Image
          src="/cart/one-bite-1080.webp"
          alt="Seven spoons, each holding one bite of a different everyday food, on cream"
          fill
          priority
          sizes="(min-width: 1024px) 600px, 100vw"
          className="object-cover object-[50%_20%] dark:brightness-[0.8] dark:saturate-[0.92]"
        />
        {parts.has("line") && (
          <p
            className={`absolute bottom-3 left-3 max-w-[calc(100%-24px)] whitespace-nowrap rounded-[12px] border border-white/60 bg-surface/80 px-3 py-2 font-display text-[16px] font-medium leading-tight text-ink backdrop-blur-md ${arrive}`}
          >
            {who.line}
          </p>
        )}
      </div>
      <div
        className={`flex flex-col px-[18px] pb-[18px] pt-4 transition-[gap] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
          spread ? "gap-6" : "gap-3"
        }`}
      >
        {parts.has("said") && who.said && <p className={`text-[15px] italic leading-relaxed text-ink-secondary ${arrive}`}>{who.said}</p>}
        {parts.has("sessions") && (
          <div className={`flex flex-col gap-3 ${arrive}`}>
            <p className="text-eyebrow font-bold uppercase tracking-[0.12em]">
              <span className="text-gradient-brand">Your free consultation</span>
            </p>
            <h2 id="cart-plan" className="font-display text-[19px] font-medium leading-tight text-ink text-balance">
              3 short chats with your nutritionist.
            </h2>
            <ol aria-label="Your three consultation sessions" className="flex flex-col">
              {SESSIONS.map((session, index) => (
                <li key={session.title} className="relative grid grid-cols-[28px_minmax(0,1fr)] gap-3 pb-3.5 last:pb-0">
                  {index < SESSIONS.length - 1 && <span aria-hidden className="absolute bottom-0 left-[13.5px] top-7 w-px bg-line-strong" />}
                  <span
                    aria-hidden
                    className={`grid h-7 w-7 place-items-center rounded-full font-display text-[13px] font-semibold ${
                      index === 0 ? "bg-primary text-on-primary" : "bg-surface text-ink shadow-[inset_0_0_0_1.5px_var(--color-ink)]"
                    }`}
                  >
                    {index + 1}
                  </span>
                  <div>
                    <b className="block text-[15px] font-bold text-ink">{session.title}</b>
                    <span className="mt-0.5 block text-[11px] font-bold uppercase leading-snug tracking-[0.08em] text-ink-muted">
                      {session.when}
                    </span>
                    <p className="mt-1 text-small leading-snug text-ink-secondary">{session.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        )}
        {parts.has("targets") && targets.length > 0 && (
          <div className={`flex flex-wrap justify-between gap-x-2.5 gap-y-1.5 border-t border-line pt-2.5 text-[13px] text-ink-muted ${arrive}`}>
            <span>Saved to your account when you continue</span>
            <b className="font-bold text-ink tabular-nums">{targets.join(" · ")}</b>
          </div>
        )}
      </div>
    </section>
  );
}
