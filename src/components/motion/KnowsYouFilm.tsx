"use client";

import { Film, cameraAt, clamp01, columns, ease, easeIn, moves, track, useFilm } from "./filmKit";

/*
 * "First, it gets to know you" film (website motion experiment): the app's
 * real consultation focus picker and weekly check-in report, floating on the
 * page and staged like the hero film. The copy and numbers are the showcase
 * account's, from the captures in public/app (20-focus-picker,
 * 11-check-in-report):
 * 1. Pick your focus: "Front-load protein at breakfast" is picked as the main
 *    focus, then "Even out the day" as the second, and Continue;
 * 2. the picker becomes the week's check-in: "Your steadiest week yet", the
 *    Lose fat goal card (79.2 kg, On pace);
 * 3. the camera moves down to Calories: the week's bars rise round the
 *    1,570 target;
 * 4. the report leaves and the picker comes back for the next loop.
 */

const LOOP = 13.6;
const REST = 9.6;

const OPTIONS = [
  {
    title: "Front-load protein at breakfast",
    detail: "Breakfasts average about 7g protein — the lightest protein moment of the day.",
    tag: "Main focus",
  },
  {
    title: "Even out the day",
    detail: "Days tend to be back-loaded: dinners average 960 kcal vs 310 kcal at breakfast.",
    tag: "Second focus",
  },
  {
    title: "Make snacks work harder",
    detail: "Snacking carries real weight — about 430 kcal on days it happens.",
    tag: "",
  },
];
/** When each option is picked, and when Continue is pressed. */
const PICKS = [1.7, 2.6];
const CONTINUE = 3.6;
const REPORT = 4.3;
/** The week's calories as the bars draw them, against the 1,570 target. */
const BARS = [
  { day: "T", h: 0.97 },
  { day: "W", h: 0.98 },
  { day: "T", h: 0.94 },
  { day: "F", h: 0.92 },
  { day: "S", h: 1.08 },
  { day: "S", h: 0.97 },
  { day: "M", h: 0.98 },
];

/* The one shape: [time, centre x, centre y, width, height, radius]. */
const SHAPE: [number, number, number, number, number, number][] = [
  [0, 200, 201, 364, 376, 20], // Pick your focus
  [REPORT, 200, 270, 364, 240, 16], // the Goal card
  [12.75, 200, 201, 364, 376, 20], // Pick your focus again
];
const SHAPE_TRACKS = columns(SHAPE, 5);

const CAMERA: [number, number, number, number][] = [
  [0, 1, 200, 200],
  [CONTINUE - 0.3, 1.06, 200, 250], // in on the picks and Continue
  [REPORT, 1, 200, 200],
  [8.3, 1, 200, 470], // down to Calories
  [12.75, 1, 200, 200],
];

function seek(t: number, put: (key: string, prop: string, value: string) => void) {
  const { enter, press, pop, rise } = moves(put);
  put("camera", "transform", cameraAt(CAMERA, t));

  const [cx, cy, w, h, r] = SHAPE_TRACKS.map((keys) => track(keys, t));
  put("shape", "width", `${w.toFixed(1)}px`);
  put("shape", "height", `${h.toFixed(1)}px`);
  put("shape", "transform", `translate(${(cx - w / 2).toFixed(1)}px, ${(cy - h / 2).toFixed(1)}px)`);
  put("shape", "border-radius", `${r.toFixed(1)}px`);
  put("shape", "visibility", "visible");

  // 1. Pick your focus: two picks, then Continue. It starts coming in as
  // the shape gets back to the picker, before the loop wraps.
  const p = t > LOOP - 0.8 ? t - LOOP : t;
  enter("pickHead", p, -0.6, REPORT - 0.4, [0, -30]);
  OPTIONS.forEach((_, i) => {
    enter(`opt${i}`, p, -0.45 + i * 0.12, REPORT - 0.45 + i * 0.05, [i % 2 ? 420 : -420, 0]);
    const at = PICKS[i];
    if (at === undefined) return;
    press(`opt${i}`, t, at);
    const on = t > at && t < REPORT;
    put(`check${i}`, "background-color", on ? "#000" : "#fff");
    put(`check${i}`, "border-color", on ? "#000" : "#d3d3d5");
    pop(`tick${i}`, t, at, REPORT);
    pop(`tag${i}`, t, at + 0.05, REPORT);
  });
  enter("continue", p, 0, REPORT - 0.4, [0, 60]);
  const ready = p > PICKS[0];
  put("continue", "background-color", ready ? "#000" : "#a6a6ac");
  if (t > CONTINUE - 0.3 && t < CONTINUE + 0.3) press("continue", t, CONTINUE);

  // 2. The check-in: the date, the headline rising, the summary, the goal.
  const out = 12.15;
  enter("date", t, REPORT + 0.1, out);
  enter("head", t, REPORT + 0.1, out);
  rise("headText", t, REPORT + 0.15);
  enter("summary", t, REPORT + 0.45, out);
  enter("goal", t, REPORT + 0.5, out - 0.1);
  put("spark", "stroke-dashoffset", (1 - ease((t - REPORT - 0.8) / 1.0)).toFixed(3));
  put("sparkFill", "opacity", (0.9 * ease((t - REPORT - 1.4) / 0.6) * (1 - clamp01((t - out) / 0.3))).toFixed(2));
  pop("onPace", t, REPORT + 1.8, out);

  // 3. Calories: the week's bars rise round the target.
  enter("calories", t, 7.9, out + 0.1, [0, -60]);
  BARS.forEach((bar, i) => {
    const grow = ease((t - 8.7 - i * 0.08) / 0.6) * (1 - easeIn((t - out) / 0.3));
    put(`bar${i}`, "scale", `1 ${(grow * bar.h).toFixed(3)}`);
  });
}

