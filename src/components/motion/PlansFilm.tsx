"use client";

import Image from "next/image";
import { Film, Icon, cameraAt, columns, ease, moves, track, useFilm } from "./filmKit";

/*
 * "Your week, planned." film (website motion experiment): the app's real
 * meal plan and grocery list, floating on the page and staged like the hero
 * film. The meals, numbers and dish photos are the showcase plan's, from the
 * captures in public/app (12-plan-week, 13-grocery-list):
 * 1. 17 Oct – 23 Oct, 21 meals: Saturday's breakfast, lunch and dinner come
 *    in, and the camera moves down them;
 * 2. Sunday is picked and its three meals take their places;
 * 3. the Grocery list card opens into the list, sorted by aisle with its
 *    estimate, and items are ticked off; then it closes for the next loop.
 */

const LOOP = 17;
const REST = 6.4;

type Meal = { slot: string; title: string; photo: string; kcal: number; c: number; p: number; f: number; note: string };

const SATURDAY: Meal[] = [
  { slot: "Breakfast", title: "Protein overnight oats with apple", photo: "oats", kcal: 430, c: 50, p: 40, f: 8, note: "Your go-to breakfast. 40g protein keeps your energy up until lunch." },
  { slot: "Lunch", title: "Chicken burrito bowl", photo: "burrito", kcal: 590, c: 62, p: 50, f: 14, note: "You loved this last week. Beans add 7g fibre for steadier afternoons." },
  { slot: "Dinner", title: "Korean beef rice bowl", photo: "korean-beef", kcal: 560, c: 58, p: 38, f: 18, note: "From your logs. Lean mince keeps it under your fat target." },
];
const SUNDAY: Meal[] = [
  { slot: "Breakfast", title: "Berry yogurt parfait", photo: "parfait", kcal: 340, c: 36, p: 26, f: 10, note: "A quicker take on your parfait, with more yogurt for protein." },
  { slot: "Lunch", title: "Thai peanut chicken noodles", photo: "thai-noodles", kcal: 550, c: 60, p: 42, f: 15, note: "Something new that fits your targets and uses the same chicken." },
  { slot: "Dinner", title: "Salmon teriyaki rice bowl", photo: "salmon-teriyaki", kcal: 580, c: 56, p: 42, f: 20, note: "Your favourite dinner. Omega-3 from the salmon supports mood." },
];
const DAYS = [
  ["Sat", 17],
  ["Sun", 18],
  ["Mon", 19],
  ["Tue", 20],
  ["Wed", 21],
  ["Thu", 22],
  ["Fri", 23],
] as const;
const GROCERIES = [
  { aisle: "Bakery", items: [["tortilla", "wholemeal tortilla", "120g"]] },
  {
    aisle: "Dairy & Alternatives",
    items: [
      ["eggs", "eggs", "200g"],
      ["feta", "feta", "60g"],
      ["yogurt", "Greek yogurt", "850g"],
    ],
  },
  {
    aisle: "Fresh Produce",
    items: [
      ["apple", "apple", "450g"],
      ["avocado", "avocado", "140g"],
    ],
  },
] as const;

/* World layout, in stage points. */
const MEAL_TOP = 340;
const MEAL_STEP = 150;
const SUNDAY_AT = 4.8;
const LIST_AT = 8.6;
const LIST_OUT = 15.7;

/** Each grocery row's top, after its aisle's heading. */
const GROCERY_ROWS = (() => {
  const rows: { aisle?: string; top: number; item?: (typeof GROCERIES)[number]["items"][number]; index: number }[] = [];
  let y = 140;
  let index = 0;
  for (const group of GROCERIES) {
    rows.push({ aisle: group.aisle, top: y, index: -1 });
    y += 28;
    for (const item of group.items) {
      rows.push({ item, top: y, index: index++ });
      y += 42;
    }
    y += 8;
  }
  return rows;
})();
const ITEMS = GROCERY_ROWS.filter((row) => row.item);

/* The one shape, the Grocery list card: [time, centre x, centre y, width, height, radius]. */
const SHAPE: [number, number, number, number, number, number][] = [
  [0, 200, 108, 368, 64, 16], // the Grocery list card
  [LIST_AT + 0.1, 200, 284, 380, 556, 20], // the list
  [LIST_OUT + 0.3, 200, 108, 368, 64, 16],
];
const SHAPE_TRACKS = columns(SHAPE, 5);

const CAMERA: [number, number, number, number][] = [
  [0, 1, 200, 200],
  [1.9, 0.86, 200, 480], // down the day's meals
  [7.4, 1, 200, 200],
  [LIST_AT + 0.3, 1, 200, 200],
  [11.4, 1, 200, 350], // down the list
  [LIST_OUT, 1, 200, 200],
];

