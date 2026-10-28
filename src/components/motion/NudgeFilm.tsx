"use client";

import { AppMark, Film, Icon, cameraAt, clamp01, columns, ease, moves, track, useFilm } from "./filmKit";

/*
 * "A nudge, not a nag." film (website motion experiment): three of the
 * nutritionist's real nudges, each arriving as a notification that becomes
 * the chat message, staged like the hero film. The copy and numbers are the
 * showcase account's, from the captures in public/app (25-nudge-missed-
 * breakfast, 24b-nudge-weigh-in, 24-nudge-weekly-pattern-crop):
 * 1. "I can't see any breakfast log today…", and "I'll log it now" is tapped;
 * 2. "It's been 8 days since your last weigh-in…", and "Log my weight";
 * 3. the Weekly calorie pattern card (Tuesdays and Wednesdays +170 kcal, the
 *    week's total unchanged), and Use this pattern, which waits for that OK.
 * Each one shrinks back into the next notification; the last into the first.
 */

const LOOP = 18;
const REST = 15.9;

type Nudge = { banner: string; text: string; replies: string[]; tap: number; at: number; height: number };

const NUDGES: Nudge[] = [
  {
    banner: "I can't see any breakfast log today. Drop me a quick voice note when you get the chance…",
    text: "I can't see any breakfast log today. Drop me a quick voice note when you get the chance if you had something, or let me know if you skipped it :)",
    replies: ["I skipped it", "I'll log it now", "Type your own"],
    tap: 1,
    at: 0,
    height: 106,
  },
  {
    banner: "It's been 8 days since your last weigh-in. Next time you hop on the scales, just send me…",
    text: "It's been 8 days since your last weigh-in. Next time you hop on the scales, just send me the number and I'll log it for you :)",
    replies: ["Log my weight", "Not this week", "Type your own"],
    tap: 0,
    at: 5.6,
    height: 86,
  },
];
const PATTERN_AT = 11.2;
const PATTERN_BANNER =
  "Tuesdays and Wednesdays have run about 520 kcal over your goal in most of the last four weeks…";
const DAYS = [
  { day: "Mon", kcal: "1,500", diff: "-70" },
  { day: "Tue", kcal: "1,740", diff: "+170" },
  { day: "Wed", kcal: "1,740", diff: "+170" },
  { day: "Thu", kcal: "1,500", diff: "-70" },
  { day: "Fri", kcal: "1,500", diff: "-70" },
  { day: "Sat", kcal: "1,500", diff: "-70" },
  { day: "Sun", kcal: "1,510", diff: "-60" },
];

const BUBBLE_TOP = 60;
const BANNER: [number, number, number, number, number] = [200, 52, 368, 76, 22];
const bubbleRect = (n: Nudge): [number, number, number, number, number] => [200, BUBBLE_TOP + n.height / 2, 340, n.height, 12];
const replyTop = (n: Nudge, i: number) => BUBBLE_TOP + n.height + 12 + i * 56;

/* The one shape: [time, centre x, centre y, width, height, radius]. */
const SHAPE: [number, number, number, number, number, number][] = [
  [0, ...BANNER],
  [NUDGES[0].at + 1.3, ...bubbleRect(NUDGES[0])],
  [NUDGES[1].at, ...BANNER],
  [NUDGES[1].at + 1.3, ...bubbleRect(NUDGES[1])],
  [PATTERN_AT, ...BANNER],
  [PATTERN_AT + 1.3, 200, 200, 360, 390, 16],
  [17.3, ...BANNER],
];
const SHAPE_TRACKS = columns(SHAPE, 5);

const CAMERA: [number, number, number, number][] = [
  [0, 1, 200, 200],
  [3.2, 1.05, 200, 230], // in on the replies
  [5.6, 1, 200, 200],
  [8.8, 1.05, 200, 230],
  [PATTERN_AT, 1, 200, 200],
  [17.3, 1, 200, 200],
];

