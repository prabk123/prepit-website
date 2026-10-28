"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { trackVideoPlayed } from "@/lib/posthogAnalytics";
import { ICON as APP_ICON } from "@/components/ui/LongLogo";
import { FILM_ICONS, type FilmIconName } from "./filmIcons";

/*
 * "How it works" film (website motion experiment, after the Prompt Motion
 * pieces twoclipping-5cba86 and ultimaxbt-2ddf1e). An 18.6 second loop drawn
 * in code, one continuous take: one card morphs from the Log Meal sheet into
 * the logged meal, the Energy, Satiety and Mood rings, the insight and the
 * nutritionist's conversation, then the frame floods for the closing line.
 *
 * Prabodh agreed (28 Oct 2026) that this film may draw the app; every other
 * phone on the site stays a real capture. It redraws the app's own animated
 * demo on the Get started screen (fresca_app lib/widgets/get_started_hero_demo):
 * the same meal, numbers, insight and replies, and the same sizes, colours,
 * radii and icons, in app points on a 400 x 400 stage scaled to its box.
 *
 * Every style is computed from the time inside seek(t), with closed-form
 * springs, so a frame never depends on the one before it.
 */

const LOOP = 18.6;
const STAGE = 400;

// GetStartedHeroDemoData in the app.
const TYPED = "chicken wrap, an apple and a flat white";
const MEAL = {
  title: "Chicken wrap, an apple and a flat white",
  calories: 487,
  chips: [
    { value: 42, unit: "g", label: "Carbs" },
    { value: 26, unit: "g", label: "Protein" },
    { value: 19, unit: "g", label: "Fat" },
  ],
  items: [
    { name: "Chicken wrap", calories: 385 },
    { name: "Apple", calories: 52 },
    { name: "Flat white", calories: 50 },
  ],
  confidence: 78,
  notes:
    "Assumed a standard café chicken wrap (~280g). One medium apple (~182g). Regular flat white with whole milk (~240ml).",
};
const LOADING = [
  "Searching...",
  "Extracting items...",
  "Checking sources...",
  "Finalizing details...",
];
const SIGNALS = [
  { label: "Energy", score: 68 },
  { label: "Satiety", score: 52 },
  { label: "Mood", score: 71 },
];
const INSIGHT = {
  title: "Afternoon Energy looks soft",
  body: "Your wrap and flat white are light on protein. A Greek yogurt now would help hold Satiety until dinner.",
};
const CHAT_QUESTION = "Why is my afternoon energy soft after this lunch?";
const CHAT_REPLY = [
  "Your wrap and flat white are light on protein, which can leave Energy dipping mid-afternoon.",
  "A Greek yogurt now adds ~15g protein and helps hold Satiety until dinner.",
];
const CLOSING = ["The", "nutritionist", "that", "notices."];

/** The app's ring colours (ScoreRing.ringColorFor). */
const ringColor = (score: number) =>
  score >= 70 ? "#40e300" : score >= 40 ? "#ffb800" : "#ff644f";

/** Step response of a spring with a very small overshoot, 0 before it starts. */
function spring(t: number, period = 0.55, damping = 0.8) {
  if (t <= 0) return 0;
  const w = (2 * Math.PI) / period;
  const wd = w * Math.sqrt(1 - damping * damping);
  return (
    1 -
    Math.exp(-damping * w * t) *
      (Math.cos(wd * t) + ((damping * w) / wd) * Math.sin(wd * t))
  );
}

/** A value that springs to each new target at its time: [time, value][]. */
function track(keys: [number, number][], t: number, period?: number) {
  let v = keys[0][1];
  for (let i = 1; i < keys.length; i++)
    v += (keys[i][1] - keys[i - 1][1]) * spring(t - keys[i][0], period);
  return v;
}

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const ease = (x: number) => 1 - Math.pow(1 - clamp01(x), 3);

/** 0 to 1 over a window, in at `a` and out at `b`, with short soft edges. */
function windowed(t: number, a: number, b: number, edge = 0.25) {
  return clamp01((t - a) / edge) * (1 - clamp01((t - b) / (edge * 0.8)));
}

