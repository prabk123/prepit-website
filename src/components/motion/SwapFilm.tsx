"use client";

import Image from "next/image";
import { AppMark, Film, Icon, cameraAt, clamp01, columns, moves, track, useFilm } from "./filmKit";

/*
 * "Change anything, just ask." film (website motion experiment): swapping a
 * planned dinner from chat, with the app's real components staged like the
 * hero film. From the captures in public/app (12-plan-week, 27b-plan-swap)
 * and the app's Update plan card:
 * 1. Saturday's dinner, the Korean beef rice bowl, and Ask Nutritionist;
 * 2. "Can you suggest some alternatives?", "Which of these sounds best?",
 *    and Chicken & Vegetable Stir-Fry is picked;
 * 3. the pick becomes the Update plan card, and Apply Changes, because a
 *    change waits for the OK;
 * 4. the card becomes the new dinner on the plan. There is no capture of
 *    this dish, so its photo and numbers are still loading.
 */

const LOOP = 13.4;
const REST = 7.4;

const OPTIONS = ["Cod & Sweet Potato Mash", "Chicken & Vegetable Stir-Fry", "Tuna & Pasta Bake", "Type your own"];
const PICK = 1;
const OPTION_TOP = 156;
const TAP = 5.2;
const UPDATE = 6.0;
const APPLY = 8.3;
const SWAPPED = 9.4;
const OUT = 12.6;

const OLD_CARD: [number, number, number, number, number] = [200, 154, 368, 116, 16];
const NEW_CARD: [number, number, number, number, number] = [200, 196, 368, 92, 16];

/* The one shape: [time, centre x, centre y, width, height, radius]. */
const SHAPE: [number, number, number, number, number, number][] = [
  [0, ...OLD_CARD],
  [2.0, ...OLD_CARD],
  [2.15, 200, OPTION_TOP + PICK * 56 + 24, 340, 48, 12], // hidden, waits behind the option
  [TAP - 0.05, 200, OPTION_TOP + PICK * 56 + 24, 340, 48, 12], // the picked option
  [UPDATE, 200, 196, 340, 168, 16], // the Update plan card
  [SWAPPED, ...NEW_CARD], // the new dinner
  [OUT + 0.4, ...OLD_CARD],
];
const SHAPE_TRACKS = columns(SHAPE, 5);

const CAMERA: [number, number, number, number][] = [
  [0, 1, 200, 200],
  [1.0, 1.06, 200, 190], // in on the dinner and Ask Nutritionist
  [2.2, 1, 200, 200],
  [UPDATE, 1.08, 200, 200], // in on the Update plan card
  [SWAPPED, 1, 200, 200],
];

const WHITE = "linear-gradient(#fff, #fff) padding-box, linear-gradient(#e9e9ea, #e9e9ea) border-box";
const GRADIENT =
  "linear-gradient(90deg, #f7f8ff, #fcf7fd, #fff6f2, #fffaf0) padding-box, linear-gradient(90deg, #809ff9, #d093d9, #f38c61, #f3cd7f) border-box";
const BLACK = "linear-gradient(#000, #000) padding-box, linear-gradient(#000, #000) border-box";

function seek(t: number, put: (key: string, prop: string, value: string) => void) {
  const { enter, press } = moves(put);
  put("camera", "transform", cameraAt(CAMERA, t));

  const [cx, cy, w, h, r] = SHAPE_TRACKS.map((keys) => track(keys, t));
  put("shape", "width", `${w.toFixed(1)}px`);
  put("shape", "height", `${h.toFixed(1)}px`);
  put("shape", "transform", `translate(${(cx - w / 2).toFixed(1)}px, ${(cy - h / 2).toFixed(1)}px)`);
  put("shape", "border-radius", `${r.toFixed(1)}px`);
  put("shape", "border-width", t > UPDATE - 0.3 && t < SWAPPED - 0.2 ? "2px" : "1px");
  put(
    "shape",
    "background",
    t < TAP - 0.1 ? WHITE : t < UPDATE - 0.3 ? BLACK : t < SWAPPED - 0.2 ? GRADIENT : WHITE,
  );
  // Out with the dinner card, back in as the picked option.
  const fade = t < TAP - 0.1 ? 1 - clamp01((t - 2.0) / 0.15) : 1;
  put("shape", "opacity", fade.toFixed(2));

  // 1. Saturday's dinner and Ask Nutritionist. It comes in before the loop
  // wraps, as the new dinner becomes this card again.
  const wrap = t > LOOP - 0.6 ? t - LOOP : t;
  enter("slotOld", wrap, -0.4, 2.0);
  enter("oldMeal", wrap, -0.3, 2.0, [0, -10]);
  enter("ask", wrap, 0.3, 2.0, [0, 20]);
  press("ask", t, 1.7);

  // 2. Ask for alternatives, and pick one.
  enter("you", t, 2.3, UPDATE - 0.3, [0, -40]);
  enter("which", t, 2.9, UPDATE - 0.3, [0, -40]);
  OPTIONS.forEach((_, i) => {
    if (i === PICK) return enter(`opt${i}`, t, 3.3 + i * 0.12, TAP - 0.05, [0, 0]);
    enter(`opt${i}`, t, 3.3 + i * 0.12, TAP + 0.2 + i * 0.05, [i % 2 ? 420 : -420, 0]);
  });
  press(`opt${PICK}`, t, TAP - 0.1);
  enter("tapLabel", t, TAP - 0.05, UPDATE - 0.45, [0, 0]);

  // 3. The Update plan card waits for the OK.
  enter("update", t, UPDATE + 0.2, SWAPPED - 0.5, [0, 0]);
  press("apply", t, APPLY);
  const applied = t > APPLY;
  put("apply", "background-color", applied ? "#e9e9ea" : "#000");
  put("apply", "color", applied ? "#7a7a82" : "#fff");
  put("applyLabel", "text", applied ? "Done" : "Apply Changes");

  // 4. The new dinner on the plan.
  enter("slotNew", t, SWAPPED, OUT);
  enter("newMeal", t, SWAPPED + 0.2, OUT, [0, -10]);
}

