"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { trackVideoPlayed } from "@/lib/posthogAnalytics";

/*
 * "How it works" film (website motion experiment, after the Prompt Motion
 * pieces twoclipping-5cba86 and ultimaxbt-2ddf1e). A 15 second loop drawn in
 * code, one continuous take: one shape morphs from the message box into the
 * sent message, the logged meal, the Energy, Satiety and Mood rings, the
 * nutritionist's reply, and finally floods the frame for the closing line.
 *
 * Prabodh agreed (28 Oct 2026) that this film may draw the app in a
 * stylised way; every other phone on the site stays a real capture. The
 * nutrition figures are a typical estimate for two boiled eggs and a slice
 * of buttered wholemeal toast, and the three scores are illustrative.
 *
 * Every style is computed from the time inside seek(t), with closed-form
 * springs, so a frame never depends on the one before it. The stage is drawn
 * at 800 x 800 and scaled to its box.
 */

const LOOP = 15;
const STAGE = 800;

const TYPED = "Two eggs and buttered toast";
const NUDGE = "Good start. 16g of protein at breakfast is what keeps the 3pm dip away.";
const CLOSING = ["The", "nutritionist", "that", "notices."];

const ITEMS = [
  { name: "2 boiled eggs", kcal: 143 },
  { name: "Buttered wholemeal toast", kcal: 130 },
];
const TOTAL_KCAL = 273;
const MACROS = [
  { name: "Protein", grams: 16, share: 0.62 },
  { name: "Carbs", grams: 15, share: 0.4 },
  { name: "Fat", grams: 16, share: 0.55 },
];
const SCORES = [
  { name: "Energy", score: 78, color: "var(--color-energy)" },
  { name: "Satiety", score: 82, color: "var(--color-satiety)" },
  { name: "Mood", score: 74, color: "var(--color-mood)" },
];

/** Step response of a spring with a very small overshoot, 0 before it starts. */
function spring(t: number, period = 0.55, damping = 0.82) {
  if (t <= 0) return 0;
  const w = (2 * Math.PI) / period;
  const wd = w * Math.sqrt(1 - damping * damping);
  return 1 - Math.exp(-damping * w * t) * (Math.cos(wd * t) + ((damping * w) / wd) * Math.sin(wd * t));
}

/** A value that springs to each new target at its time: [time, value][]. */
function track(keys: [number, number][], t: number, period?: number) {
  let v = keys[0][1];
  for (let i = 1; i < keys.length; i++) v += (keys[i][1] - keys[i - 1][1]) * spring(t - keys[i][0], period);
  return v;
}

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const ease = (x: number) => 1 - Math.pow(1 - clamp01(x), 3);

/** 0 to 1 over a window, in at `a` and out at `b`, with short soft edges. */
function windowed(t: number, a: number, b: number, edge = 0.28) {
  return clamp01((t - a) / edge) * (1 - clamp01((t - b) / (edge * 0.8)));
}

// The shape's states: [time, x centre, y centre, width, height, radius].
const SHAPE: [number, number, number, number, number, number][] = [
  [0, 400, 400, 600, 84, 42], // the message box
  [3.25, 500, 210, 420, 72, 26], // the sent message
  [4.25, 400, 430, 560, 430, 36], // the logged meal
  [7.7, 400, 420, 600, 220, 110], // the three rings
  [10.2, 380, 400, 600, 230, 32], // the nutritionist's reply
  [14.2, 400, 400, 600, 84, 42], // back to the message box, under the dark
];

function shapeAt(t: number) {
  const keys = (i: number) => SHAPE.map((s) => [s[0], s[i]] as [number, number]);
  return {
    x: track(keys(1), t),
    y: track(keys(2), t),
    w: track(keys(3), t),
    h: track(keys(4), t),
    r: Math.max(0, track(keys(5), t)),
  };
}

function layer(el: HTMLElement | null, opacity: number, lift = 14) {
  if (!el) return;
  el.style.opacity = opacity.toFixed(3);
  el.style.filter = opacity < 0.999 ? `blur(${((1 - opacity) * 8).toFixed(2)}px)` : "";
  el.style.translate = `0 ${((1 - opacity) * lift).toFixed(1)}px`;
  el.style.visibility = opacity <= 0.001 ? "hidden" : "";
}

