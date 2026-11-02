import Image from "next/image";
import type { CSSProperties } from "react";
import { drawnVisual, type PickedVisual } from "@/lib/quiz/replyVisuals";

/** Real app cut-outs and quiz stills, in public/quiz/v9 (from the v9.2 handoff's media). */
const src = (img: string) => `/quiz/v9/${img}.webp`;

/** Pixel sizes of the cut-outs, so each holds its space before it loads. */
const SIZES: Record<string, [number, number]> = {
  "card-logit": [740, 393],
  "chart": [770, 629],
  "checkin": [748, 290],
  "field-oats": [754, 112],
  "focus-evenout": [672, 168],
  "focus-head": [738, 143],
  "grocery-row": [732, 156],
  "home-eaten": [738, 430],
  "me-breakfast": [604, 144],
  "me-burrito": [615, 232],
  "msg-alts": [614, 156],
  "msg-chart": [661, 256],
  "msg-dip": [658, 197],
  "msg-oats": [659, 303],
  "msg-snacks": [658, 137],
  "msg-social": [658, 545],
  "msg-swap": [652, 312],
  "plan-cost": [732, 220],
  "plan-cost-usd": [732, 228],
  "plan-head": [396, 124],
  "ring-energy": [412, 400],
  "ring-mood": [412, 400],
  "ring-satiety": [412, 400],
  "rings": [741, 337],
  "row-burrito": [626, 206],
  "row-oats": [626, 247],
  "row-salmon": [626, 246],
  "row-wrap": [626, 247],
  "row-yogurt": [626, 205],
  "snap-burrito": [414, 544],
  "swap-options": [742, 451],
  "today-rows": [760, 375],
  "today-snack": [760, 184],
  "week-rings": [740, 298],
  "week-strip": [724, 156],
  "weekly-head": [740, 207],
  "weekly-weekend": [740, 706],
  "why-energy-oats": [740, 293],
  "why-mood": [732, 337],
  "why-satiety-lunch": [748, 338],
  "why-satiety-oats": [740, 253],
  "why-satiety": [732, 295],
};

type Vars = CSSProperties & Record<`--${string}`, string | number>;

/**
 * A reply's visual (PRE-441): the cards build one by one when the screen
 * arrives, then hold. Nothing re-runs while the screen stays open, and under
 * reduced motion the final frame shows at once (quiz-v9.css). Cost cards
 * show the visitor's checkout currency (PRE-436).
 */
export default function ReplyVisual({ picked, currency }: { picked: PickedVisual; currency?: string }) {
  const visual = drawnVisual(picked, currency);
  let index = 0;
  return (
    <div className="quiz-visual" data-visual={picked.key}>
      {visual.still && (
        <div
          className="quiz-visual__still quiz-build"
          style={{ "--quiz-i": index++, "--op": visual.still.position, ...(visual.still.desktopRatio ? { "--srd": visual.still.desktopRatio } : {}) } as Vars}
        >
          {/* Decorative: the cards carry the meaning. */}
          <Image src={src(visual.still.img)} alt="" fill sizes="(min-width: 900px) 420px, 100vw" />
        </div>
      )}
      {visual.cards.map((card) => {
        const style: Vars = { "--quiz-i": index++, "--w": `${card.w}%` };
        if (card.wd !== undefined) style["--wd"] = `${card.wd}%`;
        if (card.ov !== undefined) style["--ov"] = `${card.ov}px`;
        if (card.ovd !== undefined) style["--ovd"] = `${card.ovd}px`;
        const [width, height] = SIZES[card.img] ?? [800, 400];
        const image = <Image src={src(card.img)} alt={card.alt} width={width} height={height} sizes="(min-width: 900px) 480px, 92vw" />;
        return (
          <div key={card.img} className={`quiz-visual__card quiz-build${card.wipe ? " quiz-wipe" : ""}`} data-right={card.right ? "" : undefined} style={style}>
            {card.tag && (
              <span className="quiz-visual__tag" aria-hidden>
                {card.tag}
              </span>
            )}
            <div className="quiz-glass">{card.wipe ? <div className="quiz-glass__clip">{image}</div> : image}</div>
          </div>
        );
      })}
    </div>
  );
}