function seek(t: number, put: (key: string, prop: string, value: string) => void) {
  const { enter, press, pop } = moves(put);
  put("camera", "transform", cameraAt(CAMERA, t));

  const [cx, cy, w, h, r] = SHAPE_TRACKS.map((keys) => track(keys, t));
  put("shape", "width", `${w.toFixed(1)}px`);
  put("shape", "height", `${h.toFixed(1)}px`);
  put("shape", "transform", `translate(${(cx - w / 2).toFixed(1)}px, ${(cy - h / 2).toFixed(1)}px)`);
  put("shape", "border-radius", `${r.toFixed(1)}px`);
  press("shape", t, LIST_AT - 0.1);

  // 1. The week: its dates, the Grocery list card and the day picker.
  const away = LIST_AT - 0.1;
  enter("head", t, 0.05, away);
  enter("groceryCard", t, 0.1, away - 0.1);
  enter("days", t, 0.2, away);

  // 2. Saturday's meals, then Sunday's.
  const sunday = t > SUNDAY_AT;
  const slide = ease((t - SUNDAY_AT) / 0.45);
  put("dayPick", "translate", `${(48 * slide).toFixed(1)}px 0`);
  put("dayName0", "font-weight", sunday ? "500" : "700");
  put("dayName1", "font-weight", sunday ? "700" : "500");
  put("dayNum0", "color", t > SUNDAY_AT + 0.2 ? "#000" : "#fff");
  put("dayNum1", "color", t > SUNDAY_AT + 0.2 ? "#fff" : "#000");
  put("targetDay", "text", sunday ? "Sunday, 18 Oct" : "Saturday, 17 Oct");
  put("targetKcal", "text", sunday ? "1,470 kcal" : "1,580 kcal");
  [0, 1, 2].forEach((i) => {
    enter(`slot${i}`, t, 0.5 + i * 0.15, away);
    enter(`sat${i}`, t, 0.6 + i * 0.15, SUNDAY_AT + 0.05 + i * 0.06, [-420, 0]);
    enter(`sun${i}`, t, SUNDAY_AT + 0.35 + i * 0.08, away + i * 0.04, [0, 30]);
  });

  // 3. The grocery list, ticked off.
  const a = LIST_AT + 0.3;
  enter("listTitle", t, a, LIST_OUT);
  enter("estimate", t, a + 0.1, LIST_OUT);
  GROCERY_ROWS.forEach((row, i) => enter(`gRow${i}`, t, a + 0.25 + i * 0.07, LIST_OUT, [0, 0]));
  ITEMS.forEach((_, i) => {
    const at = 10.2 + i * 0.55;
    const ticked = t > at && t < LIST_OUT + 0.3;
    put(`gBox${i}`, "background-color", ticked ? "#000" : "#fff");
    put(`gBox${i}`, "border-color", ticked ? "#000" : "#a6a6ac");
    pop(`gTick${i}`, t, at, LIST_OUT + 0.3);
    put(`gName${i}`, "color", ticked ? "#a6a6ac" : "#000");
  });
  enter("listFoot", t, a + 0.8, LIST_OUT, [0, 30]);
  press("share", t, 14.6);
}

function MealCard({ meal, keyName, set, top }: { meal: Meal; keyName: string; set: (key: string) => (el: HTMLElement | SVGElement | null) => void; top: number }) {
  return (
    <span ref={set(keyName)} className="pf-c pf-meal" style={{ top }}>
      <Image src={`/motion/dish-${meal.photo}.webp`} alt="" width={60} height={60} className="pf-meal__photo" unoptimized />
      <span className="pf-meal__body">
        <b className="pf-meal__title">{meal.title}</b>
        <span className="pf-meal__chips">
          <span className="hf-chip hf-chip--kcal">
            <Icon name="fire" size={11} />
            {meal.kcal} kcal
          </span>
          <span className="pf-chip">C {meal.c}g</span>
          <span className="pf-chip">P {meal.p}g</span>
          <span className="pf-chip">F {meal.f}g</span>
        </span>
      </span>
      <span className="pf-meal__note">{meal.note}</span>
    </span>
  );
}