export default function HowItWorksFilm({ label }: { label: string }) {
  const boxRef = useRef<HTMLDivElement>(null);
  const refs = useRef<Record<string, HTMLElement | null>>({});
  const set = (key: string) => (el: HTMLElement | null) => {
    refs.current[key] = el;
  };
  const [playing, setPlaying] = useState(false);
  const [userPaused, setUserPaused] = useState(false);
  const [allowed, setAllowed] = useState(false);
  const clock = useRef({ t: 6.6, last: 0, tracked: false });

  const seek = (t: number) => {
    const r = refs.current;
    const s = shapeAt(t);

    // Camera: pushed in on the message box, pulls back once it's sent.
    const zoom = track([[0, 1.14], [3.2, 1], [7.7, 1.04], [10.2, 1], [14.45, 1.14]], t, 0.9);
    if (r.camera) r.camera.style.transform = `scale(${zoom.toFixed(4)})`;

    if (r.shape) {
      r.shape.style.width = `${s.w.toFixed(1)}px`;
      r.shape.style.height = `${s.h.toFixed(1)}px`;
      r.shape.style.transform = `translate(${(s.x - s.w / 2).toFixed(1)}px, ${(s.y - s.h / 2).toFixed(1)}px)`;
      r.shape.style.borderRadius = `${s.r.toFixed(1)}px`;
    }

    // The glow round the message box while it waits.
    const glow = windowed(t, -1, 3.1, 0.3) + windowed(t, 14.5, 99, 0.4);
    if (r.glow) {
      r.glow.style.opacity = (glow * 0.9).toFixed(3);
      // The colours turn round the box; the box itself stays put.
      r.glow.style.background = `conic-gradient(from ${(t * 60).toFixed(1)}deg at 50% 50%, #809ff9, #d093d9, #f38c61, #f5cc77, #809ff9)`;
    }

    // Scene 1: typing.
    const typed = Math.floor(clamp01((t - 0.6) / 2.1) * TYPED.length);
    if (r.typed) r.typed.textContent = TYPED.slice(0, typed);
    if (r.caret) r.caret.style.opacity = t < 3.1 && Math.floor(t * 2.4) % 2 === 0 ? "1" : "0";
    layer(r.composer, windowed(t, -1, 3.15, 0.2) + windowed(t, 14.45, 99, 0.25), 0);
    if (r.send) {
      const press = 1 - 0.14 * windowed(t, 2.95, 3.15, 0.08);
      r.send.style.scale = press.toFixed(3);
    }
    const ripple = clamp01((t - 3.1) / 0.6);
    if (r.ripple) {
      r.ripple.style.opacity = ripple > 0 && ripple < 1 ? (0.5 * (1 - ripple)).toFixed(3) : "0";
      r.ripple.style.scale = (0.2 + ease(ripple) * 3).toFixed(3);
    }

    // Scene 2: the sent message.
    layer(r.sent, windowed(t, 3.35, 4.2, 0.22));

    // Scene 3: the logged meal.
    layer(r.meal, windowed(t, 4.4, 7.65));
    ITEMS.forEach((_, i) => layer(r[`item${i}`], windowed(t, 4.75 + i * 0.16, 99), 10));
    const kcal = Math.round(TOTAL_KCAL * ease((t - 5.1) / 1.1));
    if (r.kcal) r.kcal.textContent = String(Math.max(0, kcal));
    MACROS.forEach((m, i) => {
      const bar = r[`bar${i}`];
      if (bar) bar.style.scale = `${(m.share * ease((t - 5.4 - i * 0.12) / 1)).toFixed(3)} 1`;
    });

    // Scene 4: the rings.
    layer(r.rings, windowed(t, 7.85, 10.1));
    SCORES.forEach((s2, i) => {
      const p = ease((t - 8.1 - i * 0.18) / 1.3);
      const arc = r[`arc${i}`];
      if (arc) arc.style.strokeDashoffset = (100 - s2.score * p).toFixed(2);
      const n = r[`score${i}`];
      if (n) n.textContent = String(Math.round(s2.score * p));
    });

    // Scene 5: the nutritionist's reply, word by word.
    layer(r.nudge, windowed(t, 10.3, 12.6));
    const words = NUDGE.split(" ");
    const shown = Math.floor(clamp01((t - 10.5) / 1.3) * words.length);
    words.forEach((_, i) => {
      const w = r[`nw${i}`];
      if (w) w.style.opacity = i < shown ? "1" : "0";
    });

    // Scene 6: dark floods out from the reply, the closing line rises on it,
    // then the dark closes in on the message box and the loop starts again.
    if (r.flood) {
      const radius = 1150 * ease((t - 12.6) / 0.6) * (1 - ease((t - 14.1) / 0.5));
      r.flood.style.clipPath = `circle(${radius.toFixed(1)}px at 400px 400px)`;
    }

    // The closing line, white on the dark.
    layer(r.closing, windowed(t, 13.0, 14.0, 0.2), 0);
    CLOSING.forEach((_, i) => {
      const w = r[`cw${i}`];
      if (w) w.style.translate = `0 ${(110 * (1 - ease((t - 13.05 - i * 0.09) / 0.6))).toFixed(1)}%`;
    });
    if (r.underline) r.underline.style.strokeDashoffset = (1 - ease((t - 13.6) / 0.6)).toFixed(3);
  };

  // Scale the 800 px stage to the box.
  useEffect(() => {
    const box = boxRef.current;
    if (!box) return;
    const fit = () => box.style.setProperty("--film-scale", String(box.clientWidth / STAGE));
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(box);
    return () => observer.disconnect();
  }, []);

  // Plays while on screen, unless motion is reduced or turned off, or paused.
  useEffect(() => {
    const box = boxRef.current;
    if (!box) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const optedOut = new URLSearchParams(window.location.search).get("motion") === "off";
    setAllowed(!reduced && !optedOut);
    seek(clock.current.t);
    if (reduced || optedOut) return;
    const observer = new IntersectionObserver(([entry]) => setPlaying(entry.isIntersecting), { threshold: 0.35 });
    observer.observe(box);
    return () => observer.disconnect();
  }, []);

  const running = playing && !userPaused;
  useEffect(() => {
    if (!running) return;
    if (!clock.current.tracked) {
      clock.current.tracked = true;
      trackVideoPlayed("how-it-works-film", allowed ? "auto" : "button");
    }
    let frame = 0;
    clock.current.last = performance.now();
    const tick = (now: number) => {
      const c = clock.current;
      c.t = (c.t + (now - c.last) / 1000) % LOOP;
      c.last = now;
      seek(c.t);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  const toggle = () => {
    if (running) {
      setUserPaused(true);
    } else {
      setUserPaused(false);
      setPlaying(true);
    }
  };

  return (
    <div ref={boxRef} className="how-film" role="img" aria-label={label} data-reveal="rise">
      <div className="how-film__stage" aria-hidden>
        <div ref={set("camera")} className="how-film__camera">
          <div ref={set("glow")} className="how-film__glow" />
          <div ref={set("shape")} className="how-film__shape" />
          <div ref={set("ripple")} className="how-film__ripple" />
          <div ref={set("flood")} className="how-film__flood" />

          {/* 1. The message box. */}
          <div ref={set("composer")} className="how-film__composer">
            <span className="how-film__typed">
              <span ref={set("typed")} />
              <span ref={set("caret")} className="how-film__caret" />
            </span>
            <span ref={set("send")} className="how-film__send">
              <svg viewBox="0 0 24 24" width="26" height="26">
                <path d="M12 19V5M5 12l7-7 7 7" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </div>

          {/* 2. Sent. */}
          <div ref={set("sent")} className="how-film__sent">
            {TYPED}
          </div>

          {/* 3. The logged meal. */}
          <div ref={set("meal")} className="how-film__meal">
            <div className="how-film__meal-head">
              <span className="font-display">Breakfast</span>
              <span className="how-film__muted">Logged 8:05 AM</span>
            </div>
            {ITEMS.map((item, i) => (
              <div key={item.name} ref={set(`item${i}`)} className="how-film__item">
                <span>{item.name}</span>
                <span className="how-film__muted">{item.kcal} kcal</span>
              </div>
            ))}
            <div className="how-film__total">
              <span ref={set("kcal")} className="font-display">
                {TOTAL_KCAL}
              </span>
              <span className="how-film__muted">kcal</span>
            </div>
            <div className="how-film__macros">
              {MACROS.map((m, i) => (
                <div key={m.name} className="how-film__macro">
                  <span className="how-film__muted">{m.name}</span>
                  <span className="how-film__track">
                    <span
                      ref={set(`bar${i}`)}
                      className="how-film__bar"
                      style={{ scale: `${m.share} 1` } as CSSProperties}
                    />
                  </span>
                  <span>{m.grams}g</span>
                </div>
              ))}
            </div>
          </div>

          {/* 4. How it will make you feel. */}
          <div ref={set("rings")} className="how-film__rings">
            {SCORES.map((s, i) => (
              <div key={s.name} className="how-film__ring">
                <span className="how-film__ring-dial">
                  <svg viewBox="0 0 56 56">
                    <circle cx="28" cy="28" r="23" fill="none" stroke="var(--color-line)" strokeWidth="5" />
                    <circle
                      ref={set(`arc${i}`) as (el: SVGCircleElement | null) => void}
                      cx="28"
                      cy="28"
                      r="23"
                      fill="none"
                      stroke={s.color}
                      strokeWidth="5"
                      strokeLinecap="round"
                      pathLength={100}
                      strokeDasharray="100"
                      strokeDashoffset={100 - s.score}
                    />
                  </svg>
                  <span ref={set(`score${i}`)} className="font-display">
                    {s.score}
                  </span>
                </span>
                <span>{s.name}</span>
              </div>
            ))}
          </div>

          {/* 5. The nutritionist speaks up. */}
          <div ref={set("nudge")} className="how-film__nudge">
            <span className="how-film__from">
              <span className="how-film__dot" />
              Your nutritionist
            </span>
            <p>
              {NUDGE.split(" ").map((word, i) => (
                <span key={i} ref={set(`nw${i}`)} className="how-film__word">
                  {word}{" "}
                </span>
              ))}
            </p>
          </div>

          {/* 6. The closing line. */}
          <div ref={set("closing")} className="how-film__closing font-display">
            {CLOSING.map((word, i) => (
              <span key={word} className="relative inline-block">
                <span className="how-film__mask">
                  <span ref={set(`cw${i}`)} className="how-film__closing-word">
                    {word}
                  </span>
                </span>
                {i === CLOSING.length - 1 && (
                  <svg viewBox="0 0 220 18" preserveAspectRatio="none" className="how-film__underline">
                    <path
                      ref={set("underline") as (el: SVGPathElement | null) => void}
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
              </span>
            ))}
          </div>
        </div>
      </div>
      <button
        type="button"
        className="loop-video__toggle"
        aria-label={running ? "Pause animation" : "Play animation"}
        onClick={toggle}
      >
        {running ? (
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
