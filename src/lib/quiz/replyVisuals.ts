/**
 * The quiz's reply visuals (PRE-441, v9.2): real app cut-outs on frosted
 * glass, built card by card, with an object still as an accent on a few.
 * Ported as data from Charlie's board (`V` in 2-quiz/index.html); the
 * component that draws them is components/quiz/ReplyVisual.tsx.
 *
 * Each composition lists the real captures it `uses`, so a later reply never
 * repeats an earlier one's capture, and stills stay accents: at most two in
 * one path. Kept free of React and browser APIs so it can be tested.
 */

/** One cut-out. Widths are % of the column (`wd` on desktop); `ov` is the overlap with the card above, in px. */
export type VisualCard = {
  img: string;
  alt: string;
  w: number;
  wd?: number;
  /** Right-aligned. */
  right?: boolean;
  ov?: number;
  ovd?: number;
  /** A black pin label above the card. */
  tag?: string;
  /** The image wipes in from the bottom (charts). */
  wipe?: boolean;
};

export type Visual = {
  uses: string[];
  /** Shows a score: the fine print adds the estimates line. */
  scores?: boolean;
  /** Shows a cost: the fine print adds "Costs are estimates." */
  cost?: boolean;
  /** An object still behind the cards, with its crop and desktop shape. */
  still?: { img: string; position: string; desktopRatio?: string };
  cards: VisualCard[];
};

const ENERGY_OATS = "One breakfast's Energy, up 34: Morning protein provides a steady power supply to your day. Enjoy these oats with a side of chia seeds or almonds.";
const CHECKIN = "Weekly check-in: Your steadiest week yet. Protein at lunch and fibre-rich breakfasts kept your Energy and Satiety in the green almost every day.";
const TODAY_SNACK = "In today's plan: snack at 3:30 pm, apple with peanut butter, 200 kcal, with Log it.";
const WEEK_RINGS = "Analysis, last 7 days: Energy 82, Satiety 79, Mood 78.";
const RINGS = "Today's scores: Energy 84, Satiety 96, Mood 87.";
const TODAY_ROWS = "Today's plan: snack at 3:30 pm, apple with peanut butter; dinner at 7:00 pm, Korean beef rice bowl, 440 kcal, each with Log it.";
const WEEKLY = "Weekly pattern: change a day and we spread the difference across the others, so your weekly total stays the same.";
const MSG_DIP = "Nutritionist: Last week it was toast and jam, and that's when the 3pm dip showed up. Keep doing what you're doing!";
const ROW_OATS = "Breakfast, 7:45 am: protein overnight oats with apple and cinnamon, Energy up 35, Satiety up 8, Mood up 12.";
const ROW_SALMON = "Dinner, 6:45 pm: Mediterranean salmon bowl with quinoa, Energy up 15, Satiety up 9, Mood up 19.";
const ROW_YOGURT = "Snack, 3:45 pm: Greek yogurt with raspberries, 168 kcal, Satiety up 9.";
const PLAN_HEAD = "A planned week: 17 Oct to 23 Oct, 21 meals.";
const PLAN_COST = "Estimated cost at typical supermarket prices, per week and per meal.";
const GROCERY = "Grocery list, 30 ingredients.";
const RING = (score: string, value: number): VisualCard => ({
  img: `ring-${score.toLowerCase()}`,
  alt: `Today's ${score} score: ${value}.`,
  w: 38,
  wd: 40,
  right: true,
  ov: -14,
});

