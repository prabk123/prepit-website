// Unit tests for the web quiz (PRE-322, PRE-329, PRE-327): branching, unit maths, copy picks and what gets saved. Run with `yarn test`.
import assert from "node:assert/strict";
import { test } from "node:test";
import { parseBridgeHandoff } from "../src/lib/funnel/bridgeHandoff.ts";
import { buildWebSignupBody } from "../src/lib/funnel/webSignupProfile.ts";
import { withoutUrlSecrets } from "../src/lib/urlTokens.ts";
import {
  ageFrom,
  analyticsStepId,
  buildQuizProfile,
  canContinue,
  dietOptions,
  emptyAnswers,
  foodRules,
  goalWeightReply,
  healthyRange,
  heightCm,
  leaveOutLine,
  mediaPlan,
  nextScreen,
  parseTargets,
  planSummary,
  progress,
  resultHeadline,
  resultTags,
  savedDiet,
  SAFETY_EATING_DISORDER,
  SAFETY_NONE,
  SAFETY_PREGNANT,
  SCREENS,
  signalsLine,
  startingPoint,
  targetsRequest,
  toKg,
  trialDay,
  weightKg,
  weightText,
} from "../src/lib/quiz/quiz.ts";

const TODAY = new Date(2026, 9, 21);

function answers(patch = {}) {
  return {
    ...emptyAnswers(),
    goal: "Lose fat",
    blockers: ["Logging takes too long", "I crave snacks"],
    energy: "I dip mid-afternoon",
    hunger: "Sometimes",
    gender: "female",
    dobDay: "14",
    dobMonth: "05",
    dobYear: "1991",
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

test("the main path has 27 screens for a weight goal and skips goal weight otherwise", () => {
  const lose = walk(answers());
  assert.equal(lose.length, 27);
  assert.equal(lose.at(-1), "result");
  assert.ok(lose.includes("goalweight"));
  assert.ok(!lose.includes("stop-age") && !lose.includes("stop-ed"));
  assert.ok(!walk(answers({ goal: "Improve energy" })).includes("goalweight"));
  assert.ok(!walk(answers({ safety: [SAFETY_PREGNANT] })).includes("goalweight"));
  assert.equal(SCREENS.filter((s) => !s.branch).length, 27);
});

test("under 18 and an eating disorder go to their stop screens, which end the quiz", () => {
  assert.equal(nextScreen("dob", answers({ dobYear: "2010" }), TODAY), "stop-age");
  assert.equal(nextScreen("dob", answers({ dobYear: "2008", dobMonth: "10", dobDay: "21" }), TODAY), "hw");
  assert.equal(nextScreen("dob", answers({ dobYear: "2008", dobMonth: "10", dobDay: "22" }), TODAY), "stop-age");
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
  assert.equal(canContinue("dob", answers({ dobMonth: "" }), TODAY), false);
});

test("height and weight convert to cm and kg in every unit", () => {
  assert.equal(heightCm(answers()), 168);
  assert.equal(weightKg(answers()), 79.8);
  assert.equal(weightKg(answers({ unit: "stones", stones: "12", stonePounds: "8" })), 79.8);
  assert.equal(heightCm(answers({ unit: "metric", heightCm: "180" })), 180);
  assert.equal(weightKg(answers({ unit: "metric", weightKg: "72.5" })), 72.5);
  assert.equal(heightCm(answers({ feet: "" })), null);
  assert.equal(weightKg(answers({ pounds: "20" })), null);
  assert.equal(weightText(79.8, "imperial"), "176 lb");
  assert.equal(weightText(79.8, "stones"), "12 st 8 lb");
  assert.equal(weightText(79.8, "metric"), "80 kg");
  assert.equal(toKg("160", "imperial"), 72.6);
  assert.equal(toKg("", "metric"), undefined);
});

test("a loss goal can't go below the healthy range for their height", () => {
  assert.deepEqual(healthyRange(168), [53, 70]);
  const low = answers({ goalWeightText: "100", goalWeightKg: toKg("100", "imperial") });
  assert.match(goalWeightReply(low), /^That's below the healthy range for your height. Your goal needs to be 117 lb or more\.$/);
  assert.equal(canContinue("goalweight", low), false);
  const fine = answers({ goalWeightText: "150", goalWeightKg: toKg("150", "imperial") });
  assert.equal(goalWeightReply(fine), "A healthy weight range for your height is 117 lb to 154 lb.");
  assert.equal(canContinue("goalweight", fine), true);
});

test("reply pages never show the same app screen twice", () => {
  const plan = mediaPlan(answers({ goal: "Improve energy", blockers: ["I feel tired"] }));
  assert.deepEqual(plan, { goal: "signals", blocker: "rings", signals: "home", plans: "planHead" });
  const values = Object.values(mediaPlan(answers()));
  assert.equal(new Set(values).size, values.length);
});

test("the scores reply and the starting point follow the design's rules", () => {
  assert.match(signalsLine(answers()), /dips mid-afternoon/);
  assert.match(signalsLine(answers({ energy: "Steady all day", hunger: "I graze all day" })), /Satiety is the one/);
  assert.equal(startingPoint(answers({ skipsBreakfast: "Yes" })).why, "You said your energy dips in the afternoon and you often skip breakfast.");
  assert.equal(startingPoint(answers({ energy: "Steady all day", blockers: ["Weekends derail me"] })).name, "The weekend swing");
  assert.equal(startingPoint(answers({ energy: "Steady all day", blockers: [] })).name, "Your baseline");
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

test("the plan page's headline, tags and dates", () => {
  assert.equal(resultHeadline(answers({ firstName: " Sam " })), "Sam, your fat-loss plan is ready");
  assert.equal(resultHeadline(answers()), "Your fat-loss plan is ready");
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
  const bars = progress("history", answers());
  assert.equal(bars[0], 1);
  assert.equal(bars[1], 0);
  assert.deepEqual(progress("result", answers()).slice(0, 3), [1, 1, 1]);
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
    mood: "Yes, often",
    skipsBreakfast: "No",
    firstName: "Sam",
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
  assert.deepEqual(body.user, { firstName: "Sam", dob: "1991-05-14", gender: "female", height: 168, weight: 79.8 });
  assert.deepEqual(
    body.answers.map((answer) => answer.questionId),
    ["afternoon_energy", "hunger_between_meals", "food_and_mood", "safety", "skips_breakfast"],
  );
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
  assert.equal(startingPoint(answers({ energy: "Low most days" })).why, "You said your energy is low most days.");
  const graze = startingPoint(answers({ energy: "Steady all day", blockers: ["I crave snacks"], eveningSnacks: "No" }));
  assert.equal(graze.name, "The between-meal graze");
  assert.equal(graze.why, "You said snack cravings get in the way.");
  assert.equal(
    startingPoint(answers({ energy: "Steady all day", blockers: [], eveningSnacks: "Yes", hunger: "Most days" })).why,
    "You said evenings are when you snack most and hunger shows up between meals.",
  );
});

test("analytics URLs never keep an email link's token", () => {
  assert.equal(withoutUrlSecrets("https://tryprepit.app/my-plan?token=abc"), "https://tryprepit.app/my-plan");
  assert.equal(withoutUrlSecrets("https://tryprepit.app/p?token=abc&utm_source=email"), "https://tryprepit.app/p?utm_source=email");
  assert.equal(withoutUrlSecrets("https://tryprepit.app/p?a=1&token=abc#x"), "https://tryprepit.app/p?a=1#x");
  assert.equal(withoutUrlSecrets("https://tryprepit.app/p?mytoken=1"), "https://tryprepit.app/p?mytoken=1");
});

test("analytics URLs drop the whole query on pages that carry a credential", () => {
  assert.equal(
    withoutUrlSecrets("https://www.tryprepit.app/auth/link?mode=signIn&oobCode=abc&apiKey=xyz&lang=en"),
    "https://www.tryprepit.app/auth/link",
  );
  assert.equal(withoutUrlSecrets("https://tryprepit.app/my-plan?t=abc&x=1"), "https://tryprepit.app/my-plan");
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
  assert.equal(withoutUrlSecrets("Plan your week"), "Plan your week");
  assert.equal(withoutUrlSecrets("/my-plan"), "/my-plan");
});
