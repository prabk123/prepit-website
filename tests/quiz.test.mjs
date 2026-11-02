// Unit tests for the web quiz (PRE-322, PRE-329, PRE-327; v9.2 screens, PRE-441): branching, unit maths, copy picks and what gets saved. Run with `yarn test`.
import assert from "node:assert/strict";
import { test } from "node:test";
import { parseBridgeHandoff } from "../src/lib/funnel/bridgeHandoff.ts";
import { buildWebSignupBody } from "../src/lib/funnel/webSignupProfile.ts";
import { withoutUrlSecrets } from "../src/lib/urlTokens.ts";
import {
  ageFrom,
  analyticsStepId,
  blockerReply,
  buildQuizProfile,
  canContinue,
  dayAnswers,
  demoReply,
  dietOptions,
  emptyAnswers,
  foodRules,
  goalWeightReply,
  healthyRange,
  heightCm,
  goalReply,
  leaveOutLine,
  monthFirst,
  nextScreen,
  numbersReply,
  parseTargets,
  planSummary,
  PLANS_REPLY,
  progress,
  resultTags,
  savedDiet,
  SAFETY_EATING_DISORDER,
  SAFETY_NONE,
  SAFETY_PREGNANT,
  SCREENS,
  scoresReply,
  startingPoint,
  targetsRequest,
  goalKg,
  toKg,
  trialDay,
  unitsFor,
  weightKg,
  weightText,
} from "../src/lib/quiz/quiz.ts";
import { drawnVisual, pickVisuals, VISUALS, visualCaptures, visualFinePrint } from "../src/lib/quiz/replyVisuals.ts";

const TODAY = new Date(2026, 9, 21);

function answers(patch = {}) {
  return {
    ...emptyAnswers(),
    goal: "Lose fat",
    blockers: ["Logging takes too long", "I crave snacks"],
    dayPatterns: ["dip"],
    gender: "female",
    dobDay: "14",
    dobMonth: "05",
    dobYear: "1991",
    heightUnit: "ft",
    unit: "imperial",
    feet: "5",
    inches: "6",
    pounds: "176",
    safety: [SAFETY_NONE],
    activity: "mostly_sitting",
    exercise: "one_to_two",
    diet: "eat everything",
    ...patch,
  };
}

function walk(a, from = "goal") {
  const path = [from];
  let id = from;
  while ((id = nextScreen(id, a, TODAY))) path.push(id);
  return path;
}

test("v9.2: 19 screens to the loader for Lose fat and Build muscle, 18 for the other goals", () => {
  const lose = walk(answers());
  // PRE-446: no email gate, name or plan page; the loader hands off to the cart.
  assert.deepEqual(lose, [
    "goal",
    "echo-goal",
    "blockers",
    "echo-blocker",
    "day",
    "echo-signals",
    "history",
    "demo",
    "gender",
    "numbers",
    "safety",
    "goalweight",
    "activity",
    "exercise",
    "diet",
    "intol",
    "week",
    "echo-plans",
    "loader",
  ]);
  assert.equal((walk(answers({ goal: "Build muscle" }))).length, 19);
  for (const goal of ["Improve energy", "Stay fuller", "Eat healthier", "Fuel training", "Maintain"]) {
    assert.equal((walk(answers({ goal }))).length, 18, goal);
  }
  assert.ok(!lose.includes("stop-age") && !lose.includes("stop-ed"));
  // Never with pregnancy.
  assert.ok(!walk(answers({ safety: [SAFETY_PREGNANT] })).includes("goalweight"));
  // Cut in v9.2.
  for (const cut of ["energy", "hunger", "mood", "dob", "hw", "mealhelp", "style"]) assert.ok(!SCREENS.some((s) => s.id === cut), cut);
  assert.equal(SCREENS.filter((s) => !s.branch).length, 19);
});