// The card's states: [time, centre y, height, grey (the chat sheet) 0..1].
const SHAPE: [number, number, number, number][] = [
  [0, 191, 142, 0], // Describe your meal
  [2.8, 215, 190, 0], // ... with the loading pill
  [4.7, 200, 352, 0], // the logged meal
  [8.6, 200, 118, 0], // Energy, Satiety, Mood
  [10.8, 200, 136, 0], // the insight
  [13.1, 225, 330, 1], // the conversation
  [17.6, 191, 142, 0], // back to the sheet, under the dark
];

/** One of the app's icon font glyphs. */
function Icon({
  name,
  size,
  className,
}: {
  name: FilmIconName;
  size: number;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 1000 1000"
      width={size}
      height={size}
      className={className}
      aria-hidden
    >
      <path d={FILM_ICONS[name]} fill="currentColor" />
    </svg>
  );
}

function ArrowUp({ size }: { size: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden>
      <path
        d="M12 19V5M5.5 11.5 12 5l6.5 6.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** The composer: a grey field, then microphone and camera tiles that become a send button. */
function Composer({
  hint,
  size,
  field,
}: {
  hint: string;
  size: number;
  field?: ReactNode;
}) {
  const tile = { width: size, height: size } as CSSProperties;
  return (
    <div className="hf-composer" style={{ height: size }}>
      <div className="hf-composer__field">
        {field ?? <span className="hf-hint">{hint}</span>}
      </div>
      <span className="hf-tile hf-tile--media" style={tile}>
        <Icon name="microphone" size={size * 0.4} />
      </span>
      <span className="hf-tile hf-tile--media" style={tile}>
        <Icon name="camera" size={size * 0.4} />
      </span>
    </div>
  );
}

export default function HowItWorksFilm({ label }: { label: string }) {
  const boxRef = useRef<HTMLDivElement>(null);
  const refs = useRef<Record<string, HTMLElement | SVGElement | null>>({});
  const written = useRef(new Map<string, string>());
  const set = (key: string) => (el: HTMLElement | SVGElement | null) => {
    refs.current[key] = el;
  };
  const [inView, setInView] = useState(false);
  const [allowed, setAllowed] = useState(false);
  const [userState, setUserState] = useState<"auto" | "paused" | "playing">(
    "auto",
  );
  const clock = useRef({ t: 6.6, last: 0, tracked: false });

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

  /** Fades a layer in or out with a little rise and blur. */
  const layer = (key: string, opacity: number, lift = 8) => {
    const o = Math.round(opacity * 100) / 100;
    put(key, "opacity", String(o));
    put(key, "visibility", o <= 0 ? "hidden" : "visible");
    put(key, "filter", o < 1 ? `blur(${((1 - o) * 4).toFixed(1)}px)` : "none");
    put(key, "translate", o < 1 ? `0 ${((1 - o) * lift).toFixed(1)}px` : "0 0");
  };

  /** Grows a grid row from 0 to its height (bubbles arriving in the chat). */
  const grow = (key: string, p: number) => {
    const v = Math.round(clamp01(p) * 100) / 100;
    put(key, "grid-template-rows", `${v}fr`);
    put(key, "opacity", String(v));
  };

  const seek = (t: number) => {
    const keys = (i: number) =>
      SHAPE.map((s) => [s[0], s[i]] as [number, number]);
    const cy = track(keys(1), t);
    const h = track(keys(2), t);
    const grey = clamp01(track(keys(3), t, 0.4));

    // Camera: pushed in on the sheet while typing, eases back for the cards.
    const zoom = track(
      [
        [0, 1.12],
        [2.8, 1.04],
        [4.7, 1],
        [8.6, 1.08],
        [10.8, 1.05],
        [13.1, 1],
        [17.6, 1.12],
      ],
      t,
      0.9,
    );
    put("camera", "transform", `scale(${zoom.toFixed(3)})`);

    put("shape", "height", `${h.toFixed(1)}px`);
    put("shape", "transform", `translateY(${(cy - h / 2).toFixed(1)}px)`);
    const shade = Math.round(255 - grey * (255 - 244));
    put(
      "shape",
      "background-color",
      `rgb(${shade} ${shade} ${Math.round(255 - grey * (255 - 245))})`,
    );

    // 1. Describe your meal: typing, send, then the loading pill and glow.
    layer("log", windowed(t, -1, 4.55, 0.2) + windowed(t, 17.9, 99, 0.2), 0);
    const typed = TYPED.slice(
      0,
      Math.floor(clamp01((t - 0.5) / 1.8) * TYPED.length),
    );
    put("typed", "text", typed);
    put("hint", "display", typed ? "none" : "inline");
    put(
      "caret",
      "opacity",
      t < 2.7 && Math.floor(t * 2.4) % 2 === 0 ? "1" : "0",
    );
    const sending = typed.length > 0;
    put("logComposer", "--hf-send", sending ? "1" : "0");
    put("send", "scale", (1 - 0.12 * windowed(t, 2.55, 2.8, 0.06)).toFixed(3));
    const loading = windowed(t, 2.8, 4.5, 0.2);
    put("glow", "opacity", loading.toFixed(2));
    if (loading > 0)
      put("glow", "--beam-angle", `${((t * 220) % 360).toFixed(0)}deg`);
    layer("pill", loading, 6);
    const stage = Math.min(
      LOADING.length - 1,
      Math.max(0, Math.floor((t - 2.8) / 0.42)),
    );
    put("pillText", "text", LOADING[stage]);

    // 2. The logged meal.
    layer("meal", windowed(t, 4.85, 8.45));
    put(
      "calories",
      "text",
      Math.round(MEAL.calories * ease((t - 5.0) / 1)).toLocaleString("en-GB"),
    );
    MEAL.chips.forEach((c, i) =>
      put(
        `chip${i}`,
        "text",
        `${Math.round(c.value * ease((t - 5.05 - i * 0.08) / 1))}${c.unit}`,
      ),
    );
    MEAL.items.forEach((_, i) =>
      layer(`item${i}`, windowed(t, 5.2 + i * 0.12, 99, 0.3), 6),
    );
    const gauge = ease((t - 5.6) / 1.1);
    put(
      "gaugeArc",
      "stroke-dashoffset",
      (1 - (MEAL.confidence / 100) * gauge).toFixed(3),
    );
    put("gaugeText", "text", String(Math.round(MEAL.confidence * gauge)));

    // 3. Energy, Satiety and Mood.
    layer("signals", windowed(t, 8.75, 10.65));
    SIGNALS.forEach((s, i) => {
      const p = ease((t - 9.0 - i * 0.06) / 1.1);
      put(
        `ring${i}`,
        "stroke-dashoffset",
        (1 - (s.score / 100) * p).toFixed(3),
      );
    });

    // 4. The insight, and a tap on its chip.
    layer("insight", windowed(t, 10.95, 12.95));
    put(
      "chip",
      "scale",
      (1 - 0.06 * windowed(t, 12.35, 12.6, 0.08)).toFixed(3),
    );

    // 5. The conversation: the question, then the reply one bubble at a time.
    layer("chat", windowed(t, 13.25, 16.35), 16);
    grow("q", (t - 13.4) / 0.3);
    put(
      "dots",
      "display",
      (t > 13.8 && t < 14.6) || (t > 15.0 && t < 15.7) ? "flex" : "none",
    );
    grow("a0", (t - 14.6) / 0.25);
    grow("a1", (t - 15.7) / 0.25);

    // 6. The dark floods out from the middle, the closing line rises on it,
    //    then it closes on the sheet and the loop starts again.
    const radius = 300 * ease((t - 16.35) / 0.6) * (1 - ease((t - 17.9) / 0.5));
    put("flood", "clip-path", `circle(${radius.toFixed(1)}px at 200px 200px)`);
    layer("closing", windowed(t, 16.6, 17.85, 0.2), 0);
    CLOSING.forEach((_, i) =>
      put(
        `cw${i}`,
        "translate",
        `0 ${(110 * (1 - ease((t - 16.7 - i * 0.09) / 0.6))).toFixed(1)}%`,
      ),
    );
    put(
      "underline",
      "stroke-dashoffset",
      (1 - ease((t - 17.25) / 0.5)).toFixed(3),
    );
  };

  // Scale the 400 pt stage to the box.
  useEffect(() => {
    const box = boxRef.current;
    if (!box) return;
    const fit = () =>
      box.style.setProperty("--film-scale", String(box.clientWidth / STAGE));
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
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const optedOut =
      new URLSearchParams(window.location.search).get("motion") === "off";
    setAllowed(!reduced && !optedOut);
    seek(clock.current.t);
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.35 },
    );
    observer.observe(box);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const running =
    inView && (userState === "playing" || (userState === "auto" && allowed));
  useEffect(() => {
    if (!running) return;
    if (!clock.current.tracked) {
      clock.current.tracked = true;
      trackVideoPlayed(
        "how-it-works-film",
        userState === "playing" ? "button" : "auto",
      );
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

  const showsPause =
    userState === "playing" || (userState === "auto" && allowed);

  return (
    <div ref={boxRef} className="how-film" data-reveal="rise">
      <div className="how-film__stage" role="img" aria-label={label}>
        <div ref={set("camera")} className="how-film__camera" aria-hidden>
          <div ref={set("shape")} className="how-film__shape" />

          {/* 1. Describe your meal (HeroDemoLogPhase). */}
          <div ref={set("log")} className="hf-layer hf-log">
            <span className="hf-grabber" />
            <p className="hf-sheet-title">Describe your meal</p>
            <p className="hf-helper">
              Amount, brand, and restaurant details help improve accuracy.{" "}
              <u>Learn more</u>
            </p>
            <div ref={set("logComposer")} className="hf-log__composer">
              <span ref={set("glow")} className="hf-glow" />
              <Composer
                hint="What did you eat?"
                size={40}
                field={
                  <span className="hf-typing">
                    <span ref={set("typed")} />
                    <span ref={set("caret")} className="hf-caret" />
                    <span ref={set("hint")} className="hf-hint">
                      What did you eat?
                    </span>
                    <span className="hf-typing__end" />
                  </span>
                }
              />
              <span ref={set("send")} className="hf-tile hf-tile--send">
                <ArrowUp size={18} />
              </span>
            </div>
            <span ref={set("pill")} className="hf-pill">
              <Icon name="sparkles" size={12} />
              <span ref={set("pillText")}>{LOADING[0]}</span>
            </span>
          </div>

          {/* 2. The logged meal (HeroDemoMealPhase). */}
          <div ref={set("meal")} className="hf-layer hf-meal">
            <p className="hf-meal__title">{MEAL.title}</p>
            <div className="hf-chips">
              <span className="hf-chip">
                <b ref={set("calories")}>{MEAL.calories}</b>
                <small>Calories</small>
              </span>
              {MEAL.chips.map((c, i) => (
                <span key={c.label} className="hf-chip">
                  <b ref={set(`chip${i}`)}>
                    {c.value}
                    {c.unit}
                  </b>
                  <small>{c.label}</small>
                </span>
              ))}
            </div>
            <div className="hf-items">
              {MEAL.items.map((item, i) => (
                <div key={item.name} ref={set(`item${i}`)} className="hf-item">
                  <span>{item.name}</span>
                  <span className="hf-cal">
                    <Icon name="fire" size={13} />
                    {item.calories} cal
                  </span>
                </div>
              ))}
            </div>
            <div className="hf-confidence">
              <span className="hf-gauge">
                <svg viewBox="0 0 88 46" width="88" height="46" aria-hidden>
                  <path
                    d="M6 42 A38 38 0 0 1 82 42"
                    fill="none"
                    stroke="#e9e9ea"
                    strokeWidth="8"
                    strokeLinecap="round"
                  />
                  <path
                    ref={set("gaugeArc")}
                    d="M6 42 A38 38 0 0 1 82 42"
                    fill="none"
                    stroke="#258400"
                    strokeWidth="8"
                    strokeLinecap="round"
                    pathLength={1}
                    strokeDasharray="1"
                    strokeDashoffset={1 - MEAL.confidence / 100}
                  />
                </svg>
                <b ref={set("gaugeText")}>{MEAL.confidence}</b>
              </span>
              <span>
                <b className="hf-confidence__level">High</b>
                <small>Confidence Level</small>
              </span>
            </div>
            <p className="hf-notes">{MEAL.notes}</p>
          </div>

          {/* 3. Energy, Satiety and Mood (HeroDemoSignalsPhase). */}
          <div ref={set("signals")} className="hf-layer hf-signals">
            {SIGNALS.map((s, i) => (
              <div key={s.label} className="hf-signal">
                <span className="hf-ring">
                  <svg viewBox="0 0 66 66" width="66" height="66" aria-hidden>
                    <circle
                      cx="33"
                      cy="33"
                      r="30.5"
                      fill="none"
                      stroke={ringColor(s.score)}
                      strokeOpacity="0.15"
                      strokeWidth="5"
                    />
                    <circle
                      ref={set(`ring${i}`)}
                      cx="33"
                      cy="33"
                      r="30.5"
                      fill="none"
                      stroke={ringColor(s.score)}
                      strokeWidth="5"
                      strokeLinecap="round"
                      pathLength={1}
                      strokeDasharray="1"
                      strokeDashoffset={1 - s.score / 100}
                      transform="rotate(-90 33 33)"
                    />
                  </svg>
                  <b>{s.score}</b>
                </span>
                <span className="hf-signal__label">
                  {s.label}
                  <Icon name="chevronRight" size={12} />
                </span>
              </div>
            ))}
          </div>

          {/* 4. The insight (HeroDemoInsightPhase). */}
          <div ref={set("insight")} className="hf-layer hf-insight">
            <div className="hf-insight__card">
              <p className="hf-insight__title">
                <Icon name="sparkles" size={18} />
                {INSIGHT.title}
              </p>
              <p className="hf-insight__body">{INSIGHT.body}</p>
            </div>
            <span ref={set("chip")} className="hf-action">
              Explore this deeper
              <Icon name="arrowRight" size={12} />
            </span>
          </div>

          {/* 5. The conversation (HeroDemoChatPhase). */}
          <div ref={set("chat")} className="hf-layer hf-chat">
            <span className="hf-grabber" />
            <p className="hf-chat__head">
              <svg viewBox="0 0 256 256" width="20" height="20" aria-hidden>
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d={APP_ICON}
                  fill="currentColor"
                />
              </svg>
              Nutritionist
            </p>
            <div className="hf-chat__messages">
              <div ref={set("q")} className="hf-grow hf-grow--user">
                <div>
                  <p className="hf-bubble hf-bubble--user">{CHAT_QUESTION}</p>
                </div>
              </div>
              {CHAT_REPLY.map((text, i) => (
                <div key={i} ref={set(`a${i}`)} className="hf-grow">
                  <div>
                    <p className="hf-bubble">{text}</p>
                  </div>
                </div>
              ))}
              <span ref={set("dots")} className="hf-dots">
                <i />
                <i />
                <i />
              </span>
            </div>
            <div className="hf-chat__composer">
              <Composer hint="Ask about your nutrition..." size={36} />
            </div>
          </div>

          {/* 6. The closing line, white on the dark. */}
          <div ref={set("flood")} className="how-film__flood" />
          <div ref={set("closing")} className="hf-layer hf-closing">
            {CLOSING.map((word, i) => (
              <span
                key={word}
                className={
                  i === CLOSING.length - 1 ? "relative inline-block" : undefined
                }
              >
                <span className="hf-mask">
                  <span ref={set(`cw${i}`)} className="hf-closing__word">
                    {word}
                  </span>
                </span>
                {i === CLOSING.length - 1 && (
                  <svg
                    viewBox="0 0 220 18"
                    preserveAspectRatio="none"
                    className="hf-underline"
                    aria-hidden
                  >
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
            <rect
              x="3"
              y="2"
              width="3.5"
              height="12"
              rx="1"
              fill="currentColor"
            />
            <rect
              x="9.5"
              y="2"
              width="3.5"
              height="12"
              rx="1"
              fill="currentColor"
            />
          </svg>
        ) : (
          <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden>
            <path
              d="M4 2.6v10.8a1 1 0 0 0 1.5.86l9-5.4a1 1 0 0 0 0-1.72l-9-5.4A1 1 0 0 0 4 2.6Z"
              fill="currentColor"
            />
          </svg>
        )}
      </button>
    </div>
  );
}
