"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { trackVideoPlayed } from "@/lib/posthogAnalytics";
import { FILM_ICONS, type FilmIconName } from "./filmIcons";

/*
 * What the homepage films share (website motion experiment). A film is the
 * app's real components drawn in code on a 400 x 400 pt stage, staged after
 * the Prompt Motion pieces Prabodh picked. Every style comes from the time
 * inside seek(t), with closed-form springs, so a frame never depends on the
 * one before it.
 */

/** Step response of a spring with a little overshoot, 0 before it starts. */
export function spring(t: number, period = 0.55, damping = 0.78) {
  if (t <= 0) return 0;
  const w = (2 * Math.PI) / period;
  if (damping >= 1) return 1 - Math.exp(-w * t) * (1 + w * t);
  const wd = w * Math.sqrt(1 - damping * damping);
  return 1 - Math.exp(-damping * w * t) * (Math.cos(wd * t) + ((damping * w) / wd) * Math.sin(wd * t));
}

/** A value that springs to each new target at its time: [time, value][]. */
export function track(keys: [number, number][], t: number, period?: number, damping?: number) {
  let v = keys[0][1];
  for (let i = 1; i < keys.length; i++) v += (keys[i][1] - keys[i - 1][1]) * spring(t - keys[i][0], period, damping);
  return v;
}

/** Splits [time, a, b, ...] keys into one track per column. */
export function columns<T extends number[]>(keys: T[], count: number) {
  return Array.from({ length: count }, (_, i) => keys.map((k) => [k[0], k[i + 1]] as [number, number]));
}

export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
export const ease = (x: number) => 1 - Math.pow(1 - clamp01(x), 3);
export const easeIn = (x: number) => Math.pow(clamp01(x), 3);
export const mix = (a: number, b: number, p: number) => a + (b - a) * p;

/** 0 to 1 over a window, in at `a` and out at `b`, with short soft edges. */
export function windowed(t: number, a: number, b: number, edge = 0.25) {
  return clamp01((t - a) / edge) * (1 - clamp01((t - b) / (edge * 0.8)));
}

/**
 * The camera: [time, zoom, focus x, focus y], the focus held mid-frame. Zoom
 * moves in log space so a push in and a pull back feel the same speed.
 */
export function cameraAt(keys: [number, number, number, number][], t: number) {
  const [logZoom, fx, fy] = columns(
    keys.map(([time, zoom, x, y]) => [time, Math.log(zoom), x, y]),
    3,
  ).map((k) => track(k, t, 1.2, 0.95));
  const zoom = Math.exp(logZoom);
  return `translate(200px, 200px) scale(${zoom.toFixed(4)}) translate(${(-fx).toFixed(2)}px, ${(-fy).toFixed(2)}px)`;
}

type Put = (key: string, prop: string, value: string) => void;
export type Setter = (key: string) => (el: HTMLElement | SVGElement | null) => void;

/** The motions every film uses, writing through `put`. */
export function moves(put: Put) {
  return {
    /** A component rises in at `a`, and slides out by `out` from `b`. */
    enter(key: string, t: number, a: number, b = 99, out: [number, number] = [0, -24]) {
      const inP = spring(t - a, 0.55, 0.8);
      const outP = easeIn((t - b) / 0.35);
      const o = clamp01((t - a) / 0.15) * (1 - clamp01((t - b - 0.2) / 0.15));
      put(key, "opacity", o.toFixed(2));
      put(key, "visibility", o <= 0 ? "hidden" : "visible");
      put(key, "translate", `${(out[0] * outP).toFixed(1)}px ${((1 - inP) * 22 + out[1] * outP).toFixed(1)}px`);
    },
    /** A press: a quick dip in scale around `at`. */
    press(key: string, t: number, at: number) {
      put(key, "scale", (1 - 0.07 * windowed(t, at - 0.1, at + 0.08, 0.08)).toFixed(3));
    },
    /** A pop: springs in from nothing at `at`, gone again from `until`. */
    pop(key: string, t: number, at: number, until = 99) {
      const s = t < until ? spring(t - at, 0.42, 0.55) : 0;
      put(key, "scale", s.toFixed(3));
      put(key, "opacity", (t < until ? clamp01((t - at) / 0.12) : 0).toFixed(2));
    },
    /** Text rising out of a mask line from `at`. */
    rise(key: string, t: number, at: number) {
      put(key, "translate", `0 ${((1 - spring(t - at, 0.6, 0.85)) * 110).toFixed(1)}%`);
    },
  };
}

