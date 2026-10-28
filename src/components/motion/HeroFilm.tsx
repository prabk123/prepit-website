"use client";

import type { CSSProperties } from "react";
import type { FilmIconName } from "./filmIcons";
import { AppMark, Film, Icon, Plus, cameraAt, clamp01, columns, ease, easeIn, mix, moves, pressScale, spring, track, useFilm } from "./filmKit";

/*
 * The homepage hero film (website motion experiment), staged after the
 * Prompt Motion pieces Prabodh picked: twoclipping-5cba86 (one shape morphing
 * through the UI with springs) and ultimaxbt-2ddf1e (one continuous take,
 * components flowing in and out, a button growing into the next screen).
 *
 * The app's real components float on the page with no phone around them,
 * and follow a real flow on the showcase account's day (the captures in
 * public/app):
 * 1. the nutritionist's protein check-in, and a tap on "Bigger protein at dinner";
 * 2. that black reply shrinks into the + button, which grows into the Add sheet;
 * 3. Describe your meal: "Mediterranean salmon bowl with quinoa" is typed and sent;
 * 4. "When did you eat this?": the wheel rolls to 6:45 PM, Confirm;
 * 5. the card becomes the meal's row on the Log, the name flying into it,
 *    with its chips (454 kcal, +15 +9 +19);
 * 6. Eaten drops in, the calories fly up to it, and it counts 1,027 to 1,481
 *    and goes On track;
 * 7. the row becomes the Energy, Satiety and Mood card;
 * 8. that card shrinks back into the check-in bubble, and the loop starts again.
 *
 * Prabodh agreed (28 Oct 2026) that this film may draw the app in code. The
 * numbers before the salmon bowl are the day's totals minus that meal.
 */

const LOOP = 19.6;
/** Where the film rests before it plays, and under reduced motion. */
const REST = 16.0;

const NUDGE =
  "Over the past few weeks protein has been a little low: under your target on 18 of 21 logged days, about 127g a day against 158g. Most of the gap is at dinner, which averages about 39g. Two easy fixes that don't change what you cook: a bigger portion of the protein you already have at dinner, or a pot of Greek yogurt after dinner. Want to try one?";
const REPLIES = ["Bigger protein at dinner", "Greek yogurt after dinner", "Not now"];
const MEAL = "Mediterranean salmon bowl with quinoa";
const CHIPS: { icon: FilmIconName; value: string }[] = [
  { icon: "bolt", value: "+15" },
  { icon: "apple", value: "+9" },
  { icon: "spa", value: "+19" },
];
const EATEN = { before: 1027, after: 1481, goal: 1570 };
const MACROS = [
  { label: "Carbs", before: 100, after: 131, goal: 136 },
  { label: "Protein", before: 110, after: 156, goal: 158 },
  { label: "Fat", before: 25, after: 39, goal: 44 },
];
const RINGS: { label: string; icon: FilmIconName; score: number }[] = [
  { label: "Energy", icon: "bolt", score: 84 },
  { label: "Satiety", icon: "apple", score: 96 },
  { label: "Mood", icon: "spa", score: 87 },
];
const HOURS = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
const MINUTES = Array.from({ length: 60 }, (_, m) => String(m).padStart(2, "0"));
/** Wheel rows are 22 pt; the picked row sits third of five. */
const ROW = 22;
/** The check-in bubble and the first reply, in stage points. */
const BUBBLE = { top: 20, height: 184 };
const REPLY_TOP = 216;

/*
 * The one shape: [time, centre x, centre y, width, height, radius, grey
 * level (0 black, 1 white)]. It takes over from the tapped reply and ends as
 * the check-in bubble, which then takes over from it.
 */