test("under 18 and an eating disorder go to their stop screens, which end the quiz", () => {
  assert.equal(nextScreen("numbers", answers({ dobYear: "2010" }), TODAY), "stop-age");
  assert.equal(nextScreen("numbers", answers({ dobYear: "2008", dobMonth: "10", dobDay: "21" }), TODAY), "safety");
  assert.equal(nextScreen("numbers", answers({ dobYear: "2008", dobMonth: "10", dobDay: "22" }), TODAY), "stop-age");
  assert.equal(nextScreen("safety", answers({ safety: [SAFETY_EATING_DISORDER, SAFETY_PREGNANT] }), TODAY), "stop-ed");
  assert.equal(nextScreen("stop-age", answers(), TODAY), null);
  assert.equal(nextScreen("stop-ed", answers(), TODAY), null);
  // Analytics can't tell the two stops apart, so it never learns either answer.
  assert.equal(analyticsStepId("stop-ed"), "stop");
  assert.equal(analyticsStepId("stop-age"), "stop");
  assert.equal(analyticsStepId("safety"), "safety");
});

test("dates of birth must be real and in the past", () => {
  assert.equal(ageFrom(answers(), TODAY), 35);
  assert.equal(ageFrom(answers({ dobDay: "31", dobMonth: "02" }), TODAY), null);
  assert.equal(ageFrom(answers({ dobYear: "199" }), TODAY), null);
  assert.equal(ageFrom(answers({ dobYear: "2030" }), TODAY), null);
  assert.equal(canContinue("numbers", answers({ dobMonth: "" }), TODAY), false);
  assert.equal(canContinue("numbers", answers(), TODAY), true);
  // One card: date of birth, height and weight all needed.
  assert.equal(canContinue("numbers", answers({ pounds: "" }), TODAY), false);
  assert.equal(canContinue("numbers", answers({ feet: "" }), TODAY), false);
});

test("units start from the country, with month first only in the US", () => {
  assert.deepEqual(unitsFor("US"), { heightUnit: "ft", unit: "imperial" });
  assert.deepEqual(unitsFor("GB"), { heightUnit: "ft", unit: "stones" });
  assert.deepEqual(unitsFor("DE"), { heightUnit: "cm", unit: "metric" });
  assert.deepEqual(unitsFor("AU"), { heightUnit: "cm", unit: "metric" });
  assert.equal(emptyAnswers("FR").unit, "metric");
  // Body numbers are never pre-filled.
  const empty = emptyAnswers("GB");
  assert.deepEqual([empty.feet, empty.stones, empty.dobYear, empty.heightCm, empty.weightKg], ["", "", "", "", ""]);
  assert.equal(monthFirst("US"), true);
  assert.equal(monthFirst("GB"), false);
});

test("the metabolism line shows for ages 20 to 59 only", () => {
  assert.equal(
    numbersReply(answers(), TODAY),
    "Good news: metabolism holds steady from 20 to 60, once body size is counted. I'll set your targets for age 35.",
  );
  assert.equal(numbersReply(answers({ dobYear: "2007" }), TODAY), "");
  assert.equal(numbersReply(answers({ dobYear: "1960" }), TODAY), "");
  assert.equal(numbersReply(answers({ dobYear: "" }), TODAY), "");
});

test("height and weight convert to cm and kg in every unit", () => {
  assert.equal(heightCm(answers()), 168);
  assert.equal(weightKg(answers()), 79.8);
  assert.equal(weightKg(answers({ unit: "stones", stones: "12", stonePounds: "8" })), 79.8);
  assert.equal(heightCm(answers({ heightUnit: "cm", heightCm: "180" })), 180);
  // Height and weight switch separately: feet and inches with kilograms.
  assert.equal(heightCm(answers({ unit: "metric", weightKg: "70" })), 168);
  assert.equal(weightKg(answers({ unit: "metric", weightKg: "72.5" })), 72.5);
  assert.equal(heightCm(answers({ feet: "" })), null);
  assert.equal(weightKg(answers({ pounds: "20" })), null);
  assert.equal(weightText(79.8, "imperial"), "176 lb");
  assert.equal(weightText(79.8, "stones"), "12 st 8 lb");
  assert.equal(weightText(79.8, "metric"), "80 kg");
  assert.equal(toKg("160", "imperial"), 72.6);
  assert.equal(toKg("", "metric"), undefined);
  // Stones take a stones box and a pounds box; 11 st 6 lb is 160 lb.
  assert.equal(goalKg("11", "stones", "6"), 72.6);
  assert.equal(goalKg("11", "stones"), toKg("154", "imperial"));
  assert.equal(goalKg("", "stones", "6"), undefined);
  assert.equal(goalKg("72", "metric"), 72);
});