/**
 * Plays a film while it is on screen: on its own unless motion is reduced or
 * turned off with ?motion=off, otherwise once Play is pressed. Paused always
 * wins. `rest` is the frame shown before it plays.
 */
export function useFilm({ loop, rest, name, seek }: { loop: number; rest: number; name: string; seek: (t: number, put: Put) => void }) {
  const boxRef = useRef<HTMLDivElement>(null);
  const refs = useRef<Record<string, HTMLElement | SVGElement | null>>({});
  const written = useRef(new Map<string, string>());
  const seekRef = useRef(seek);
  const clock = useRef({ t: rest, last: 0, tracked: false });
  const [inView, setInView] = useState(false);
  const [allowed, setAllowed] = useState(false);
  const [userState, setUserState] = useState<"auto" | "paused" | "playing">("auto");

  useEffect(() => {
    seekRef.current = seek;
  });

  const set: Setter = (key) => (el) => {
    refs.current[key] = el;
  };

  /** Sets a style (or "text") only when it changed since the last frame. */
  const put: Put = (key, prop, value) => {
    const el = refs.current[key];
    if (!el) return;
    const id = `${key}.${prop}`;
    if (written.current.get(id) === value) return;
    written.current.set(id, value);
    if (prop === "text") el.textContent = value;
    else el.style.setProperty(prop, value);
  };
  const putRef = useRef(put);

  // Scale the 400 pt stage to the box.
  useEffect(() => {
    const box = boxRef.current;
    if (!box) return;
    const fit = () => box.style.setProperty("--film-scale", String(box.clientWidth / 400));
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(box);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const box = boxRef.current;
    if (!box) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const optedOut = new URLSearchParams(window.location.search).get("motion") === "off";
    setAllowed(!reduced && !optedOut);
    seekRef.current(clock.current.t, putRef.current);
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.35 });
    observer.observe(box);
    return () => observer.disconnect();
  }, []);

  const running = inView && (userState === "playing" || (userState === "auto" && allowed));
  useEffect(() => {
    if (!running) return;
    if (!clock.current.tracked) {
      clock.current.tracked = true;
      trackVideoPlayed(name, userState === "playing" ? "button" : "auto");
    }
    let frame = 0;
    clock.current.last = performance.now();
    const tick = (now: number) => {
      const c = clock.current;
      c.t = (c.t + Math.min(0.1, (now - c.last) / 1000)) % loop;
      c.last = now;
      seekRef.current(c.t, putRef.current);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
    // userState only names the first play; the loop restarts on `running`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, loop, name]);

  const showsPause = userState === "playing" || (userState === "auto" && allowed);
  const toggle = () => setUserState(showsPause ? "paused" : "playing");
  return { boxRef, set, showsPause, allowed, toggle };
}

/**
 * The film's frame: no border, so it sits on the page. A click or tap pauses
 * or plays it; the Play/Pause button shows on keyboard focus, and under
 * reduced motion, where the film rests until Play is pressed.
 */
export function Film({
  boxRef,
  allowed,
  showsPause,
  toggle,
  label,
  className = "",
  children,
}: Omit<ReturnType<typeof useFilm>, "set"> & {
  label: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div ref={boxRef} className={`film ${className}`} onClick={toggle}>
      <div className="film__stage" role="img" aria-label={label}>
        {children}
      </div>
      <button
        type="button"
        className={`film__toggle ${allowed ? "" : "film__toggle--shown"}`}
        aria-label={showsPause ? "Pause animation" : "Play animation"}
        onClick={(event) => {
          event.stopPropagation();
          toggle();
        }}
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

/** One of the app's icons. */
export function Icon({ name, size, className }: { name: FilmIconName; size: number; className?: string }) {
  const icon = FILM_ICONS[name];
  return (
    <svg viewBox={icon.box} width={size} height={size} className={className} aria-hidden>
      <path d={icon.d} fill="currentColor" />
    </svg>
  );
}