const SHAPE: [number, number, number, number, number, number, number][] = [
  [0, 200, REPLY_TOP + 24, 340, 48, 12, 0], // the tapped reply
  [4.15, 200, 200, 64, 64, 32, 0], // the + button
  [5.45, 200, 200, 340, 236, 24, 1], // the Add sheet
  [7.05, 200, 200, 360, 200, 24, 1], // Describe your meal
  [9.75, 200, 200, 340, 300, 24, 1], // When did you eat this?
  [12.25, 200, 250, 330, 96, 16, 1], // the meal on the Log
  [14.0, 200, 330, 330, 96, 16, 1], // ...moved down for Eaten
  [16.35, 200, 200, 360, 170, 24, 1], // Energy, Satiety and Mood
  [18.75, 200, BUBBLE.top + BUBBLE.height / 2, 340, BUBBLE.height, 12, 1], // the check-in again
];
const SHAPE_TRACKS = columns(SHAPE, 6);

/** The camera: [time, zoom, focus x, focus y]. */
const CAMERA: [number, number, number, number][] = [
  [0, 1.15, 200, 112],
  [0.7, 1, 200, 200], // back from the check-in to its replies
  [7.6, 1.06, 200, 205], // a little closer on the composer, the card still whole
  [9.75, 1, 200, 200],
  [14.0, 1, 200, 196],
  [18.75, 1.15, 200, 112], // back on the check-in for the next loop
];

function Wheel({ items, list, width }: { items: (string | number)[]; list: (el: HTMLElement | null) => void; width: number }) {
  return (
    <span className="hf-wheel__col" style={{ width }}>
      <span ref={list} className="hf-wheel__list">
        {items.map((v) => (
          <span key={v}>{v}</span>
        ))}
      </span>
    </span>
  );
}

