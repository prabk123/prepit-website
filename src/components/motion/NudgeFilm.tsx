"use client";

import { AppMark, Film, Icon, cameraAt, clamp01, columns, ease, moves, pressScale, track, useFilm } from "./filmKit";

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

/** How long each notification shows on the lock screen before it's tapped. */
const BANNER_FOR = 2.6;
const LOOP = 20.7;
const REST = 19.0;

type Nudge = {
  banner: string;
  text: string;
  replies: string[];
  tap: number;
  at: number;
  height: number;
  /** The lock screen's time, when the backend sends this nudge. */
  time: string;
  /** Its own day: the nutritionist sends at most one nudge a day. */
  date: string;
};

const NUDGES: Nudge[] = [
  {
    banner: "I can't see any breakfast log today. Drop me a quick voice note when you get the chance…",
    text: "I can't see any breakfast log today. Drop me a quick voice note when you get the chance if you had something, or let me know if you skipped it :)",
    replies: ["I skipped it", "I'll log it now", "Type your own"],
    tap: 1,
    at: 0,
    height: 106,
    time: "9:40",
    date: "Thursday 15 October",
  },
  {
    banner: "It's been 8 days since your last weigh-in. Next time you hop on the scales, just send me…",
    text: "It's been 8 days since your last weigh-in. Next time you hop on the scales, just send me the number and I'll log it for you :)",
    replies: ["Log my weight", "Not this week", "Type your own"],
    tap: 0,
    at: 6.3,
    height: 86,
    time: "12:30",
    date: "Friday 16 October",
  },
];
const PATTERN_AT = 12.6;
const PATTERN_TIME = "12:30";
const PATTERN_DATE = "Saturday 17 October";
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
/** When each notification arrives, and the lock screen's time then. */
const ARRIVALS = [
  ...NUDGES.map((n) => ({ at: n.at, time: n.time, date: n.date })),
  { at: PATTERN_AT, time: PATTERN_TIME, date: PATTERN_DATE },
];

const BUBBLE_TOP = 60;
/** The notification, on the phone's lock screen. */
const BANNER: [number, number, number, number, number] = [200, 216, 264, 80, 20];
const CARD: [number, number, number, number, number] = [200, 200, 360, 390, 16];
const bubbleRect = (n: Nudge): [number, number, number, number, number] => [200, BUBBLE_TOP + n.height / 2, 340, n.height, 12];
const replyTop = (n: Nudge, i: number) => BUBBLE_TOP + n.height + 12 + i * 56;
/** The card leaves, and the shape heads back to the first notification. */
const CARD_OUT = 19.65;

/* The one shape: [time, centre x, centre y, width, height, radius]. */
const SHAPE: [number, number, number, number, number, number][] = [
  [0, ...BANNER],
  [NUDGES[0].at + BANNER_FOR, ...bubbleRect(NUDGES[0])],
  [NUDGES[1].at, ...BANNER],
  [NUDGES[1].at + BANNER_FOR, ...bubbleRect(NUDGES[1])],
  [PATTERN_AT, ...BANNER],
  [PATTERN_AT + BANNER_FOR, ...CARD],
  [CARD_OUT + 0.15, ...BANNER],
];
const SHAPE_TRACKS = columns(SHAPE, 5);

const CAMERA: [number, number, number, number][] = [
  [0, 1, 200, 200],
  [NUDGES[0].at + BANNER_FOR + 1.9, 1.05, 200, 230], // in on the replies
  [NUDGES[1].at, 1, 200, 200],
  [NUDGES[1].at + BANNER_FOR + 1.9, 1.05, 200, 230],
  [PATTERN_AT, 1, 200, 200],
];

/** "12:30" as the notification's time, "12:30 PM". */
const clock = (time: string) => `${time} ${Number(time.split(":")[0]) < 12 ? "AM" : "PM"}`;