export default function SwapFilm({ label, className }: { label: string; className?: string }) {
  const { set, ...film } = useFilm({ loop: LOOP, rest: REST, name: "swap-film", seek });

  return (
    <Film {...film} label={label} className={`swap-film ${className ?? ""}`}>
      <div ref={set("camera")} className="film__camera" aria-hidden>
        <div ref={set("shape")} className="sf-shape" />

        {/* 1. Saturday's dinner. */}
        <span ref={set("slotOld")} className="pf-c pf-slot" style={{ top: 70 }}>
          Dinner
        </span>
        <span ref={set("oldMeal")} className="pf-c pf-meal sf-meal" style={{ top: 96 }}>
          <Image src="/motion/dish-korean-beef.webp" alt="" width={60} height={60} className="pf-meal__photo" unoptimized />
          <span className="pf-meal__body">
            <b className="pf-meal__title">Korean beef rice bowl</b>
            <span className="pf-meal__chips">
              <span className="hf-chip hf-chip--kcal">
                <Icon name="fire" size={11} />
                560 kcal
              </span>
              <span className="pf-chip">C 58g</span>
              <span className="pf-chip">P 38g</span>
              <span className="pf-chip">F 18g</span>
            </span>
          </span>
          <span className="pf-meal__note">From your logs. Lean mince keeps it under your fat target.</span>
        </span>
        <span ref={set("ask")} className="pf-c sf-ask">
          <AppMark size={18} />
          Ask Nutritionist
        </span>

        {/* 2. Alternatives. */}
        <span ref={set("you")} className="pf-c sf-you">
          Can you suggest some alternatives?
        </span>
        <span ref={set("which")} className="pf-c sf-which">
          Which of these sounds best?
        </span>
        {OPTIONS.map((option, i) => (
          <span key={option} ref={set(`opt${i}`)} className="hf-c hf-reply" style={{ top: OPTION_TOP + i * 56 }}>
            {i === 3 ? (
              <span className="hf-reply__n nf-reply__pen">
                <Icon name="pencil" size={10} />
              </span>
            ) : (
              <span className="hf-reply__n">{i + 1}</span>
            )}
            <span className="hf-reply__label">{option}</span>
            <Icon name="chevronRight" size={12} />
          </span>
        ))}
        <span ref={set("tapLabel")} className="hf-c hf-tap-label" style={{ top: OPTION_TOP + PICK * 56 }}>
          <span className="hf-reply__n">{PICK + 1}</span>
          <span className="hf-reply__label">{OPTIONS[PICK]}</span>
          <Icon name="chevronRight" size={12} />
        </span>

        {/* 3. The Update plan card. */}
        <span ref={set("update")} className="pf-c sf-update">
          <span className="sf-update__head">
            <Icon name="sparkles" size={15} />
            Update plan
          </span>
          <span className="sf-update__summary">
            Swap Saturday&apos;s dinner, the Korean beef rice bowl, for a Chicken &amp; Vegetable Stir-Fry.
          </span>
          <span ref={set("apply")} className="sf-update__apply">
            <span ref={set("applyLabel")}>Apply Changes</span>
          </span>
        </span>

        {/* 4. The new dinner. */}
        <span ref={set("slotNew")} className="pf-c pf-slot" style={{ top: 124 }}>
          Dinner
        </span>
        <span ref={set("newMeal")} className="pf-c pf-meal sf-meal sf-meal--new" style={{ top: 150 }}>
          <span className="pf-meal__photo sf-loading" />
          <span className="pf-meal__body">
            <b className="pf-meal__title">Chicken &amp; Vegetable Stir-Fry</b>
            <span className="pf-meal__chips">
              <span className="sf-loading sf-loading--chips" />
            </span>
          </span>
        </span>
      </div>
    </Film>
  );
}