function seek(t: number, put: (key: string, prop: string, value: string) => void) {
  const { enter, press, pop, rise } = moves(put);
  put("camera", "transform", cameraAt(CAMERA, t));

  // The one shape: the tapped reply, the + button, then each card.
  const [cx, cy, w0, h0, r0] = SHAPE_TRACKS.slice(0, 5).map((keys) => track(keys, t));
  const grey = clamp01(track(SHAPE_TRACKS[5], t, 0.4, 1));
  const w = Math.max(0, w0);
  const h = Math.max(0, h0);
  const r = Math.max(0, r0);
  // As it becomes the check-in, its corner sharpens like the bubble's.
  const tail = mix(r, 2, ease((t - 18.75) / 0.5));
  put("shape", "visibility", t >= 3.85 ? "visible" : "hidden");
  put("shape", "width", `${w.toFixed(1)}px`);
  put("shape", "height", `${h.toFixed(1)}px`);
  put("shape", "transform", `translate(${(cx - w / 2).toFixed(1)}px, ${(cy - h / 2).toFixed(1)}px) scale(${pressScale(t, 5.15).toFixed(3)})`);
  put("shape", "border-radius", `${r.toFixed(1)}px ${r.toFixed(1)}px ${r.toFixed(1)}px ${tail.toFixed(1)}px`);
  const level = Math.round(grey * 255);
  put("shape", "background-color", `rgb(${level} ${level} ${level})`);
  put("shape", "border-color", `rgb(233 233 234 / ${grey.toFixed(2)})`);

  // 1. The check-in's words rise; its replies follow; the first is tapped.
  // At the end the shape has become the bubble, so its words start rising
  // before the loop wraps.
  const wrap = t > LOOP - 0.8 ? t - LOOP : t;
  const bubbleOut = t < 10 ? easeIn((t - 3.95) / 0.4) : 0;
  put("bubble", "transform", `translateY(${(-320 * bubbleOut).toFixed(1)}px)`);
  put("bubble", "visibility", wrap > -0.65 && wrap < 4.4 ? "visible" : "hidden");
  rise("bubbleText", wrap, -0.6);
  REPLIES.forEach((_, i) => {
    if (i > 0) return enter(`reply${i}`, t, 1.0 + i * 0.12, 3.95 + i * 0.06, [i % 2 ? 420 : -420, 0]);
    // The shape takes over from the tapped reply.
    const inP = spring(t - 1.0, 0.55, 0.8);
    put("reply0", "opacity", clamp01((t - 1.0) / 0.15).toFixed(2));
    put("reply0", "visibility", t >= 1.0 && t < 3.86 ? "visible" : "hidden");
    put("reply0", "translate", `0 ${((1 - inP) * 22).toFixed(1)}px`);
  });
  const picked = t > 3.6;
  put("reply0", "background-color", picked ? "#000" : "#fff");
  put("reply0", "color", picked ? "#fff" : "#000");
  put("reply0", "border-color", picked ? "#000" : "#e9e9ea");
  press("reply0", t, 3.6);
  put("tapLabel", "opacity", (1 - clamp01((t - 3.9) / 0.15)).toFixed(2));
  put("tapLabel", "visibility", t >= 3.85 && t < 4.1 ? "visible" : "hidden");

  // 2. The + button grows into the Add sheet; Log Meal is tapped.
  put("plus", "opacity", (clamp01((t - 4.1) / 0.15) * (1 - clamp01((t - 5.25) / 0.12))).toFixed(2));
  put("plus", "rotate", `${(90 * spring(t - 4.15, 0.6, 0.7)).toFixed(1)}deg`);
  enter("add", t, 5.7, 6.95);
  press("logMeal", t, 6.75);

  // 3. Describe your meal: typing, then send.
  enter("describe", t, 7.25, 9.6);
  const typed = MEAL.slice(0, Math.floor(clamp01((t - 7.9) / 1.4) * MEAL.length));
  put("typed", "text", typed);
  put("hint", "display", typed ? "none" : "inline");
  put("caret", "opacity", t < 9.4 && Math.floor(t * 2.4) % 2 === 0 ? "1" : "0");
  const sending = clamp01((t - 7.9) / 0.25);
  [0, 1].forEach((i) => {
    put(`media${i}`, "width", `${mix(40, 0, sending).toFixed(1)}px`);
    put(`media${i}`, "opacity", (1 - sending).toFixed(2));
    // Their gap closes with them, so the field meets the send button.
    put(`media${i}`, "margin-left", `${mix(8, 0, sending).toFixed(1)}px`);
  });
  pop("send", t, 7.95);
  if (t > 9.25 && t < 9.65) press("send", t, 9.4);

  // 4. When did you eat this? The wheel rolls back to 6:45 PM, then Confirm.
  enter("when", t, 9.95, 12.05);
  const hour = mix(10, 6, ease((t - 10.4) / 0.9));
  const minute = mix(50, 45, ease((t - 10.65) / 0.8));
  put("wheelHour", "translate", `0 ${(2 * ROW - hour * ROW).toFixed(1)}px`);
  put("wheelMinute", "translate", `0 ${(2 * ROW - minute * ROW).toFixed(1)}px`);
  press("confirm", t, 11.85);

  // 5. The card becomes the meal's row on the Log; the name flies into it.
  const rowY = track(
    [
      [0, 0],
      [14.0, 80],
      [16.35, 330],
    ],
    t,
  );
  const fly = spring(t - 12.15, 0.6, 0.85);
  put("fly", "opacity", (clamp01((t - 10.0) / 0.2) * (1 - clamp01((t - 16.4) / 0.2))).toFixed(2));
  put("fly", "visibility", t > 10 && t < 16.7 ? "visible" : "hidden");
  put("fly", "transform", `translate(${mix(46, 49, fly).toFixed(1)}px, ${(mix(128, 212, fly) + rowY).toFixed(1)}px)`);
  const ink = Math.round(mix(77, 0, fly));
  put("fly", "color", `rgb(${ink} ${ink} ${Math.round(mix(89, 0, fly))})`);
  put("fly", "font-size", `${mix(15, 16, fly).toFixed(2)}px`);
  put("fly", "font-weight", fly > 0.5 ? "500" : "400");
  put("flyQuote0", "opacity", (1 - clamp01(fly * 3)).toFixed(2));
  put("flyQuote1", "opacity", (1 - clamp01(fly * 3)).toFixed(2));
  put("row", "transform", `translateY(${rowY.toFixed(1)}px)`);
  enter("rowHead", t, 12.45, 16.2);
  [0, 1, 2, 3].forEach((i) => pop(`chip${i}`, t, 12.8 + i * 0.13, 16.4));

  // 6. Eaten drops in; the calories fly up to it, and it counts up.
  const drop = spring(t - 13.95, 0.6, 0.8) - easeIn((t - 16.25) / 0.4);
  put("eaten", "transform", `translateY(${((1 - drop) * -300).toFixed(1)}px)`);
  put("eaten", "visibility", t > 13.9 && t < 16.8 ? "visible" : "hidden");
  const up = spring(t - 14.55, 0.7, 0.9);
  put("kcalFly", "opacity", (clamp01((t - 14.5) / 0.05) * (1 - clamp01((t - 15.2) / 0.04))).toFixed(2));
  put("kcalFly", "transform", `translate(${mix(49, 96, up).toFixed(1)}px, ${mix(344, 48, up).toFixed(1)}px) scale(${mix(1, 1.3, up).toFixed(3)})`);
  const fill = ease((t - 15.0) / 1.0);
  const eaten = Math.round(mix(EATEN.before, EATEN.after, fill));
  put("eatenNum", "text", eaten.toLocaleString("en-GB"));
  put("left", "text", String(EATEN.goal - eaten));
  put("bar", "scale", `${(eaten / EATEN.goal).toFixed(4)} 1`);
  pop("onTrack", t, 15.85);
  MACROS.forEach((m, i) => {
    const v = Math.round(mix(m.before, m.after, fill));
    put(`macro${i}`, "text", `${v}/${m.goal}g`);
    put(`macroArc${i}`, "stroke-dashoffset", (1 - v / m.goal).toFixed(3));
  });

  // 7. Energy, Satiety and Mood: the rings draw in, then the card leaves
  //    for the check-in.
  enter("rings", t, 16.55, 18.5, [0, 0]);
  RINGS.forEach((ring, i) => {
    const p = ease((t - 16.8 - i * 0.12) / 0.9);
    put(`ringArc${i}`, "stroke-dashoffset", (1 - (ring.score / 100) * p).toFixed(3));
    put(`ringNum${i}`, "text", String(Math.round(ring.score * p)));
  });
}