export const VISUALS = {
  // Reply: goal
  swap: {
    uses: ["swap"],
    cards: [
      {
        img: "msg-swap",
        alt: "Nutritionist message: whether you want to explore swap ideas, adjust the prep, or change meals across several days, just let me know. Any updates will pop up as a card for you to confirm.",
        w: 94,
        wd: 90,
      },
      { img: "msg-alts", alt: "You: Can you suggest some alternatives?", w: 70, wd: 62, right: true, ov: 10 },
      {
        img: "swap-options",
        alt: "Three alternatives to pick from: Cod and sweet potato mash, chicken and vegetable stir-fry, tuna and pasta bake, or type your own.",
        w: 88,
        wd: 84,
        ov: 10,
      },
    ],
  },
  chart: {
    uses: ["chart"],
    cards: [
      { img: "chart", alt: "Protein per day for the last week, against a dashed 158 g target line.", w: 90, wd: 86, wipe: true },
      {
        img: "msg-chart",
        alt: "Nutritionist: Here's your protein for the last 7 days. Lunch does most of the work, so breakfast is the easiest place to add a few grams.",
        w: 80,
        wd: 74,
        right: true,
        ov: -34,
      },
    ],
  },
  energy: {
    uses: ["oats", "ring-energy"],
    scores: true,
    cards: [{ img: "why-energy-oats", alt: ENERGY_OATS, w: 100, wd: 96, tag: "One breakfast" }, RING("Energy", 84)],
  },
  satiety: {
    uses: ["oats", "ring-satiety"],
    scores: true,
    cards: [
      {
        img: "why-satiety-oats",
        alt: "One breakfast's Satiety, up 4: This breakfast keeps your appetite quiet for hours thanks to its high fibre content.",
        w: 100,
        wd: 96,
        tag: "One breakfast",
      },
      RING("Satiety", 96),
    ],
  },
  ask: {
    uses: ["ask"],
    cards: [
      { img: "me-breakfast", alt: "You: What's a good high-protein breakfast for tomorrow?", w: 80, wd: 72, right: true },
      {
        img: "msg-oats",
        alt: "Nutritionist: Your planned protein overnight oats with apple is actually set for tomorrow morning, packing 40 g of protein to keep your Energy steady through the morning.",
        w: 92,
        wd: 86,
        ov: 10,
      },
    ],
  },
  macros: {
    uses: ["home-eaten"],
    still: { img: "still-card4-leaner", position: "50% 30%" },
    cards: [
      {
        img: "home-eaten",
        alt: "Today so far: 1,481 kcal eaten of a 1,570 goal, on track. Carbs 131 of 136 g, protein 156 of 158 g, fat 39 of 44 g.",
        w: 90,
        wd: 80,
        right: true,
        ov: -96,
        ovd: -190,
      },
    ],
  },
  checkin: {
    uses: ["checkin", "rings"],
    scores: true,
    cards: [
      { img: "rings", alt: RINGS, w: 80, wd: 72 },
      { img: "checkin", alt: CHECKIN, w: 96, wd: 90, right: true, ov: -20, tag: "Weekly check-in" },
    ],
  },
  // Reply: sticking point
  logchat: {
    uses: ["logchat"],
    cards: [
      {
        img: "me-burrito",
        alt: "You: Love that. Just grabbed a chicken burrito bowl with rice, black beans, guac and salsa for dinner.",
        w: 86,
        wd: 76,
        right: true,
      },
      { img: "card-logit", alt: "Chicken burrito bowl, 674 kcal, carbs 71 g, protein 59 g, fat 16 g, with a Log it button.", w: 86, wd: 78, ov: 10 },
    ],
  },
  today: {
    uses: ["today", "strip"],
    cards: [
      { img: "today-rows", alt: TODAY_ROWS, w: 100, wd: 94, tag: "Today's plan" },
      { img: "week-strip", alt: "The plan's week: Saturday 17 to Friday 23.", w: 80, wd: 72, right: true, ov: 10 },
    ],
  },
  today2: { uses: ["today"], cards: [{ img: "today-rows", alt: TODAY_ROWS, w: 100, wd: 94, tag: "Today's plan" }] },
  focus: {
    uses: ["focus"],
    still: { img: "still-onechange", position: "50% 40%" },
    cards: [
      {
        img: "focus-head",
        alt: "Pick your focus. Choose one, or two. Your first pick is your main focus.",
        w: 92,
        wd: 84,
        right: true,
        ov: -96,
        ovd: -170,
        tag: "This week's focus",
      },
      {
        img: "focus-evenout",
        alt: "Focus option: Even out the day. Days tend to be back-loaded: dinners average 960 kcal vs 310 kcal at breakfast.",
        w: 84,
        wd: 76,
        right: true,
        ov: 8,
      },
    ],
  },
  weekly: {
    uses: ["weekly", "strip"],
    cards: [
      { img: "weekly-head", alt: WEEKLY, w: 100, wd: 94 },
      { img: "week-strip", alt: "A planned week: Saturday 17 to Friday 23.", w: 80, wd: 72, right: true, ov: 12 },
    ],
  },
  weekly2: { uses: ["weekly"], cards: [{ img: "weekly-head", alt: WEEKLY, w: 100, wd: 94 }] },
  social: {
    uses: ["social"],
    still: { img: "still-card6-menu", position: "50% 40%", desktopRatio: "5 / 4" },
    cards: [
      {
        img: "msg-social",
        alt: "Nutritionist: some days have run over your goal while the rest of the week sits close to it. That's completely normal when some days are busier or more social. Want to give them more room and take a little off the other days? Your week would still add up to the same total.",
        w: 92,
        wd: 84,
        right: true,
        ov: -96,
        ovd: -150,
        tag: "After a few weeks",
      },
    ],
  },
  dipmsg: {
    uses: ["dipmsg", "row-wrap"],
    scores: true,
    cards: [
      { img: "msg-dip", alt: MSG_DIP, w: 92, wd: 86 },
      {
        img: "row-wrap",
        alt: "Lunch, 12:30 pm: chicken wrap with hummus and salad, 462 kcal, Energy up 20, Satiety up 16, Mood up 15.",
        w: 84,
        wd: 78,
        right: true,
        ov: 12,
      },
    ],
  },
  dipmsg2: {
    uses: ["dipmsg", "row-salmon"],
    scores: true,
    cards: [
      { img: "msg-dip", alt: MSG_DIP, w: 92, wd: 86 },
      { img: "row-salmon", alt: "Dinner, 6:45 pm: Mediterranean salmon bowl with quinoa, 454 kcal, Energy up 15, Satiety up 9, Mood up 19.", w: 84, wd: 78, right: true, ov: 12 },
    ],
  },
  snacks: {
    uses: ["snacks"],
    cards: [
      { img: "msg-snacks", alt: "Nutritionist: We'll factor in those snacks to help keep things balanced.", w: 86, wd: 78, right: true },
      { img: "today-snack", alt: TODAY_SNACK, w: 94, wd: 86, ov: 10 },
    ],
  },
  hunger: {
    uses: ["hunger"],
    scores: true,
    cards: [
      {
        img: "why-satiety-lunch",
        alt: "One meal's Satiety: You can build more lasting fullness by increasing the portion of black beans. Adding a side of steamed broccoli or extra peppers would help too.",
        w: 100,
        wd: 94,
        tag: "One meal",
      },
      {
        img: "why-satiety",
        alt: "How Satiety is shaped: protein grams and protein share of calories are the largest lift to Satiety.",
        w: 88,
        wd: 80,
        right: true,
        ov: 12,
      },
    ],
  },
  // Reply: your scores
  dip: {
    uses: ["dip"],
    scores: true,
    still: { img: "still-desk-3pm", position: "50% 30%" },
    cards: [{ img: "why-energy-oats", alt: ENERGY_OATS, w: 94, wd: 86, right: true, ov: -96, ovd: -170, tag: "One breakfast" }],
  },
  // The same desk still with the 3:30 pm snack, for paths whose goal reply already showed the oats breakfast.
  dip2: {
    uses: ["dip", "snacks"],
    scores: true,
    still: { img: "still-desk-3pm", position: "50% 30%" },
    cards: [{ img: "today-snack", alt: TODAY_SNACK, w: 94, wd: 86, right: true, ov: -96, ovd: -170, tag: "Today's plan" }],
  },
  // And with the last 7 days, when the snack showed too.
  dip3: {
    uses: ["dip", "week-rings"],
    scores: true,
    still: { img: "still-desk-3pm", position: "50% 30%" },
    cards: [{ img: "week-rings", alt: WEEK_RINGS, w: 94, wd: 86, right: true, ov: -96, ovd: -170, tag: "Last 7 days" }],
  },
  low: {
    uses: ["checkin", "ring-energy"],
    scores: true,
    cards: [{ img: "checkin", alt: CHECKIN, w: 100, wd: 94, tag: "Weekly check-in" }, RING("Energy", 84)],
  },
  low2: {
    uses: ["week-rings"],
    scores: true,
    cards: [{ img: "week-rings", alt: WEEK_RINGS, w: 100, wd: 94, tag: "Last 7 days" }],
  },
  hungry: {
    uses: ["row-wrap", "row-yogurt"],
    scores: true,
    cards: [
      { img: "row-wrap", alt: "Lunch, 12:30 pm: chicken wrap with hummus and salad, Satiety up 16.", w: 88, wd: 82 },
      { img: "row-yogurt", alt: ROW_YOGURT, w: 88, wd: 82, right: true, ov: 10 },
    ],
  },
  hungry2: {
    uses: ["row-salmon", "row-yogurt"],
    scores: true,
    cards: [
      { img: "row-yogurt", alt: ROW_YOGURT, w: 88, wd: 82 },
      { img: "row-salmon", alt: "Dinner, 6:45 pm: Mediterranean salmon bowl with quinoa, Satiety up 9.", w: 88, wd: 82, right: true, ov: 10 },
    ],
  },
  mood: {
    uses: ["mood"],
    scores: true,
    cards: [
      {
        img: "why-mood",
        alt: "How Mood is shaped: heavier ultra-processed patterns in yesterday's log lower Mood, in line with observational research. 0% of calories from ultra-processed food.",
        w: 100,
        wd: 94,
        tag: "From yesterday's log",
      },
      RING("Mood", 87),
    ],
  },
  steady: {
    uses: ["rings", "oats"],
    scores: true,
    cards: [
      { img: "rings", alt: RINGS, w: 100, wd: 92 },
      { img: "row-oats", alt: ROW_OATS, w: 88, wd: 80, right: true, ov: 10 },
    ],
  },
  steady2: {
    uses: ["rings", "row-salmon"],
    scores: true,
    cards: [
      { img: "rings", alt: RINGS, w: 100, wd: 92 },
      { img: "row-salmon", alt: ROW_SALMON, w: 88, wd: 80, right: true, ov: 10 },
    ],
  },
  // Two meals and no breakfast oats, for paths whose goal reply showed today's rings (the typed demo draws the oats next).
  steady4: {
    uses: ["row-salmon", "row-yogurt"],
    scores: true,
    cards: [
      { img: "row-yogurt", alt: ROW_YOGURT, w: 88, wd: 80 },
      { img: "row-salmon", alt: ROW_SALMON, w: 88, wd: 80, right: true, ov: 10 },
    ],
  },
  steady3: {
    uses: ["oats", "row-salmon"],
    scores: true,
    cards: [
      { img: "row-oats", alt: ROW_OATS, w: 88, wd: 80 },
      { img: "row-salmon", alt: ROW_SALMON, w: 88, wd: 80, right: true, ov: 10 },
    ],
  },
  // Demo
  typed: {
    uses: ["typed"],
    cards: [
      { img: "field-oats", alt: "Typed into PrepIt: overnight oats with apple and cinnamon.", w: 94, wd: 86, right: true },
      {
        img: "row-oats",
        alt: "Logged at 7:45 am: protein overnight oats with apple and cinnamon, 357 kcal, Energy up 35, Satiety up 8, Mood up 12.",
        w: 84,
        wd: 78,
        ov: 8,
      },
    ],
  },
  photo: {
    uses: ["photo"],
    cards: [
      { img: "snap-burrito", alt: "A photo of a homemade chicken burrito bowl.", w: 42, wd: 38 },
      {
        img: "row-burrito",
        alt: "Logged at 12:47 pm: homemade chicken burrito bowl, 529 kcal, 59 g carbs, 50 g protein, 11 g fat.",
        w: 84,
        wd: 78,
        right: true,
        ov: -64,
        ovd: -80,
      },
    ],
  },
  // Reply: meal plans
  plan: {
    uses: ["plan", "strip"],
    cost: true,
    cards: [
      { img: "plan-head", alt: PLAN_HEAD, w: 56, wd: 50 },
      { img: "week-strip", alt: "Day by day: Saturday 17 to Friday 23.", w: 92, wd: 86, right: true, ov: 8 },
      { img: "grocery-row", alt: GROCERY, w: 86, wd: 80, ov: 8 },
      { img: "plan-cost", alt: PLAN_COST, w: 80, wd: 74, right: true, ov: 8 },
    ],
  },
  plan2: {
    uses: ["plan"],
    cost: true,
    cards: [
      { img: "plan-head", alt: PLAN_HEAD, w: 56, wd: 50 },
      { img: "grocery-row", alt: GROCERY, w: 86, wd: 80, right: true, ov: 8 },
      { img: "plan-cost", alt: PLAN_COST, w: 80, wd: 74, ov: 8 },
    ],
  },
} satisfies Record<string, Visual>;

