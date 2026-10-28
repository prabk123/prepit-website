"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { trackVideoPlayed } from "@/lib/posthogAnalytics";
import { ICON as APP_ICON } from "@/components/ui/LongLogo";
import { FILM_ICONS, type FilmIconName } from "./filmIcons";

/*
 * "How it works" film (website motion experiment), staged after the Prompt
 * Motion pieces Prabodh picked: twoclipping-5cba86 (one shape morphing
 * through the UI with springs) and ultimaxbt-2ddf1e (one continuous take,
 * shared elements handed from screen to screen, a colour flood, text rising
 * from a mask line).
 *
 * The story is a real flow in today's app, drawn with the screens it really
 * uses and the showcase account's real day (the captures in public/app):
 * 1. the nutritionist's protein check-in, and a tap on "Bigger protein at dinner";
 * 2. the grey sheet collapses into that black reply, which becomes the + button;
 * 3. + opens the Add sheet, and Log Meal;
 * 4. "Mediterranean salmon bowl with quinoa" is typed and sent;
 * 5. "When did you eat this?": the wheel rolls to 6:45 PM, Confirm;
 * 6. the meal's name flies from the sheet into its row on the Log, with its
 *    chips (454 kcal, +15 +9 +19);
 * 7. its calories fly up to Eaten, which counts 1,027 to 1,481 and goes
 *    On track, then the camera rises to the day's Energy, Satiety and Mood;
 * 8. the frame floods dark for "The nutritionist that notices."
 *
 * Prabodh agreed (28 Oct 2026) that this film may draw the app in code. The
 * numbers before the salmon bowl are the day's totals minus that meal. Sizes
 * are app points: the 400 pt stage is the phone's width. Every style comes
 * from the time inside seek(t), with closed-form springs, so a frame never
 * depends on the one before it.
 */

const LOOP = 22;
const STAGE = 400;
/** Where the film rests before the script runs and under reduced motion. */
const REST = 16.9;

const NUDGE =
  "Over the past few weeks protein has been a little low: under your target on 18 of 21 logged days, about 127g a day against 158g. Most of the gap is at dinner, which averages about 39g. Two easy fixes that don't change what you cook: a bigger portion of the protein you already have at dinner, or a pot of Greek yogurt after dinner. Want to try one?";