export default function PlansFilm({ label, className }: { label: string; className?: string }) {
  const { set, ...film } = useFilm({ loop: LOOP, rest: REST, name: "plans-film", seek });

  return (
    <Film {...film} label={label} className={`plans-film ${className ?? ""}`}>
      <div ref={set("camera")} className="film__camera" aria-hidden>
        {/* 1. The week. */}
        <p ref={set("head")} className="pf-c pf-head">
          <b>17 Oct – 23 Oct</b>
          <span>21 meals</span>
        </p>
        <div ref={set("shape")} className="pf-shape" />
        <span ref={set("groceryCard")} className="pf-c pf-grocery-card">
          <Cart />
          <span className="pf-grocery-card__text">
            <b>Grocery list</b>
            <span>30 Ingredients</span>
          </span>
          <span className="pf-grocery-card__thumbs">
            {["apple", "eggs", "avocado"].map((g) => (
              <Image key={g} src={`/motion/grocery-${g}.webp`} alt="" width={26} height={26} unoptimized />
            ))}
          </span>
        </span>
        <div ref={set("days")} className="pf-c pf-days">
          <span className="pf-days__row">
            <span ref={set("dayPick")} className="pf-days__pick" />
            {DAYS.map(([name, n], i) => (
              <span key={name} className="pf-days__day">
                <span ref={i < 2 ? set(`dayName${i}`) : undefined}>{name}</span>
                <b ref={i < 2 ? set(`dayNum${i}`) : undefined}>{n}</b>
              </span>
            ))}
          </span>
          <span className="pf-target">
            <span>
              <b>Daily target</b>
              <b ref={set("targetDay")}>Saturday, 17 Oct</b>
            </span>
            <span className="pf-target__kcal">
              <span>1,570 kcal</span>
              <b>
                <Icon name="fire" size={14} />
                <span ref={set("targetKcal")}>1,580 kcal</span>
              </b>
            </span>
          </span>
        </div>

        {/* 2. Saturday's meals, then Sunday's. */}
        {SATURDAY.map((meal, i) => (
          <span key={meal.slot} ref={set(`slot${i}`)} className="pf-c pf-slot" style={{ top: MEAL_TOP + i * MEAL_STEP }}>
            {meal.slot}
          </span>
        ))}
        {SATURDAY.map((meal, i) => (
          <MealCard key={meal.title} meal={meal} keyName={`sat${i}`} set={set} top={MEAL_TOP + 26 + i * MEAL_STEP} />
        ))}
        {SUNDAY.map((meal, i) => (
          <MealCard key={meal.title} meal={meal} keyName={`sun${i}`} set={set} top={MEAL_TOP + 26 + i * MEAL_STEP} />
        ))}

        {/* 3. The grocery list. */}
        <p ref={set("listTitle")} className="pf-c pf-list-title">
          Grocery List
        </p>
        <span ref={set("estimate")} className="pf-c pf-estimate">
          <Wallet />
          <span>
            <b>Est. £48–£66</b>
            <small>£2.29–£3.14 a meal</small>
            <span>Estimated cost at typical supermarket prices</span>
          </span>
        </span>
        {GROCERY_ROWS.map((row, i) => {
          if (row.aisle) {
            return (
              <span key={row.aisle} ref={set(`gRow${i}`)} className="pf-c pf-aisle" style={{ top: row.top }}>
                {row.aisle}
              </span>
            );
          }
          const item = row.index;
          const [photo, name, amount] = row.item!;
          return (
            <span key={name} ref={set(`gRow${i}`)} className="pf-c pf-item" style={{ top: row.top }}>
              <Image src={`/motion/grocery-${photo}.webp`} alt="" width={30} height={30} className="pf-item__photo" unoptimized />
              <span ref={set(`gName${item}`)} className="pf-item__name">
                {name}
              </span>
              <span className="pf-item__amount">{amount}</span>
              <span ref={set(`gBox${item}`)} className="pf-item__box">
                <svg ref={set(`gTick${item}`)} viewBox="0 0 16 16" width="12" height="12" aria-hidden>
                  <path d="M3.5 8.5 6.5 11.5 12.5 4.5" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </span>
          );
        })}
        <span ref={set("listFoot")} className="pf-c pf-list-foot">
          <span className="pf-list-foot__copy">Copy</span>
          <span ref={set("share")} className="pf-list-foot__share">
            <svg viewBox="0 0 16 16" width="13" height="13" aria-hidden>
              <path d="M8 10V2M5 5l3-3 3 3M3 8v5h10V8" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Share
          </span>
        </span>
      </div>
    </Film>
  );
}

function Cart() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden>
      <path
        d="M2 3h3l2.4 11.2a1.5 1.5 0 0 0 1.5 1.2h8.7a1.5 1.5 0 0 0 1.5-1.1L21 7H6.2"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="9.5" cy="19.5" r="1.6" fill="currentColor" />
      <circle cx="17" cy="19.5" r="1.6" fill="currentColor" />
    </svg>
  );
}

function Wallet() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden>
      <rect x="3" y="6" width="18" height="13" rx="2.5" fill="currentColor" />
      <path d="M6 6l9-3 1.5 3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <circle cx="16.5" cy="12.5" r="1.4" fill="#fff" />
    </svg>
  );
}