export default function KnowsYouFilm({ label, className }: { label: string; className?: string }) {
  const { set, ...film } = useFilm({ loop: LOOP, rest: REST, name: "knows-you-film", seek });

  return (
    <Film {...film} label={label} className={`knows-film ${className ?? ""}`}>
      <div ref={set("camera")} className="film__camera" aria-hidden>
        <div ref={set("shape")} className="kf-shape" />

        {/* 1. Pick your focus. */}
        <p ref={set("pickHead")} className="kf-c kf-pick-head">
          <b>Pick your focus</b>
          <span>Choose one, or two. Your first pick is your main focus.</span>
        </p>
        {OPTIONS.map((option, i) => (
          <span key={option.title} ref={set(`opt${i}`)} className="kf-c kf-option" style={{ top: 82 + i * 86 }}>
            <span className="kf-option__text">
              <b>{option.title}</b>
              <span>{option.detail}</span>
            </span>
            <span ref={set(`check${i}`)} className="kf-check">
              <svg ref={set(`tick${i}`)} viewBox="0 0 16 16" width="14" height="14" aria-hidden>
                <path d="M3.5 8.5 6.5 11.5 12.5 4.5" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            {option.tag && (
              <span ref={set(`tag${i}`)} className="kf-tag">
                {option.tag}
              </span>
            )}
          </span>
        ))}
        <span ref={set("continue")} className="kf-c kf-continue">
          Continue
        </span>

        {/* 2. The week's check-in. */}
        <p ref={set("date")} className="kf-c kf-date">
          6 Oct – 12 Oct
        </p>
        <p ref={set("head")} className="kf-c kf-head">
          <span className="kf-mask">
            <span ref={set("headText")} className="kf-head__text">
              Your steadiest week yet
            </span>
          </span>
        </p>
        <p ref={set("summary")} className="kf-c kf-summary">
          Protein at lunch and fibre-rich breakfasts kept your Energy and Satiety in the green almost every day. You
          logged all seven days and stayed close to your calorie target.
        </p>
        <div ref={set("goal")} className="kf-c kf-goal">
          <small>Goal</small>
          <b className="kf-goal__title">Lose fat</b>
          <span className="kf-muted">Calories near target and weight is trending down</span>
          <span className="kf-goal__weights">
            <svg viewBox="0 0 100 50" width="100" height="50" aria-hidden>
              <defs>
                <linearGradient id="kf-spark-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#ff644f" stopOpacity="0.35" />
                  <stop offset="1" stopColor="#ff644f" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path
                ref={set("sparkFill")}
                d="M2 6 L10 10 L16 9 L24 16 L32 18 L40 22 L46 21 L54 28 L62 30 L70 34 L78 36 L84 40 L92 41 L98 46 L98 50 L2 50 Z"
                fill="url(#kf-spark-fill)"
              />
              <path
                ref={set("spark")}
                d="M2 6 L10 10 L16 9 L24 16 L32 18 L40 22 L46 21 L54 28 L62 30 L70 34 L78 36 L84 40 L92 41 L98 46"
                fill="none"
                stroke="#ff644f"
                strokeWidth="1.6"
                strokeLinejoin="round"
                pathLength={1}
                strokeDasharray="1"
              />
            </svg>
            <span>
              <span className="kf-num">
                79.2 <i>kg</i>
              </span>
              <small>Weight</small>
            </span>
            <span className="kf-right">
              <span className="kf-num">
                75.0 <i>kg</i>
              </span>
              <small>Goal weight</small>
            </span>
          </span>
          <span className="kf-row">
            <b>Pace</b>
            <span>-0.4 kg/week</span>
          </span>
          <span className="kf-row">
            <b>Goal pace</b>
            <span>-0.3 kg/week</span>
          </span>
          <span ref={set("onPace")} className="kf-pill">
            <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden>
              <path d="M3.5 8.5 6.5 11.5 12.5 4.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            On pace
          </span>
        </div>

        {/* 3. Calories. */}
        <div ref={set("calories")} className="kf-c kf-calories">
          <small>Calories</small>
          <span className="kf-goal__weights kf-calories__nums">
            <span>
              <span className="kf-num">
                1,562 <i>cal</i>
              </span>
              <small>Avg of 7 logged days</small>
            </span>
            <span className="kf-right">
              <span className="kf-num">
                1,570 <i>cal</i>
              </span>
              <small>Target</small>
            </span>
          </span>
          <span className="kf-bars">
            <span className="kf-bars__target" />
            {BARS.map((bar, i) => (
              <span key={i} className="kf-bars__col">
                <span ref={set(`bar${i}`)} className="kf-bars__bar" style={{ scale: `1 ${bar.h}` }} />
                <span className="kf-bars__day">{bar.day}</span>
              </span>
            ))}
          </span>
          <span className="kf-muted">Three proper meals a day kept you close to target without a late-evening top-up.</span>
        </div>
      </div>
    </Film>
  );
}