test("a loss goal can't go below the healthy range for their height", () => {
  assert.deepEqual(healthyRange(168), [53, 70]);
  const low = answers({ goalWeightText: "100", goalWeightKg: toKg("100", "imperial") });
  assert.match(goalWeightReply(low), /^That's below the healthy range for your height. Your goal needs to be 117 lb or more\.$/);
  assert.equal(canContinue("goalweight", low), false);
  const fine = answers({ goalWeightText: "150", goalWeightKg: toKg("150", "imperial") });
  assert.equal(goalWeightReply(fine), "A healthy range for your height is 117 lb to 154 lb. I won't set a goal below it.");
  assert.equal(canContinue("goalweight", fine), true);
  // "I won't set a goal below it" holds for Build muscle too.
  assert.equal(canContinue("goalweight", { ...low, goal: "Build muscle" }), false);
});

function visualsFor(a) {
  return pickVisuals({
    "echo-goal": goalReply(a).visuals,
    "echo-blocker": blockerReply(a)?.visuals ?? [],
    "echo-signals": scoresReply(a).visuals,
    demo: demoReply(a).visuals,
    "echo-plans": PLANS_REPLY.visuals,
  });
}

const GOALS = ["Lose fat", "Build muscle", "Improve energy", "Stay fuller", "Eat healthier", "Fuel training", "Maintain"];
const BLOCKERS = [
  "Logging takes too long",
  "I get hungry",
  "I lose motivation",
  "I don't know what to eat",
  "I eat out or socialise a lot",
  "Weekends derail me",
  "I feel tired",
  "I crave snacks",
];
const DAYS = [["dip"], ["low"], ["hungry"], ["mood"], ["none"]];
const HISTORIES = ["Yes, with an app", "Yes, notes or photos", "I started, then stopped", "Never"];

test("across every route, a reply never repeats an earlier reply's capture, and a path has at most two stills", () => {
  let routes = 0;
  for (const goal of GOALS)
    for (const blocker of BLOCKERS)
      for (const dayPatterns of DAYS)
        for (const history of HISTORIES) {
          const picked = Object.values(visualsFor(answers({ goal, blockers: [blocker], dayPatterns, history })));
          const route = `${goal} / ${blocker} / ${dayPatterns} / ${history}`;
          assert.equal(picked.length, 5, route);
          // No image shows twice on a path: declared captures and drawn images both count.
          const seen = new Set();
          for (const p of picked)
            for (const capture of visualCaptures(drawnVisual(p))) {
              assert.ok(!seen.has(capture), `${route}: ${capture} repeats`);
              seen.add(capture);
            }
          // (visualCaptures lists each capture once per visual, so a repeat here is across replies.)
          const stills = picked.filter((p) => VISUALS[p.key].still && !p.bare).length;
          assert.ok(stills <= 2, route);
          routes += 1;
        }
  assert.equal(routes, 7 * 8 * 5 * 4);
  // A worked route: Improve energy, then Tired, then a dip. The goal reply already drew the oats breakfast, so the dip shows the 3pm snack.
  assert.deepEqual(
    visualsFor(answers({ goal: "Improve energy", blockers: ["I feel tired"], dayPatterns: ["dip"], history: "Never" })),
    {
      "echo-goal": { key: "energy", bare: false },
      "echo-blocker": { key: "dipmsg", bare: false },
      "echo-signals": { key: "dip2", bare: false },
      demo: { key: "typed", bare: false },
      "echo-plans": { key: "plan", bare: false },
    },
  );
  // The low-energy reply skips the check-in a Maintain path already showed.
  assert.equal(visualsFor(answers({ goal: "Maintain", dayPatterns: ["low"] }))["echo-signals"].key, "low2");
  // Steady days on Maintain skip the rings (shown) and the oats (the typed demo draws them next).
  assert.equal(visualsFor(answers({ goal: "Maintain", dayPatterns: ["none"] }))["echo-signals"].key, "steady4");
});

test("the fine print under each reply carries only the qualifiers its visual needs", () => {
  assert.equal(visualFinePrint({ key: "swap", bare: false }), "Real app screens from an example account.");
  assert.equal(
    visualFinePrint({ key: "dip", bare: false }),
    "Real app screens from an example account. Scores are estimates, not a medical measurement. Photo is illustrative.",
  );
  assert.equal(visualFinePrint({ key: "dip", bare: true }), "Real app screens from an example account. Scores are estimates, not a medical measurement.");
  assert.equal(visualFinePrint({ key: "plan", bare: false }), "Real app screens from an example account. Costs are estimates.");
});

test("each reply mirrors the answer it follows", () => {
  assert.equal(goalReply(answers()).eyebrow, "You said · Lose fat");
  assert.equal(goalReply(answers()).headline, "Lose fat in a way you can keep up.");
  // The sticking-point reply follows the first one tapped, not a fixed order.
  assert.equal(blockerReply(answers({ blockers: ["I crave snacks", "Logging takes too long"] })).eyebrow, "Your sticking point · Cravings");
  assert.equal(blockerReply(answers({ blockers: ["Logging takes too long", "I crave snacks"] })).eyebrow, "Your sticking point · Food diary");
  assert.equal(blockerReply(answers({ blockers: [] })), null);
  assert.equal(scoresReply(answers({ dayPatterns: ["mood", "dip"] })).headline, "Let's see what's behind your afternoon dip.");
  assert.equal(scoresReply(answers({ dayPatterns: ["none"] })).headline, "Steady already. Let's keep it that way.");
  assert.ok(scoresReply(answers({ dayPatterns: ["mood"] })).source.startsWith("White, Horwath and Conner 2013"));
  assert.equal(demoReply(answers({ history: "Yes, notes or photos" })).eyebrow, "You said · Yes, notes or photos");
  assert.deepEqual(demoReply(answers({ history: "Yes, notes or photos" })).visuals, ["photo"]);
  // Claims: no doctor in any reply, headlines at most 9 words, the nutritionist's line at most 30.
  const replies = [
    ...GOALS.map((goal) => goalReply(answers({ goal }))),
    ...BLOCKERS.map((b) => blockerReply(answers({ blockers: [b] }))),
    ...DAYS.map((dayPatterns) => scoresReply(answers({ dayPatterns }))),
    ...HISTORIES.map((history) => demoReply(answers({ history }))),
    PLANS_REPLY,
  ];
  for (const r of replies) {
    assert.ok(!/doctor|medic/i.test(r.headline + r.say), r.headline);
    assert.ok(r.headline.split(/\s+/).length <= 9, r.headline);
    assert.ok(r.say.split(/\s+/).length <= 30, r.say);
  }
});

test("Your day: none clears the others, and the older answers are written from it", () => {
  assert.deepEqual(dayAnswers(answers({ dayPatterns: ["dip", "hungry"] })), { energy: "I dip mid-afternoon", hunger: "Most days", mood: "Not really" });
  assert.deepEqual(dayAnswers(answers({ dayPatterns: ["none"] })), { energy: "Steady all day", hunger: "Rarely", mood: "Not really" });
  assert.equal(dayAnswers(answers({ dayPatterns: [] })), null);
  assert.equal(canContinue("day", answers({ dayPatterns: [] })), false);
  assert.equal(canContinue("day", answers({ dayPatterns: ["none"] })), true);
});

test("allergies and food rules need an answer: a pick or None of these", () => {
  assert.equal(canContinue("intol", answers()), false);
  assert.equal(canContinue("intol", answers({ noFoodRules: true })), true);
  assert.equal(canContinue("intol", answers({ intolerances: ["Egg"] })), true);
});

test("the starting point follows the design's rules", () => {
  assert.equal(startingPoint(answers({ skipsBreakfast: "Yes" })).why, "You said your energy dips in the afternoon and you often skip breakfast.");
  assert.equal(startingPoint(answers({ dayPatterns: ["none"], blockers: ["Weekends derail me"] })).name, "The weekend swing");
  assert.equal(startingPoint(answers({ dayPatterns: ["none"], blockers: [] })).name, "Your baseline");
});

test("Flexitarian, Halal and Kosher stay hidden until the backend and app support them", () => {
  assert.deepEqual(dietOptions().map((o) => o.value), ["eat everything", "pescetarian", "vegetarian", "vegan"]);
  assert.deepEqual(foodRules().map((r) => r.label), ["No pork", "No beef", "No alcohol"]);
  assert.ok(dietOptions(true).some((o) => o.value === "flexitarian"));
  assert.ok(foodRules(true).some((r) => r.label === "Halal"));
});

test("the plans reply says what plans leave out", () => {
  assert.equal(leaveOutLine(answers()), "");
  assert.equal(
    leaveOutLine(answers({ diet: "vegetarian", intolerances: ["Peanut", "Tree Nuts"], rules: ["Alcohol"] })),
    "Plans leave out meat and fish, peanuts, tree nuts and alcohol. If you have an allergy, always check labels.",
  );
});

test("the plan card's tags and dates", () => {
  assert.deepEqual(resultTags(answers({ diet: "vegan", intolerances: ["Egg"], rules: ["Pork"] })), [
    "Lose fat",
    "Keeping track",
    "Crave snacks",
    "Vegan",
    "No pork",
    "No eggs",
  ]);
  assert.equal(trialDay(1, TODAY), "Wed, Oct 21");
  assert.equal(trialDay(8, TODAY), "Wed, Oct 28");
});

test("progress fills section by section", () => {
  assert.deepEqual(progress("goal", answers()), [0, 0, 0, 0]);
  const bars = progress("gender", answers());
  assert.equal(bars[0], 1);
  assert.equal(bars[1], 1);
  assert.equal(bars[2], 0);
  // "Your day" is the second section in v9.2.
  assert.ok(progress("history", answers())[1] > 0);
  assert.deepEqual(progress("loader", answers()).slice(0, 3), [1, 1, 1]);
});

test("targets request: backend values, and no deficit when pregnant", () => {
  const request = targetsRequest(answers({ goalWeightKg: 70 }));
  assert.deepEqual(request, {
    gender: "female",
    weight: 79.8,
    height: 168,
    dob: "1991-05-14",
    dailyActivity: "mostly_sitting",
    exerciseFrequency: "one_to_two",
    goal: "lose weight",
    goalWeight: 70,
  });
  assert.equal(targetsRequest(answers({ safety: [SAFETY_PREGNANT], goalWeightKg: 60 })).goalWeight, 79.8);
  assert.equal(targetsRequest(answers({ gender: undefined })), null);
  assert.deepEqual(parseTargets({ nutritionalGoals: { calories: 1570.4, protein: 120, carbs: 150, fats: 52 }, resolvedGoalSpeed: 0.5 }), {
    calories: 1570,
    protein: 120,
    carbs: 150,
    fats: 52,
    resolvedGoalSpeed: 0.5,
  });
  assert.equal(parseTargets({ nutritionalGoals: { calories: "x" } }), null);
});

test("the saved profile passes the backend's own cleaning untouched", () => {
  const a = answers({
    goalWeightKg: 70,
    diet: "pescetarian",
    intolerances: ["Dairy"],
    rules: ["Pork"],
    dayPatterns: ["dip", "mood"],
    history: "I started, then stopped",
    skipsBreakfast: "No",
  });
  const profile = buildQuizProfile(a, { calories: 1500, protein: 120, carbs: 140, fats: 50, resolvedGoalSpeed: 0.5 });
  assert.deepEqual(profile.settings, {
    goal: "lose weight",
    goalWeight: 70,
    goalSpeed: 0.5,
    dailyActivity: "mostly_sitting",
    exerciseFrequency: "one_to_two",
    diet: "pescetarian",
    intolerances: ["Dairy", "Pork"],
    mainBlocker: ["Logging takes too long", "I crave snacks"],
    unit: "imperial",
  });
  const body = buildWebSignupBody({ funnelId: "quiz", ...profile });
  assert.deepEqual(body.settings, profile.settings);
  // No name from the quiz any more (PRE-446): it comes from the Apple or Google sign-in.
  assert.deepEqual(body.user, { dob: "1991-05-14", gender: "female", height: 168, weight: 79.8 });
  assert.deepEqual(
    body.answers.map((answer) => answer.questionId),
    ["day_patterns", "afternoon_energy", "hunger_between_meals", "food_and_mood", "tracking_history", "safety", "skips_breakfast"],
  );
  assert.deepEqual(body.answers[0].answer, ["dip", "mood"]);
  // The older answers match what PRE-435's backend writes from day_patterns.
  assert.deepEqual(
    body.answers.slice(1, 4).map((answer) => answer.answer),
    ["I dip mid-afternoon", "Rarely", "Yes, often"],
  );
  // meal_help and advice_style are no longer asked.
  assert.ok(!body.answers.some((answer) => ["meal_help", "advice_style"].includes(answer.questionId)));
  assert.equal(buildQuizProfile(answers({ unit: "metric", weightKg: "80" })).settings.unit, "metric");
  assert.equal(buildQuizProfile(answers({ unit: "stones", stones: "12", stonePounds: "8" })).settings.unit, "imperial");
});

test("the bridge reads back the quiz's handoff and plan summary", () => {
  const a = answers();
  const summary = planSummary(a, { calories: 1500, protein: 120, carbs: 140, fats: 50 });
  assert.deepEqual(summary, { tags: ["Lose fat", "Keeping track", "Crave snacks"], calories: 1500, proteinGrams: 120 });
  const handoff = parseBridgeHandoff(
    JSON.stringify({ funnelId: "quiz", ...buildQuizProfile(a), planSummary: summary, savedAt: Date.now() }),
  );
  assert.equal(handoff.funnelId, "quiz");
  assert.deepEqual(handoff.planSummary, summary);
  assert.equal(handoff.settings.goal, "lose weight");
});

test("goals with no goal-weight screen send the current weight, so sign-in can create the account", () => {
  for (const goal of ["Improve energy", "Stay fuller", "Eat healthier", "Fuel training", "Maintain"]) {
    const a = answers({ goal });
    assert.equal(targetsRequest(a).goalWeight, 79.8, goal);
    assert.equal(buildQuizProfile(a).settings.goalWeight, 79.8, goal);
  }
  assert.equal(buildQuizProfile(answers({ goal: "Build muscle", goalWeightKg: 85 })).settings.goalWeight, 85);
});

test("halal and kosher save as the app saves them (PRE-328)", () => {
  assert.deepEqual(savedDiet(answers({ rules: ["Halal"] })), { diet: "halal", intolerances: [] });
  assert.deepEqual(savedDiet(answers({ diet: "vegetarian", intolerances: ["Shellfish"], rules: ["Kosher", "Beef"] })), {
    diet: "vegetarian",
    intolerances: ["Shellfish", "Pork", "Crustacean", "Mollusc", "Beef"],
  });
  assert.deepEqual(savedDiet(answers({ rules: ["Kosher", "Halal"] })), {
    diet: "kosher",
    intolerances: ["Pork", "Alcohol"],
  });
  const body = buildWebSignupBody({ funnelId: "quiz", ...buildQuizProfile(answers({ rules: ["Halal"] })) });
  assert.equal(body.settings.diet, "halal");
  assert.equal(leaveOutLine(answers({ rules: ["Kosher"] }), true), "Plans leave out pork, shellfish, crustaceans and molluscs.");
});

test("the starting point only repeats what they said", () => {
  assert.equal(startingPoint(answers({ dayPatterns: ["low"] })).why, "You said your energy is low most days.");
  const graze = startingPoint(answers({ dayPatterns: ["none"], blockers: ["I crave snacks"], eveningSnacks: "No" }));
  assert.equal(graze.name, "The between-meal graze");
  assert.equal(graze.why, "You said snack cravings get in the way.");
  assert.equal(
    startingPoint(answers({ dayPatterns: ["hungry"], blockers: [], eveningSnacks: "Yes" })).why,
    "You said evenings are when you snack most and hunger shows up between meals.",
  );
});

test("analytics URLs never keep an email link's token", () => {
  assert.equal(withoutUrlSecrets("https://tryprepit.app/my-plan?token=abc"), "https://tryprepit.app/my-plan");
  assert.equal(withoutUrlSecrets("https://tryprepit.app/p?token=abc&utm_source=email"), "https://tryprepit.app/p?utm_source=email");
  assert.equal(withoutUrlSecrets("https://tryprepit.app/p?a=1&token=abc#x"), "https://tryprepit.app/p?a=1#x");
  assert.equal(withoutUrlSecrets("https://tryprepit.app/p?mytoken=1"), "https://tryprepit.app/p?mytoken=1");
});

test("analytics URLs keep only utm_* on pages that carry a credential", () => {
  assert.equal(
    withoutUrlSecrets("https://www.tryprepit.app/auth/link?mode=signIn&oobCode=abc&apiKey=xyz&lang=en"),
    "https://www.tryprepit.app/auth/link",
  );
  assert.equal(withoutUrlSecrets("https://tryprepit.app/my-plan?t=abc&x=1"), "https://tryprepit.app/my-plan");
  assert.equal(
    withoutUrlSecrets("https://tryprepit.app/my-plan?token=abc&utm_source=email&utm_campaign=plan"),
    "https://tryprepit.app/my-plan?utm_source=email&utm_campaign=plan",
  );
  assert.equal(withoutUrlSecrets("https://tryprepit.app/email-preferences/x?k=1#top"), "https://tryprepit.app/email-preferences/x#top");
  assert.equal(withoutUrlSecrets("https://tryprepit.app/account?token=abc"), "https://tryprepit.app/account");
  assert.equal(withoutUrlSecrets("https://tryprepit.app/accounting?a=1"), "https://tryprepit.app/accounting?a=1");
});

test("analytics URLs never keep a sign-in code on any page", () => {
  assert.equal(withoutUrlSecrets("https://tryprepit.app/?oobCode=abc&utm_source=x"), "https://tryprepit.app/?utm_source=x");
  assert.equal(withoutUrlSecrets("https://tryprepit.app/p?apiKey=k"), "https://tryprepit.app/p");
  assert.equal(
    withoutUrlSecrets("https://tryprepit.app/p?mode=signIn&oobCode=abc&apiKey=k&lang=en#x"),
    "https://tryprepit.app/p?mode=signIn&lang=en#x",
  );
  assert.equal(withoutUrlSecrets("https://tryprepit.app/p?token=a&oobCode=b"), "https://tryprepit.app/p");
  assert.equal(withoutUrlSecrets("https://tryprepit.app/p?token=a&token=b&x=1"), "https://tryprepit.app/p?x=1");
  assert.equal(withoutUrlSecrets("/p?mode=signIn&oobCode=abc&apiKey=k"), "/p?mode=signIn");
  assert.equal(withoutUrlSecrets("Plan your week"), "Plan your week");
  assert.equal(withoutUrlSecrets("/my-plan"), "/my-plan");
});