const REPLIES = ["Bigger protein at dinner", "Greek yogurt after dinner", "Not now"];
const MEAL = "Mediterranean salmon bowl with quinoa";
const CHIPS: { icon: FilmIconName; value: string }[] = [
  { icon: "bolt", value: "+15" },
  { icon: "apple", value: "+9" },
  { icon: "spa", value: "+19" },
];
const YOGURT_CHIPS: { icon: FilmIconName; value: string }[] = [
  { icon: "bolt", value: "+1" },
  { icon: "apple", value: "+9" },
  { icon: "spa", value: "+7" },
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
const CLOSING = ["The", "nutritionist", "that", "notices."];

/** Step response of a spring with a little overshoot, 0 before it starts. */
function spring(t: number, period = 0.55, damping = 0.78) {
  if (t <= 0) return 0;
  const w = (2 * Math.PI) / period;
  if (damping >= 1) return 1 - Math.exp(-w * t) * (1 + w * t);
  const wd = w * Math.sqrt(1 - damping * damping);
  return 1 - Math.exp(-damping * w * t) * (Math.cos(wd * t) + ((damping * w) / wd) * Math.sin(wd * t));
}

/** A value that springs to each new target at its time: [time, value][]. */
function track(keys: [number, number][], t: number, period?: number, damping?: number) {
  let v = keys[0][1];
  for (let i = 1; i < keys.length; i++) v += (keys[i][1] - keys[i - 1][1]) * spring(t - keys[i][0], period, damping);
  return v;
}

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const ease = (x: number) => 1 - Math.pow(1 - clamp01(x), 3);
const mix = (a: number, b: number, p: number) => a + (b - a) * p;

/** 0 to 1 over a window, in at `a` and out at `b`, with short soft edges. */
function windowed(t: number, a: number, b: number, edge = 0.25) {
  return clamp01((t - a) / edge) * (1 - clamp01((t - b) / (edge * 0.8)));
}

/*
 * The one shape, in world points: [time, centre x, centre y, width, height,
 * radius, grey level (0 black, 1 white; the chat sheet is the app's #F4F4F5),
 * hairline border].
 */
const SHEET_GREY = 244 / 255;
const SHAPE: [number, number, number, number, number, number, number, number][] = [
  [0, 200, 330, 400, 620, 22, SHEET_GREY, 0], // the Nutritionist sheet
  [4.4, 200, 320, 368, 48, 12, 0, 0], // the tapped reply
  [5.2, 356, 356, 56, 56, 28, 0, 0], // the + button
  [6.45, 200, 305, 400, 270, 24, 1, 0], // the Add sheet
  [7.75, 200, 290, 400, 300, 24, 1, 0], // Describe your meal
  [10.45, 200, 265, 400, 350, 24, 1, 0], // When did you eat this?
  [12.85, 233.5, 415, 303, 90, 16, 1, 1], // the meal on the Log
  [20.4, 200, 330, 400, 620, 22, SHEET_GREY, 0], // the sheet again, under the dark
];
const shapeKeys = (i: number) => SHAPE.map((s) => [s[0], s[i]] as [number, number]);
const SHAPE_TRACKS = [1, 2, 3, 4, 5, 6, 7].map(shapeKeys);

/** The camera: pan (world to screen, in points) and zoom. */
const PAN: [number, number][] = [
  [0, 0],
  [2.6, -168],
  [4.4, 0],
  [12.85, -150],
  [15.0, 70],
  [17.0, 250],
  [20.4, 0],
];
const ZOOM: [number, number][] = [
  [0, 1],
  [4.4, 1.06],
  [6.3, 1],
  [7.75, 1.03],
  [10.45, 1],
  [12.85, 1.08],
  [15.0, 1],
];

type Setter = (key: string) => (el: HTMLElement | SVGElement | null) => void;

/** One of the app's icons. */
function Icon({ name, size, className }: { name: FilmIconName; size: number; className?: string }) {
  const icon = FILM_ICONS[name];
  return (
    <svg viewBox={icon.box} width={size} height={size} className={className} aria-hidden>
      <path d={icon.d} fill="currentColor" />
    </svg>
  );
}

function AppMark({ size }: { size: number }) {
  return (
    <svg viewBox="0 0 256 256" width={size} height={size} aria-hidden>
      <path fillRule="evenodd" clipRule="evenodd" d={APP_ICON} fill="currentColor" />
    </svg>
  );
}

/** A log row's chips: calories, then Energy, Satiety and Mood. */
function LogChips({ kcal, chips, set, prefix }: { kcal: number; chips: { icon: FilmIconName; value: string }[]; set?: Setter; prefix?: string }) {
  const ref = (i: number) => (set && prefix ? set(`${prefix}${i}`) : undefined);
  return (
    <span className="hf-chips">
      <span ref={ref(0)} className="hf-chip hf-chip--kcal">
        <Icon name="fire" size={12} />
        {kcal} kcal
      </span>
      {chips.map((c, i) => (
        <span key={c.icon} ref={ref(i + 1)} className="hf-chip hf-chip--signal">
          <Icon name={c.icon} size={12} />
          {c.value}
        </span>
      ))}
    </span>
  );
}

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

export default function HowItWorksFilm({ label }: { label: string }) {
  const boxRef = useRef<HTMLDivElement>(null);
  const refs = useRef<Record<string, HTMLElement | SVGElement | null>>({});
  const written = useRef(new Map<string, string>());
  const set: Setter = (key) => (el) => {
    refs.current[key] = el;
  };
  const [inView, setInView] = useState(false);
  const [allowed, setAllowed] = useState(false);
  const [userState, setUserState] = useState<"auto" | "paused" | "playing">("auto");
  const clock = useRef({ t: REST, last: 0, tracked: false });

  /** Sets a style (or "text") only when it changed since the last frame. */
  const put = (key: string, prop: string, value: string) => {
    const el = refs.current[key];
    if (!el) return;
    const id = `${key}.${prop}`;
    if (written.current.get(id) === value) return;
    written.current.set(id, value);
    if (prop === "text") el.textContent = value;
    else el.style.setProperty(prop, value);
  };

  /** Fades an element in or out with a little rise and blur. */
  const fade = (key: string, opacity: number, lift = 8) => {
    const o = Math.round(clamp01(opacity) * 100) / 100;
    put(key, "opacity", String(o));
    put(key, "visibility", o <= 0 ? "hidden" : "visible");
    put(key, "filter", o > 0 && o < 1 ? `blur(${((1 - o) * 4).toFixed(1)}px)` : "none");
    put(key, "translate", o < 1 ? `0 ${((1 - o) * lift).toFixed(1)}px` : "0 0");
  };

  /** A press: a quick dip in scale around `at`. */
  const press = (key: string, t: number, at: number) =>
    put(key, "scale", (1 - 0.07 * windowed(t, at - 0.1, at + 0.08, 0.08)).toFixed(3));

  /** A pop: springs in from nothing at `at`, gone again after `until`. */
  const pop = (key: string, t: number, at: number, until = 99) => {
    const s = t < until ? spring(t - at, 0.42, 0.55) : 0;
    put(key, "scale", s.toFixed(3));
    put(key, "opacity", (t < until ? clamp01((t - at) / 0.12) : 0).toFixed(2));
  };

  const seek = (t: number) => {
    const [cx, cy, w0, h0, r0, grey0, hair0] = SHAPE_TRACKS.map((keys, i) =>
      i >= 5 ? track(keys, t, 0.35, 1) : track(keys, t),
    );
    const w = Math.max(0, w0);
    const h = Math.max(0, h0);
    const pan = track(PAN, t, 1.1, 0.9);
    const zoom = track(ZOOM, t, 1, 0.9);

    put("camera", "transform", `scale(${zoom.toFixed(3)})`);
    put("world", "transform", `translateY(${pan.toFixed(1)}px)`);

    put("shape", "width", `${w.toFixed(1)}px`);
    put("shape", "height", `${h.toFixed(1)}px`);
    put("shape", "transform", `translate(${(cx - w / 2).toFixed(1)}px, ${(cy - h / 2).toFixed(1)}px)`);
    put("shape", "border-radius", `${Math.max(0, r0).toFixed(1)}px`);
    const level = Math.round(clamp01(grey0) * 255);
    put("shape", "background-color", `rgb(${level} ${level} ${Math.min(255, level + 1)})`);
    put("shape", "border-color", `rgb(233 233 234 / ${clamp01(hair0).toFixed(2)})`);
    press("shape", t, 6.25);

    // The dim behind each sheet, as in the app.
    put("scrim", "opacity", (0.3 * clamp01(windowed(t, -1, 4.45, 0.3) + windowed(t, 6.3, 12.75, 0.3) + windowed(t, 20.3, 99, 0.3))).toFixed(3));

    // 1. The protein check-in, then a tap on the first reply. At the end of
    //    the loop the sheet is back, empty, so the start follows on.
    fade("chat", windowed(t, -1, 4.3, 0.12) + windowed(t, 20.3, 99, 0.2), 0);
    fade("bubble", windowed(t, 0.35, 20.3, 0.35), 12);
    REPLIES.forEach((_, i) => fade(`reply${i}`, windowed(t, 1.6 + i * 0.12, 20.3, 0.3), 10));
    fade("replyOwn", windowed(t, 1.6 + REPLIES.length * 0.12, 20.3, 0.3), 10);
    const picked = t > 3.95 && t < 20.3;
    put("reply0", "background-color", picked ? "#000" : "#fff");
    put("reply0", "color", picked ? "#fff" : "#000");
    put("reply0", "border-color", picked ? "#000" : "#e9e9ea");
    press("reply0", t, 3.95);

    // 2. The + button, with the tab bar beside it.
    fade("plus", windowed(t, 5.0, 6.4, 0.2), 0);
    fade("nav", windowed(t, 4.95, 6.35, 0.3) + windowed(t, 12.9, 19.4, 0.3), 12);
    fade("fab", windowed(t, 12.9, 19.4, 0.3), 12);

    // 3. The Add sheet, and a tap on Log Meal.
    fade("add", windowed(t, 6.6, 7.6, 0.2), 10);
    press("logMeal", t, 7.4);

    // 4. Describe your meal: typing, then send.
    fade("describe", windowed(t, 7.95, 10.35, 0.2), 10);
    const typed = MEAL.slice(0, Math.floor(clamp01((t - 8.35) / 1.45) * MEAL.length));
    put("typed", "text", typed);
    put("hint", "display", typed ? "none" : "inline");
    put("caret", "opacity", t < 10.1 && Math.floor(t * 2.4) % 2 === 0 ? "1" : "0");
    const sending = clamp01((t - 8.35) / 0.25);
    [0, 1].forEach((i) => {
      put(`media${i}`, "width", `${mix(40, 0, sending).toFixed(1)}px`);
      put(`media${i}`, "opacity", (1 - sending).toFixed(2));
    });
    pop("send", t, 8.4);
    if (t > 9.9 && t < 10.3) press("send", t, 10.05);

    // 5. When did you eat this? The wheel rolls back to 6:45 PM, then Confirm.
    fade("when", windowed(t, 10.65, 12.75, 0.2), 10);
    const hour = mix(10, 6, ease((t - 11.0) / 0.9));
    const minute = mix(50, 45, ease((t - 11.25) / 0.8));
    put("wheelHour", "translate", `0 ${(2 * ROW - hour * ROW).toFixed(1)}px`);
    put("wheelMinute", "translate", `0 ${(2 * ROW - minute * ROW).toFixed(1)}px`);
    press("confirm", t, 12.45);

    // 6. The meal's name: quoted on the sheet, then handed to its row on the
    //    Log, where its time and chips arrive.
    const fly = spring(t - 12.75, 0.6, 0.85);
    fade("fly", windowed(t, 10.75, 20.3, 0.2), 0);
    put("fly", "transform", `translate(${mix(24, 96, fly).toFixed(1)}px, ${mix(178, 380, fly).toFixed(1)}px)`);
    const ink = Math.round(mix(77, 0, fly));
    put("fly", "color", `rgb(${ink} ${ink} ${Math.round(mix(89, 0, fly))})`);
    put("fly", "font-weight", fly > 0.5 ? "500" : "400");
    put("fly", "width", `${mix(352, 275, fly).toFixed(1)}px`);
    put("flyQuote0", "opacity", (1 - clamp01(fly * 3)).toFixed(2));
    put("flyQuote1", "opacity", (1 - clamp01(fly * 3)).toFixed(2));
    fade("newHead", windowed(t, 13.05, 20.3, 0.3), 6);
    [0, 1, 2, 3].forEach((i) => pop(`newChip${i}`, t, 13.45 + i * 0.13, 20.3));

    // 7. The calories fly up into Eaten, which counts up and goes On track.
    const up = spring(t - 15.0, 0.75, 0.9);
    put("kcalFly", "opacity", windowed(t, 14.95, 15.7, 0.05).toFixed(2));
    put("kcalFly", "transform", `translate(${mix(96, 74, up).toFixed(1)}px, ${mix(426, 36, up).toFixed(1)}px) scale(${mix(1, 1.3, up).toFixed(3)})`);
    const fill = ease((t - 15.55) / 1.2) * (1 - clamp01((t - 20.3) / 0.05));
    const eaten = Math.round(mix(EATEN.before, EATEN.after, fill));
    put("eaten", "text", eaten.toLocaleString("en-GB"));
    put("left", "text", String(EATEN.goal - eaten));
    put("bar", "scale", `${(eaten / EATEN.goal).toFixed(4)} 1`);
    pop("onTrack", t, 16.5, 20.3);
    MACROS.forEach((m, i) => {
      const v = Math.round(mix(m.before, m.after, fill));
      put(`macro${i}`, "text", `${v}/${m.goal}g`);
      put(`macroArc${i}`, "stroke-dashoffset", (1 - v / m.goal).toFixed(3));
    });

    // 8. The dark floods in from the middle, and the line rises out of it.
    const flood = 300 * ease((t - 18.9) / 0.8) * (1 - ease((t - 21.25) / 0.7));
    put("flood", "clip-path", `circle(${flood.toFixed(1)}px at 200px 200px)`);
    fade("closing", windowed(t, 19.3, 21.05, 0.1), 0);
    CLOSING.forEach((_, i) => {
      const s = spring(t - (19.4 + i * 0.09), 0.6, 0.8);
      put(`cw${i}`, "transform", `translateY(${((1 - s) * 110).toFixed(1)}%)`);
    });
    put("underline", "stroke-dashoffset", (1 - ease((t - 20.0) / 0.55)).toFixed(3));
  };

  // Scale the 400 pt stage to the box.
  useEffect(() => {
    const box = boxRef.current;
    if (!box) return;
    const fit = () => box.style.setProperty("--film-scale", String(box.clientWidth / STAGE));
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(box);
    return () => observer.disconnect();
  }, []);

  // Plays while on screen: on its own unless motion is reduced or turned off,
  // otherwise once Play is pressed. Paused always wins.
  useEffect(() => {
    const box = boxRef.current;
    if (!box) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const optedOut = new URLSearchParams(window.location.search).get("motion") === "off";
    setAllowed(!reduced && !optedOut);
    seek(clock.current.t);
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.35 });
    observer.observe(box);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const running = inView && (userState === "playing" || (userState === "auto" && allowed));
  useEffect(() => {
    if (!running) return;
    if (!clock.current.tracked) {
      clock.current.tracked = true;
      trackVideoPlayed("how-it-works-film", userState === "playing" ? "button" : "auto");
    }
    let frame = 0;
    clock.current.last = performance.now();
    const tick = (now: number) => {
      const c = clock.current;
      c.t = (c.t + Math.min(0.1, (now - c.last) / 1000)) % LOOP;
      c.last = now;
      seek(c.t);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  const showsPause = userState === "playing" || (userState === "auto" && allowed);

  return (
    <div ref={boxRef} className="how-film" data-reveal="rise">
      <div className="how-film__stage" role="img" aria-label={label}>
        <div ref={set("camera")} className="how-film__camera" aria-hidden>
          <div ref={set("world")} className="hf-world">
            {/* Home on the showcase account's day: the rings, Eaten, the Log. */}
            <div className="hf-card hf-rings">
              {RINGS.map((ring) => (
                <span key={ring.label} className="hf-ring">
                  <span className="hf-ring__dial">
                    <svg viewBox="0 0 98 98" width="98" height="98" aria-hidden>
                      <circle cx="49" cy="49" r="43.5" fill="none" stroke="#40e300" strokeOpacity="0.16" strokeWidth="11" />
                      <circle
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
                    <b>{ring.score}</b>
                  </span>
                  <span className="hf-ring__label">
                    <Icon name={ring.icon} size={13} className="hf-green" />
                    {ring.label}
                    <Icon name="chevronRight" size={10} className="hf-grey" />
                  </span>
                </span>
              ))}
            </div>

            <div className="hf-card hf-eaten">
              <div className="hf-eaten__head">
                <span className="hf-eaten__flame">
                  <Icon name="fire" size={20} />
                </span>
                <span>
                  <small>Eaten</small>
                  <span className="hf-big">
                    <b ref={set("eaten")}>{EATEN.after.toLocaleString("en-GB")}</b> <i>kcal</i>
                  </span>
                </span>
                <span ref={set("onTrack")} className="hf-on-track">
                  On track
                </span>
                <Icon name="chevronRight" size={12} className="hf-grey hf-eaten__chevron" />
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

            <p className="hf-log__head hf-log__head--yogurt">
              <span className="hf-log__hour">3 PM</span>
              <span className="hf-log__time">3:45 PM</span>
              <span className="hf-log__macros">168 kcal · 17g C · 13g P · 7g F</span>
            </p>
            <div className="hf-log__card hf-log__card--yogurt">
              <p>Greek yogurt with raspberries</p>
              <LogChips kcal={168} chips={YOGURT_CHIPS} />
            </div>
            <p ref={set("newHead")} className="hf-log__head hf-log__head--new">
              <span className="hf-log__hour">6 PM</span>
              <span className="hf-log__time">6:45 PM</span>
              <span className="hf-log__macros">454 kcal · 31g C · 46g P · 14g F</span>
            </p>

            <div ref={set("scrim")} className="hf-scrim" />
            <div ref={set("shape")} className="how-film__shape" />

            {/* The salmon bowl's chips on the Log (its card is the shape). */}
            <span className="hf-new-chips">
              <LogChips kcal={454} chips={CHIPS} set={set} prefix="newChip" />
            </span>

            {/* 1. The nutritionist's protein check-in. */}
            <div ref={set("chat")} className="hf-layer hf-chat">
              <span className="hf-grabber" />
              <p className="hf-chat__head">
                <AppMark size={20} />
                Nutritionist
              </p>
              <p className="hf-new">
                <span>NEW</span>
              </p>
              <p ref={set("bubble")} className="hf-bubble">
                {NUDGE}
              </p>
              <div className="hf-replies">
                {REPLIES.map((reply, i) => (
                  <span key={reply} ref={set(`reply${i}`)} className="hf-reply">
                    <span className="hf-reply__n">{i + 1}</span>
                    <span className="hf-reply__label">{reply}</span>
                    <Icon name="chevronRight" size={12} />
                  </span>
                ))}
                <span ref={set("replyOwn")} className="hf-reply">
                  <span className="hf-reply__n">
                    <Icon name="pencil" size={11} />
                  </span>
                  <span className="hf-reply__label">Type your own</span>
                  <Icon name="chevronRight" size={12} />
                </span>
              </div>
            </div>

            {/* 2. The + button's cross (the button is the shape). */}
            <span ref={set("plus")} className="hf-layer hf-plus">
              <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden>
                <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
              </svg>
            </span>

            {/* 3. The Add sheet (its white is the shape). */}
            <div ref={set("add")} className="hf-layer hf-sheet hf-add">
              <span className="hf-grabber" />
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
                  <Icon name="glassWater" size={16} />
                  Log Water
                </span>
                <span>
                  <Icon name="pills" size={16} />
                  Log Supplements
                </span>
                <span>
                  <Icon name="scale" size={18} />
                  Log Weight
                </span>
                <span>
                  <Icon name="sparkles" size={18} />
                  New Meal Plan
                </span>
              </span>
            </div>

            {/* 4. Describe your meal. */}
            <div ref={set("describe")} className="hf-layer hf-sheet hf-describe">
              <span className="hf-grabber" />
              <span className="hf-sheet__title">Describe your meal</span>
              <span className="hf-sheet__helper">
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
              <span className="hf-search">
                <Icon name="search" size={14} />
                Search recents
              </span>
            </div>

            {/* 5. When did you eat this? */}
            <div ref={set("when")} className="hf-layer hf-sheet hf-when">
              <span className="hf-grabber" />
              <span className="hf-sheet__title">When did you eat this?</span>
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

            {/* The meal's name, handed from the time sheet to its row on the Log. */}
            <span ref={set("fly")} className="hf-fly">
              <span ref={set("flyQuote0")}>&ldquo;</span>
              {MEAL}
              <span ref={set("flyQuote1")}>&rdquo;</span>
            </span>
            <span ref={set("kcalFly")} className="hf-chip hf-chip--kcal hf-kcal-fly">
              <Icon name="fire" size={12} />
              454 kcal
            </span>
          </div>

          {/* The tab bar and + button, fixed to the screen. */}
          <span ref={set("nav")} className="hf-layer hf-nav">
            <span className="hf-nav__tab hf-nav__tab--on">
              <Icon name="homeLeaf" size={18} />
              Home
            </span>
            <span className="hf-nav__tab">
              <Icon name="goal" size={18} />
              Progress
            </span>
            <span className="hf-nav__tab">
              <Icon name="calendarDay" size={18} />
              Plan
            </span>
          </span>
          <span ref={set("fab")} className="hf-layer hf-fab">
            <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden>
              <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
            </svg>
          </span>

          {/* The dark, and the closing line rising on it. */}
          <div ref={set("flood")} className="how-film__flood" />
          <div ref={set("closing")} className="hf-layer hf-closing">
            {CLOSING.map((word, i) => (
              <span key={word} className={i === CLOSING.length - 1 ? "relative inline-block" : undefined}>
                <span className="hf-mask">
                  <span ref={set(`cw${i}`)} className="hf-closing__word">
                    {word}
                  </span>
                </span>
                {i === CLOSING.length - 1 && (
                  <svg viewBox="0 0 220 18" preserveAspectRatio="none" className="hf-underline" aria-hidden>
                    <path
                      ref={set("underline")}
                      d="M3 12 C 50 4, 120 3, 217 9"
                      fill="none"
                      stroke="var(--color-accent)"
                      strokeWidth="5"
                      strokeLinecap="round"
                      pathLength={1}
                      strokeDasharray="1"
                    />
                  </svg>
                )}
                {i < CLOSING.length - 1 && " "}
              </span>
            ))}
          </div>
        </div>
      </div>
      <button
        type="button"
        className="loop-video__toggle"
        aria-label={showsPause ? "Pause animation" : "Play animation"}
        onClick={() => setUserState(showsPause ? "paused" : "playing")}
      >
        {showsPause ? (
          <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden>
            <rect x="3" y="2" width="3.5" height="12" rx="1" fill="currentColor" />
            <rect x="9.5" y="2" width="3.5" height="12" rx="1" fill="currentColor" />
          </svg>
        ) : (
          <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden>
            <path d="M4 2.6v10.8a1 1 0 0 0 1.5.86l9-5.4a1 1 0 0 0 0-1.72l-9-5.4A1 1 0 0 0 4 2.6Z" fill="currentColor" />
          </svg>
        )}
      </button>
    </div>
  );
}