export type VisualKey = keyof typeof VISUALS;

/** A picked visual. `bare` drops its still (a third still in one path) and the first card's overlap. */
export type PickedVisual = { key: VisualKey; bare: boolean };

/** The reply screens with visuals, in the order they appear. */
export const VISUAL_REPLIES = ["echo-goal", "echo-blocker", "echo-signals", "demo", "echo-plans"] as const;
export type VisualReply = (typeof VISUAL_REPLIES)[number];

const MAX_STILLS = 2;

/** What a visual shows: its declared captures plus every image it draws, so a token can't drift from the image. */
export function visualCaptures(visual: Visual): string[] {
  return [...new Set([...visual.uses, ...visual.cards.map((card) => card.img), ...(visual.still ? [visual.still.img] : [])])];
}

/**
 * Each reply's visual: the first option that shares no capture with an
 * earlier reply's, else its first option. A pick with a still after two
 * stills shows its cards alone.
 */
export function pickVisuals(options: Record<VisualReply, VisualKey[]>): Partial<Record<VisualReply, PickedVisual>> {
  const used = new Set<string>();
  let stills = 0;
  const picked: Partial<Record<VisualReply, PickedVisual>> = {};
  for (const reply of VISUAL_REPLIES) {
    const keys = options[reply];
    if (!keys.length) continue;
    const key = keys.find((k) => !visualCaptures(VISUALS[k]).some((u) => used.has(u))) ?? keys[0];
    const visual: Visual = VISUALS[key];
    const bare = Boolean(visual.still) && stills >= MAX_STILLS;
    picked[reply] = { key, bare };
    visualCaptures(visual).forEach((u) => used.add(u));
    if (visual.still && !bare) stills += 1;
  }
  return picked;
}

/** The one fine-print line under Continue: the qualifiers the captions used to carry. */
export function visualFinePrint(picked: PickedVisual | undefined): string {
  if (!picked) return "";
  const visual: Visual = VISUALS[picked.key];
  const lines = ["Real app screens from an example account."];
  if (visual.scores) lines.push("Scores are estimates, not a medical measurement.");
  if (visual.cost) lines.push("Costs are estimates.");
  if (visual.still && !picked.bare) lines.push("Photo is illustrative.");
  return lines.join(" ");
}

/** The picked visual as drawn: a bare pick loses its still and the first card's overlap. */
export function drawnVisual(picked: PickedVisual): Visual {
  const visual: Visual = VISUALS[picked.key];
  if (!picked.bare) return visual;
  return { ...visual, still: undefined, cards: visual.cards.map((card, i) => (i ? card : { ...card, ov: 0, ovd: 0 })) };
}