function seek(t: number, put: (key: string, prop: string, value: string) => void) {
  const { enter, press, rise } = moves(put);
  put("camera", "transform", cameraAt(CAMERA, t));

  const [cx, cy, w, h, r] = SHAPE_TRACKS.map((keys) => track(keys, t));
  put("shape", "width", `${w.toFixed(1)}px`);
  put("shape", "height", `${h.toFixed(1)}px`);
  put("shape", "transform", `translate(${(cx - w / 2).toFixed(1)}px, ${(cy - h / 2).toFixed(1)}px)`);
  put("shape", "border-radius", `${r.toFixed(1)}px`);

  // Each notification's words, while the shape is the banner. The first one
  // starts before the loop wraps, as the last card becomes its banner.
  const wrap = t > LOOP - 0.7 ? t - LOOP : t;
  enter("banner0", wrap, -0.5, NUDGES[0].at + 1.0, [0, -10]);
  enter("banner1", t, NUDGES[1].at + 0.25, NUDGES[1].at + 1.0, [0, -10]);
  enter("banner2", t, PATTERN_AT + 0.25, PATTERN_AT + 1.0, [0, -10]);

  // 1–2. The message, its replies, and the one that's tapped.
  NUDGES.forEach((n, k) => {
    const shown = t > n.at + 1.35 && t < n.at + 5.55;
    put(`bubble${k}`, "visibility", shown ? "visible" : "hidden");
    put(`bubble${k}`, "opacity", (1 - clamp01((t - n.at - 5.35) / 0.2)).toFixed(2));
    rise(`bubbleText${k}`, t, n.at + 1.4);
    n.replies.forEach((_, i) => {
      enter(`reply${k}.${i}`, t, n.at + 1.8 + i * 0.12, n.at + 5.2 + i * 0.05, [i % 2 ? 420 : -420, 0]);
    });
    const tapAt = n.at + 3.9;
    press(`reply${k}.${n.tap}`, t, tapAt);
    const picked = t > tapAt;
    put(`reply${k}.${n.tap}`, "background-color", picked ? "#000" : "#fff");
    put(`reply${k}.${n.tap}`, "color", picked ? "#fff" : "#000");
    put(`reply${k}.${n.tap}`, "border-color", picked ? "#000" : "#e9e9ea");
  });

  // 3. The Weekly calorie pattern card, and its OK.
  const out = 17.15;
  const a = PATTERN_AT + 1.35;
  enter("patternHead", t, a, out);
  enter("patternSub", t, a + 0.1, out);
  DAYS.forEach((_, i) => enter(`day${i}`, t, a + 0.3 + i * 0.08, out, [0, 0]));
  const bandOut = 1 - clamp01((t - out) / 0.2);
  put("dayBand1", "scale", `${(ease((t - a - 1.1) / 0.5) * bandOut).toFixed(3)} 1`);
  put("dayBand2", "scale", `${(ease((t - a - 1.2) / 0.5) * bandOut).toFixed(3)} 1`);
  enter("patternTotals", t, a + 1.0, out);
  enter("useIt", t, a + 1.2, out, [0, 30]);
  const okAt = 15.4;
  press("useIt", t, okAt);
  const done = t > okAt && t < out + 0.3;
  put("useIt", "background-color", done ? "#e9e9ea" : "#000");
  put("useIt", "color", done ? "#7a7a82" : "#fff");
  put("useItLabel", "text", done ? "Done" : "Use this pattern");
}

export default function NudgeFilm({ label, className }: { label: string; className?: string }) {
  const { set, ...film } = useFilm({ loop: LOOP, rest: REST, name: "nudge-film", seek });

  const banner = (key: string, text: string) => (
    <span ref={set(key)} className="nf-c nf-banner">
      <span className="nf-banner__icon">
        <AppMark size={22} />
      </span>
      <span className="nf-banner__body">
        <span className="nf-banner__top">
          <b>PrepIt</b>
          <span>now</span>
        </span>
        <span className="nf-banner__text">{text}</span>
      </span>
    </span>
  );

  return (
    <Film {...film} label={label} className={`nudge-film ${className ?? ""}`}>
      <div ref={set("camera")} className="film__camera" aria-hidden>
        <div ref={set("shape")} className="nf-shape" />
        {banner("banner0", NUDGES[0].banner)}
        {banner("banner1", NUDGES[1].banner)}
        {banner("banner2", PATTERN_BANNER)}

        {NUDGES.map((n, k) => (
          <div key={n.banner}>
            <p ref={set(`bubble${k}`)} className="hf-bubble nf-bubble" style={{ top: BUBBLE_TOP, height: n.height }}>
              <span className="hf-bubble__mask">
                <span ref={set(`bubbleText${k}`)} className="hf-bubble__text">
                  {n.text}
                </span>
              </span>
            </p>
            {n.replies.map((reply, i) => (
              <span key={reply} ref={set(`reply${k}.${i}`)} className="hf-c hf-reply" style={{ top: replyTop(n, i) }}>
                {i === 2 ? (
                  <span className="hf-reply__n nf-reply__pen">
                    <Icon name="pencil" size={10} />
                  </span>
                ) : (
                  <span className="hf-reply__n">{i + 1}</span>
                )}
                <span className="hf-reply__label">{reply}</span>
                <Icon name="chevronRight" size={12} />
              </span>
            ))}
          </div>
        ))}

        {/* 3. The Weekly calorie pattern card. */}
        <span ref={set("patternHead")} className="nf-c nf-pattern-head">
          <Icon name="calendar" size={17} />
          Weekly calorie pattern
        </span>
        <span ref={set("patternSub")} className="nf-c nf-pattern-sub">
          Tuesdays and Wednesdays +170 kcal, other days -60 to -70 kcal
        </span>
        <span ref={set("dayBand1")} className="nf-day-band" style={{ top: 98 + 26 }} />
        <span ref={set("dayBand2")} className="nf-day-band" style={{ top: 98 + 52 }} />
        {DAYS.map((d, i) => (
          <span
            key={d.day}
            ref={set(`day${i}`)}
            className={`nf-c nf-day ${d.diff.startsWith("+") ? "nf-day--up" : ""}`}
            style={{ top: 98 + i * 26 }}
          >
            <span className="nf-day__name">{d.day}</span>
            <span className="nf-day__kcal">{d.kcal} kcal</span>
            <span className="nf-day__diff">{d.diff}</span>
          </span>
        ))}
        <span ref={set("patternTotals")} className="nf-c nf-pattern-totals">
          <span>Protein stays at 158g every day</span>
          <span>Weekly total stays 10,990 kcal</span>
        </span>
        <span ref={set("useIt")} className="nf-c nf-use">
          <span ref={set("useItLabel")}>Use this pattern</span>
        </span>
      </div>
    </Film>
  );
}