export default function HeroFilm({ label, className }: { label: string; className?: string }) {
  const { set, ...film } = useFilm({ loop: LOOP, rest: REST, name: "hero-film", seek });

  return (
    <Film {...film} label={label} className={`hero-film ${className ?? ""}`}>
      <div ref={set("camera")} className="film__camera" aria-hidden>
        {/* 1. The nutritionist's protein check-in. */}
        <p ref={set("bubble")} className="hf-bubble" style={{ top: BUBBLE.top, height: BUBBLE.height }}>
          <span className="hf-bubble__mask">
            <span ref={set("bubbleText")} className="hf-bubble__text">
              {NUDGE}
            </span>
          </span>
        </p>
        {REPLIES.map((reply, i) => (
          <span key={reply} ref={set(`reply${i}`)} className="hf-c hf-reply" style={{ top: REPLY_TOP + i * 56 }}>
            <span className="hf-reply__n">{i + 1}</span>
            <span className="hf-reply__label">{reply}</span>
            <Icon name="chevronRight" size={12} />
          </span>
        ))}

        {/* The one shape, and what rides on it. */}
        <div ref={set("shape")} className="hf-shape" />
        <span ref={set("tapLabel")} className="hf-c hf-tap-label" style={{ top: REPLY_TOP }}>
          <span className="hf-reply__n">1</span>
          <span className="hf-reply__label">{REPLIES[0]}</span>
          <Icon name="chevronRight" size={12} />
        </span>
        <span ref={set("plus")} className="hf-c hf-plus">
          <Plus size={26} />
        </span>

        {/* 2. The Add sheet. */}
        <div ref={set("add")} className="hf-c hf-add">
          <span className="hf-add__tiles">
            <span className="hf-add__tile">
              <AppMark size={24} />
              Ask Nutritionist
            </span>
            <span ref={set("logMeal")} className="hf-add__tile">
              <Icon name="apple" size={22} />
              Log Meal
            </span>
          </span>
          <span className="hf-add__list">
            <span>
              <Icon name="glassWater" size={15} />
              Log Water
            </span>
            <span>
              <Icon name="pills" size={15} />
              Log Supplements
            </span>
            <span>
              <Icon name="scale" size={17} />
              Log Weight
            </span>
            <span>
              <Icon name="sparkles" size={17} />
              New Meal Plan
            </span>
          </span>
        </div>

        {/* 3. Describe your meal. */}
        <div ref={set("describe")} className="hf-c hf-describe">
          <span className="hf-title">Describe your meal</span>
          <span className="hf-helper">
            Amount, brand, and restaurant details help improve accuracy. <u>Learn more</u>
          </span>
          <span className="hf-composer">
            <span className="hf-composer__field">
              <span className="hf-typing">
                <span ref={set("typed")} />
                <span ref={set("caret")} className="hf-caret" />
                <span ref={set("hint")} className="hf-hint">
                  What did you eat?
                </span>
                <span className="hf-typing__end" />
              </span>
            </span>
            <span ref={set("media0")} className="hf-tile">
              <Icon name="microphone" size={17} />
            </span>
            <span ref={set("media1")} className="hf-tile">
              <Icon name="camera" size={17} />
            </span>
            <span ref={set("send")} className="hf-tile hf-tile--send">
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden>
                <path d="M12 19V5M5.5 11.5 12 5l6.5 6.5" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </span>
          <span className="hf-recent">Recent</span>
        </div>

        {/* 4. When did you eat this? */}
        <div ref={set("when")} className="hf-c hf-when">
          <span className="hf-title">When did you eat this?</span>
          <span className="hf-when__date">
            <Icon name="calendarDay" size={15} />
            <u>Fri, 16 Oct</u>
          </span>
          <span className="hf-wheel">
            <span className="hf-wheel__band" />
            <Wheel items={HOURS} list={set("wheelHour")} width={44} />
            <Wheel items={MINUTES} list={set("wheelMinute")} width={44} />
            <span className="hf-wheel__col" style={{ width: 44 }}>
              <span className="hf-wheel__list hf-wheel__list--ampm">
                <span>AM</span>
                <span>PM</span>
              </span>
            </span>
          </span>
          <span ref={set("confirm")} className="hf-confirm">
            Confirm
          </span>
        </div>

        {/* 5. The meal's row on the Log (its card is the shape). */}
        <div ref={set("row")} className="hf-row">
          <p ref={set("rowHead")} className="hf-c hf-row__head">
            <span className="hf-row__hour">6 PM</span>
            <span className="hf-row__time">6:45 PM</span>
            <span>454 kcal · 31g C · 46g P · 14g F</span>
          </p>
          <span className="hf-chips">
            <span ref={set("chip0")} className="hf-chip hf-chip--kcal">
              <Icon name="fire" size={12} />
              454 kcal
            </span>
            {CHIPS.map((c, i) => (
              <span key={c.icon} ref={set(`chip${i + 1}`)} className="hf-chip hf-chip--signal">
                <Icon name={c.icon} size={12} />
                {c.value}
              </span>
            ))}
          </span>
        </div>
        <span ref={set("fly")} className="hf-fly">
          <span ref={set("flyQuote0")}>&ldquo;</span>
          {MEAL}
          <span ref={set("flyQuote1")}>&rdquo;</span>
        </span>

        {/* 6. Eaten. */}
        <div ref={set("eaten")} className="hf-card hf-eaten">
          <div className="hf-eaten__head">
            <span className="hf-eaten__flame">
              <Icon name="fire" size={20} />
            </span>
            <span>
              <small>Eaten</small>
              <span className="hf-big">
                <b ref={set("eatenNum")}>{EATEN.after.toLocaleString("en-GB")}</b> <i>kcal</i>
              </span>
            </span>
            <span ref={set("onTrack")} className="hf-on-track">
              On track
            </span>
            <Icon name="chevronRight" size={12} className="hf-grey" />
          </div>
          <div className="hf-eaten__stats">
            <span>
              <small>Burned</small>
              <span className="hf-mid">
                <b>0</b> <i>kcal</i>
              </span>
            </span>
            <span>
              <small>Left</small>
              <span className="hf-mid">
                <b ref={set("left")}>{EATEN.goal - EATEN.after}</b> <i>kcal</i>
              </span>
            </span>
            <span>
              <small>Goal</small>
              <span className="hf-mid">
                <b>1,570</b> <i>kcal</i>
              </span>
            </span>
          </div>
          <span className="hf-bar">
            <span ref={set("bar")} style={{ scale: `${EATEN.after / EATEN.goal} 1` } as CSSProperties} />
          </span>
          <div className="hf-macros">
            {MACROS.map((m, i) => (
              <span key={m.label} className="hf-macro">
                <svg viewBox="0 0 22 22" width="22" height="22" aria-hidden>
                  <circle cx="11" cy="11" r="9" fill="none" stroke="#ff644f" strokeOpacity="0.2" strokeWidth="2.4" />
                  <circle
                    ref={set(`macroArc${i}`)}
                    cx="11"
                    cy="11"
                    r="9"
                    fill="none"
                    stroke="#ff644f"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    pathLength={1}
                    strokeDasharray="1"
                    strokeDashoffset={1 - m.after / m.goal}
                    transform="rotate(-90 11 11)"
                  />
                </svg>
                <span>
                  <b>{m.label}</b>
                  <small ref={set(`macro${i}`)}>
                    {m.after}/{m.goal}g
                  </small>
                </span>
              </span>
            ))}
          </div>
        </div>
        <span ref={set("kcalFly")} className="hf-chip hf-chip--kcal hf-kcal-fly">
          <Icon name="fire" size={12} />
          454 kcal
        </span>

        {/* 7. Energy, Satiety and Mood (their card is the shape). */}
        <div ref={set("rings")} className="hf-c hf-rings">
          {RINGS.map((ring, i) => (
            <span key={ring.label} className="hf-ring">
              <span className="hf-ring__dial">
                <svg viewBox="0 0 98 98" width="98" height="98" aria-hidden>
                  <circle cx="49" cy="49" r="43.5" fill="none" stroke="#40e300" strokeOpacity="0.16" strokeWidth="11" />
                  <circle
                    ref={set(`ringArc${i}`)}
                    cx="49"
                    cy="49"
                    r="43.5"
                    fill="none"
                    stroke="#40e300"
                    strokeWidth="11"
                    strokeLinecap="round"
                    pathLength={1}
                    strokeDasharray="1"
                    strokeDashoffset={1 - ring.score / 100}
                    transform="rotate(-90 49 49)"
                  />
                </svg>
                <b ref={set(`ringNum${i}`)}>{ring.score}</b>
              </span>
              <span className="hf-ring__label">
                <Icon name={ring.icon} size={13} className="hf-grey" />
                {ring.label}
                <Icon name="chevronRight" size={10} className="hf-grey" />
              </span>
            </span>
          ))}
        </div>
      </div>
    </Film>
  );
}