function seek(t: number, put: (key: string, prop: string, value: string) => void) {
  const { enter, press, rise } = moves(put);
  put("camera", "transform", cameraAt(CAMERA, t));

  const [cx, cy, w, h, r] = SHAPE_TRACKS.map((keys) => track(keys, t));
  // The tap on the notification: a press on the shape.
  const tap = ARRIVALS.map(({ at }) => at + BANNER_FOR - 0.3).find((at) => Math.abs(t - at) < 1) ?? -9;
  put("shape", "width", `${w.toFixed(1)}px`);
  put("shape", "height", `${h.toFixed(1)}px`);
  put("shape", "transform", `translate(${(cx - w / 2).toFixed(1)}px, ${(cy - h / 2).toFixed(1)}px) scale(${pressScale(t, tap).toFixed(3)})`);
  put("shape", "border-radius", `${r.toFixed(1)}px`);

  // Each notification on the lock screen, then it's tapped. The first one
  // starts before the loop wraps, as the last card becomes it.
  const wrap = t > LOOP - 1.0 ? t - LOOP : t;
  let onLockScreen = false;
  ARRIVALS.forEach(({ at }, k) => {
    const time = k === 0 ? wrap : t;
    const tapped = at + BANNER_FOR;
    if (time > at - 0.9 && time < tapped + 0.1) onLockScreen = true;
    enter(`phone${k}`, time, at - (k === 0 ? 0.7 : 0.1), tapped - 0.05, [0, 30]);
    enter(`banner${k}`, time, at + 0.45, tapped - 0.1, [0, 0]);
  });
  // Clear glass on the lock screen; the app's white once it's opened.
  put("shape", "background-color", onLockScreen ? "rgb(255 255 255 / 0.2)" : "#fff");
  put("shape", "border-color", onLockScreen ? "rgb(255 255 255 / 0.35)" : "#e9e9ea");
  put("shape", "box-shadow", onLockScreen ? "none" : "0 14px 40px rgb(26 26 46 / 0.1)");

  // 1–2. The message, its replies, and the one that's tapped.
  NUDGES.forEach((n, k) => {
    const b = n.at + BANNER_FOR;
    const shown = t > b + 0.05 && t < b + 3.55;
    put(`bubble${k}`, "visibility", shown ? "visible" : "hidden");
    put(`bubble${k}`, "opacity", (1 - clamp01((t - b - 3.35) / 0.2)).toFixed(2));
    rise(`bubbleText${k}`, t, b + 0.1);
    n.replies.forEach((_, i) => {
      enter(`reply${k}.${i}`, t, b + 0.5 + i * 0.12, b + 3.2 + i * 0.05, [i % 2 ? 420 : -420, 0]);
    });
    const tapAt = b + 2.2;
    press(`reply${k}.${n.tap}`, t, tapAt);
    const picked = t > tapAt;
    put(`reply${k}.${n.tap}`, "background-color", picked ? "#000" : "#fff");
    put(`reply${k}.${n.tap}`, "color", picked ? "#fff" : "#000");
    put(`reply${k}.${n.tap}`, "border-color", picked ? "#000" : "#e9e9ea");
  });

  // 3. The Weekly calorie pattern card, and its OK.
  const out = CARD_OUT;
  const a = PATTERN_AT + BANNER_FOR + 0.05;
  enter("patternHead", t, a, out);
  enter("patternSub", t, a + 0.1, out);
  DAYS.forEach((_, i) => enter(`day${i}`, t, a + 0.3 + i * 0.08, out, [0, 0]));
  const bandOut = 1 - clamp01((t - out) / 0.2);
  put("dayBand1", "scale", `${(ease((t - a - 1.1) / 0.5) * bandOut).toFixed(3)} 1`);
  put("dayBand2", "scale", `${(ease((t - a - 1.2) / 0.5) * bandOut).toFixed(3)} 1`);
  enter("patternTotals", t, a + 1.0, out);
  enter("useIt", t, a + 1.2, out, [0, 30]);
  const okAt = a + 3.0;
  press("useIt", t, okAt);
  const done = t > okAt && t < out + 0.3;
  put("useIt", "background-color", done ? "#e9e9ea" : "#000");
  put("useIt", "color", done ? "#7a7a82" : "#fff");
  put("useItLabel", "text", done ? "Done" : "Use this pattern");
}

export default function NudgeFilm({ label, className }: { label: string; className?: string }) {
  const { set, ...film } = useFilm({ loop: LOOP, rest: REST, name: "nudge-film", seek });

  // An iOS notification on the lock screen (Prabodh's Figma, node
  // 3350:57437): clear glass, white type, older ones stacked under it.
  const banner = (key: string, text: string, time: string) => (
    <span ref={set(key)} className="nf-c nf-banner">
      <span className="nf-banner__icon">
        <AppMark size={18} />
      </span>
      <span className="nf-banner__body">
        <span className="nf-banner__top">
          <b>PrepIt</b>
          <span>{clock(time)}</span>
        </span>
        <span className="nf-banner__text">{text}</span>
      </span>
      <span className="nf-banner__stack" />
      <span className="nf-banner__stack nf-banner__stack--back" />
    </span>
  );

  return (
    <Film {...film} label={label} className={`nudge-film ${className ?? ""}`}>
      <div ref={set("camera")} className="film__camera" aria-hidden>
        {/* The lock screen each notification arrives on, under the shape. */}
        {ARRIVALS.map(({ time, date }, k) => (
          <span key={k} ref={set(`phone${k}`)} className="nf-c nf-phone">
            <span className="nf-phone__status">
              <b>{time}</b>
              <span className="nf-phone__bars">
                <i />
                <i />
                <i />
                <i />
              </span>
              <span className="nf-phone__battery" />
            </span>
            <span className="nf-phone__island" />
            <span className="nf-phone__date">{date}</span>
            <span className="nf-phone__time">{time}</span>
          </span>
        ))}
        <div ref={set("shape")} className="nf-shape" />
        {banner("banner0", NUDGES[0].banner, NUDGES[0].time)}
        {banner("banner1", NUDGES[1].banner, NUDGES[1].time)}
        {banner("banner2", PATTERN_BANNER, PATTERN_TIME)}

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
