"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import {
  AiLabel,
  Card,
  Chip,
  Eyebrow,
  FieldLabel,
  FinePrint,
  InlineReply,
  INPUT_CLASS,
  Note,
  OptionButton,
  Options,
  QUIZ_BUTTON_CLASS,
  QUIZ_GHOST_BUTTON_CLASS,
  Question,
  Said,
  Sub,
  Timeline,
  UnitField,
} from "@/components/quiz/parts";
import ReplyVisual from "@/components/quiz/ReplyVisual";
import LongLogo from "@/components/ui/LongLogo";
import QuizStartCta from "@/components/quiz/QuizStartCta";
import { readAttribution } from "@/lib/funnel/attributionStore";
import { writeBridgeHandoff } from "@/lib/funnel/bridgeHandoff";
import type { WebMarket } from "@/lib/markets";
import { type Prices, WEB_REMINDER_EMAIL_LIVE } from "@/lib/pricing";
import { trackQuizLead } from "@/lib/metaPixel";
import { fetchTargets, LeadApiError, saveLead } from "@/lib/quiz/leadApi";
import {
  ACTIVITY_OPTIONS,
  ALLERGENS,
  analyticsStepId,
  BLOCKER_OPTIONS,
  blockerReply,
  buildQuizProfile,
  canContinue,
  DAY_OPTIONS,

  demoReply,
  dietOptions,
  emptyAnswers,
  EXERCISE_OPTIONS,
  foodRules,
  GENDER_OPTIONS,
  GOAL_OPTIONS,
  goalReply,
  goalWeightReply,
  heightCm,
  HISTORY_OPTIONS,
  isStopScreen,
  leaveOutLine,
  MARKETING_CONSENT_TEXT,
  MONTHS,
  monthFirst,
  nextScreen,
  numbersReply,
  type Option,
  planSummary,
  PLANS_REPLY,
  startingPointId,
  progress,
  QUIZ_FUNNEL_ID,
  QUIZ_FUNNEL_VERSION,
  type QuizAnswers,
  type Reply,
  SAFETY_OPTIONS,
  safetyReply,
  scoresReply,
  type ScreenId,
  SECTIONS,
  sectionOf,
  SITTING_REPLY,
  type Targets,
  targetsRequest,
  trialDay,
  goalKg,
  weightKg,
  weightText,
} from "@/lib/quiz/quiz";
import { pickVisuals, type VisualReply, visualFinePrint } from "@/lib/quiz/replyVisuals";
import { getWebSessionId } from "@/lib/quiz/webSession";
import { trackWebFunnelEvent, WEB_FUNNEL_EVENTS } from "@/lib/webFunnelAnalytics";
import LoaderScreen from "./LoaderScreen";
import ResultScreen from "./ResultScreen";

/**
 * Kept for this tab only, so a refresh or a Back from the bridge keeps the
 * answers. v4 since the v9.2 screens (PRE-441): a v3 session's answers don't
 * fit the new screens, so it starts again.
 */
const STORAGE_KEY = "prepit.quiz.v4";

/** Single answers confirm, then move on after about this long (v9.2). */
const ADVANCE_MS = 250;

type Saved = { answers: QuizAnswers; screen: ScreenId; history: ScreenId[] };

function readSaved(country: string): Saved | null {
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<Saved>;
    if (!parsed.answers || !parsed.screen || !Array.isArray(parsed.history)) return null;
    // Never come back to a stop screen or the loader halfway.
    if (isStopScreen(parsed.screen)) return null;
    const screen = parsed.screen === "loader" ? "echo-plans" : parsed.screen;
    return { answers: { ...emptyAnswers(country), ...parsed.answers }, screen, history: parsed.history.filter((id) => id !== "loader") };
  } catch {
    return null;
  }
}

function writeSaved(saved: Saved | null) {
  try {
    if (saved) window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
    else window.sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // Storage blocked: the quiz still works, it just won't survive a refresh.
  }
}

const BACK_ICON = (
  <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden>
    <path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/** A segmented unit switch, e.g. ft, in | cm. */
function UnitSwitch<T extends string>({ label, value, options, onChange }: { label: string; value: T; options: [T, string][]; onChange: (value: T) => void }) {
  return (
    <div role="group" aria-label={label} className="inline-flex rounded-control bg-surface-raised p-[3px]">
      {options.map(([option, text]) => (
        <button
          key={option}
          type="button"
          aria-pressed={value === option}
          onClick={() => onChange(option)}
          className={`rounded-control px-3 py-[7px] text-[13px] font-medium focus-visible:outline-2 focus-visible:outline-focus ${
            value === option ? "bg-surface text-ink shadow-[0_1px_3px_rgb(0_0_0/0.12)]" : "text-ink-secondary"
          }`}
        >
          {text}
        </button>
      ))}
    </div>
  );
}

/** Where each screen sits: one column, text beside a visual on a wide screen, or the goal screen's hero. */
type Layout = "solo" | "split" | "hero";

/**
 * The web quiz (PRE-322; v9.2 screens and replies, PRE-441) with its stop
 * screens (PRE-329) and email gate (PRE-327): one screen at a time, then the
 * plan page, which hands the answers to the bridge (/start, PRE-323) in this
 * browser's storage.
 */
export default function Quiz({ country, market, prices }: { country: string; market: WebMarket; prices: Prices }) {
  const [answers, setAnswers] = useState<QuizAnswers>(() => emptyAnswers(country));
  const [screen, setScreen] = useState<ScreenId>("goal");
  const [history, setHistory] = useState<ScreenId[]>([]);
  const [restored, setRestored] = useState(false);
  // Targets for the answers they were fetched for, so a change after Back fetches again.
  const [fetched, setFetched] = useState<{ key: string; targets: Targets | null } | null>(null);
  const [emailState, setEmailState] = useState<"idle" | "saving" | "invalid">("idle");
  const leadSaved = useRef(false);
  const advanceTimer = useRef<number | null>(null);
  const firstScreen = useRef(true);

  useEffect(() => {
    const saved = readSaved(country);
    if (saved) {
      setAnswers(saved.answers);
      setScreen(saved.screen);
      setHistory(saved.history);
    }
    setRestored(true);
  }, [country]);

  useEffect(() => {
    if (restored) writeSaved({ answers, screen, history });
  }, [answers, screen, history, restored]);

  // Each screen: one step event (its id only), back to the top, focus on the question.
  // A stop screen sends no index either: where it falls would tell the two apart.
  useEffect(() => {
    if (!restored) return;
    trackWebFunnelEvent(WEB_FUNNEL_EVENTS.quizStepView, {
      funnel_id: QUIZ_FUNNEL_ID,
      funnel_version: QUIZ_FUNNEL_VERSION,
      step_id: analyticsStepId(screen),
      step_index: isStopScreen(screen) ? null : history.length,
    });
    if (isStopScreen(screen)) trackWebFunnelEvent(WEB_FUNNEL_EVENTS.quizEnded, { funnel_id: QUIZ_FUNNEL_ID, funnel_version: QUIZ_FUNNEL_VERSION });
    if (firstScreen.current) {
      firstScreen.current = false;
      return;
    }
    window.scrollTo({ top: 0 });
    document.querySelector<HTMLElement>("[data-quiz-heading]")?.focus({ preventScroll: true });
    // Only when the screen changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen, restored]);

  useEffect(() => () => {
    if (advanceTimer.current) window.clearTimeout(advanceTimer.current);
  }, []);

  const update = useCallback((patch: Partial<QuizAnswers>) => setAnswers((current) => ({ ...current, ...patch })), []);

  const goTo = (id: ScreenId | null) => {
    if (!id || id === screen) return;
    setHistory((h) => [...h, screen]);
    setScreen(id);
  };

  const next = (latest: QuizAnswers = answers) => goTo(nextScreen(screen, latest));

  const back = () => {
    if (advanceTimer.current) window.clearTimeout(advanceTimer.current);
    // Back never replays the loader's 12 seconds and questions.
    let index = history.length - 1;
    while (index > 0 && history[index] === "loader") index -= 1;
    if (index < 0 || history[index] === "loader") return;
    setScreen(history[index]);
    setHistory(history.slice(0, index));
  };

  const restart = () => {
    setAnswers(emptyAnswers(country));
    setHistory([]);
    setFetched(null);
    leadSaved.current = false;
    setScreen("goal");
  };

  /** A single choice: mark it, then move on, as the app does. `hold` keeps the screen open (Mostly sitting's line). */
  const choose = (key: keyof QuizAnswers, value: string, hold = false) => {
    const latest = { ...answers, [key]: value } as QuizAnswers;
    setAnswers(latest);
    if (advanceTimer.current) window.clearTimeout(advanceTimer.current);
    if (!hold) advanceTimer.current = window.setTimeout(() => next(latest), ADVANCE_MS);
  };

  const toggle = <K extends "blockers" | "safety" | "dayPatterns">(key: K, option: Option, options: Option[]) => {
    const current = answers[key] as string[];
    let values: string[];
    if (option.exclusive) values = current.includes(option.value) ? [] : [option.value];
    else {
      const exclusive = options.filter((o) => o.exclusive).map((o) => o.value);
      const kept = current.filter((v) => !exclusive.includes(v));
      // Kept in tap order: the first sticking point tapped picks the reply.
      values = kept.includes(option.value) ? kept.filter((v) => v !== option.value) : [...kept, option.value];
    }
    update({ [key]: values } as Partial<QuizAnswers>);
  };

  // The targets are fetched from the loader on (again after a reload or a
  // Back from the bridge); the plan page waits for them. undefined = loading.
  const request = targetsRequest(answers);
  const requestKey = request ? JSON.stringify(request) : "";
  const targets: Targets | null | undefined = !request ? null : fetched?.key === requestKey ? fetched.targets : undefined;
  const needsTargets = screen === "loader" || screen === "email" || screen === "name" || screen === "result";
  useEffect(() => {
    if (!needsTargets || !requestKey || fetched?.key === requestKey) return;
    let cancelled = false;
    fetchTargets(JSON.parse(requestKey) as Record<string, unknown>)
      .then((value) => !cancelled && setFetched({ key: requestKey, targets: value }))
      .catch(() => !cancelled && setFetched({ key: requestKey, targets: null }));
    return () => {
      cancelled = true;
    };
  }, [needsTargets, requestKey, fetched]);
  /**
   * Leaves the answers for the bridge in this browser. Written from the email
   * gate on, so "Start my free 7 days" on the plan email's page (same
   * browser) still carries them.
   */
  const writeHandoff = (latest: QuizAnswers) => {
    writeBridgeHandoff({
      funnelId: QUIZ_FUNNEL_ID,
      funnelVersion: QUIZ_FUNNEL_VERSION,
      ...buildQuizProfile(latest, targets),
      firstName: latest.firstName.trim() || undefined,
      email: latest.email.trim() || undefined,
      planSummary: planSummary(latest, targets),
      startingPoint: startingPointId(latest),
    });
  };

  const leadInput = (latest: QuizAnswers, webSessionId: string) => ({
    webSessionId,
    email: latest.email.trim(),
    marketingConsent: latest.marketingConsent,
    consentText: MARKETING_CONSENT_TEXT,
    country,
    funnelId: QUIZ_FUNNEL_ID,
    funnelVersion: QUIZ_FUNNEL_VERSION,
    ...buildQuizProfile(latest, targets),
    attribution: readAttribution(),
  });

  const submitEmail = async () => {
    if (emailState === "saving") return;
    setEmailState("saving");
    const webSessionId = getWebSessionId();
    let saved = false;
    let errorStatus: number | undefined;
    if (webSessionId) {
      try {
        await saveLead(leadInput(answers, webSessionId));
        saved = true;
      } catch (error) {
        errorStatus = error instanceof LeadApiError ? error.status : 0;
        // Only a refused address is theirs to fix; the gate has no skip.
        if (error instanceof LeadApiError && error.status === 400 && /email/i.test(error.details ?? "")) {
          setEmailState("invalid");
          return;
        }
        // Down, rate-limited or another field refused: the plan still shows, and the bridge saves the answers.
      }
    }
    leadSaved.current = saved;
    writeHandoff(answers);
    trackWebFunnelEvent(WEB_FUNNEL_EVENTS.quizLeadSaved, {
      funnel_id: QUIZ_FUNNEL_ID,
      saved,
      marketing_consent: answers.marketingConsent,
      ...(errorStatus !== undefined ? { error_status: errorStatus } : {}),
    });
    if (saved) trackQuizLead();
    setEmailState("idle");
    next();
  };

  const submitName = (skip: boolean) => {
    const latest = skip ? { ...answers, firstName: "" } : answers;
    if (skip) setAnswers(latest);
    // The plan email greets them by name: update the lead (same session id).
    const webSessionId = getWebSessionId();
    if (leadSaved.current && webSessionId && latest.firstName.trim()) {
      saveLead(leadInput(latest, webSessionId)).catch(() => undefined);
    }
    writeHandoff(latest);
    next(latest);
  };

  const startTrial = () => {
    writeHandoff(answers);
    trackWebFunnelEvent(WEB_FUNNEL_EVENTS.quizStartTrial, {
      funnel_id: QUIZ_FUNNEL_ID,
      market,
      targets_available: Boolean(targets),
      price_currency: prices.currency,
    });
  };

  const ok = canContinue(screen, answers);
  const showProgress = screen !== "result" && !isStopScreen(screen);
  const bars = progress(screen, answers);
  const section = sectionOf(screen);

  let body: ReactNode = null;
  let footer: ReactNode = null;
  let layout = "solo" as Layout;
  const continueButton = (label = "Continue", onClick: () => void = () => next(), enabled = ok) => (
    <button type="button" className={QUIZ_BUTTON_CLASS} disabled={!enabled} onClick={onClick}>
      {label}
    </button>
  );

  const single = (key: keyof QuizAnswers, question: string, options: Option[], sub?: string) => {
    body = (
      <>
        <Question>{question}</Question>
        {sub && <Sub>{sub}</Sub>}
        <Options label={question}>
          {options.map((option) => (
            <OptionButton
              key={option.value}
              option={option}
              selected={answers[key] === option.value}
              onClick={() => choose(key, option.value)}
            />
          ))}
        </Options>
      </>
    );
  };

  const multi = (key: "blockers" | "safety" | "dayPatterns", question: string, options: Option[], sub: string, after?: ReactNode) => {
    const picked = answers[key] as string[];
    body = (
      <>
        <Question>{question}</Question>
        <Sub>{sub}</Sub>
        <Options label={question}>
          {options.map((option) => (
            <OptionButton
              key={option.value}
              option={option}
              multi
              selected={picked.includes(option.value)}
              onClick={() => toggle(key, option, options)}
            />
          ))}
        </Options>
        {after}
      </>
    );
    footer = continueButton();
  };

  // Each reply's visual, never repeating an earlier reply's capture.
  const blocker = blockerReply(answers);
  const visuals = pickVisuals({
    "echo-goal": goalReply(answers).visuals,
    "echo-blocker": blocker?.visuals ?? [],
    "echo-signals": scoresReply(answers).visuals,
    demo: demoReply(answers).visuals,
    "echo-plans": PLANS_REPLY.visuals,
  });

  /** A reply: what they said, the headline, the nutritionist's note and the visual, with the fine print under Continue. */
  const reply = (id: VisualReply, r: Reply, extra?: ReactNode, label = "Continue") => {
    const picked = visuals[id];
    layout = "split";
    body = (
      <>
        <div className="flex min-w-0 flex-col gap-[18px]">
          <Said>{r.eyebrow}</Said>
          <Question>{r.headline}</Question>
          <Note say={r.say} source={r.source} />
          {extra}
        </div>
        {picked && (
          <div className="min-w-0 min-[900px]:sticky min-[900px]:top-28 min-[900px]:self-start">
            <ReplyVisual picked={picked} />
          </div>
        )}
      </>
    );
    footer = (
      <>
        {continueButton(label)}
        <FinePrint>{visualFinePrint(picked)}</FinePrint>
      </>
    );
  };

  /** The nutritionist's line inside a question screen; the empty wrapper keeps the line from replaying the screen's entrance. */
  const inline = (line: string, ai = true) => <div className="empty:hidden">{line && <InlineReply ai={ai}>{line}</InlineReply>}</div>;

  switch (screen) {
    case "goal":
      single("goal", "What do you want help with first?", GOAL_OPTIONS, "A few quick questions, then your daily targets and where your nutritionist would start.");
      layout = "hero";
      body = (
        <>
          <div className="quiz-band relative -mx-5 -mt-2 h-[168px] overflow-hidden min-[900px]:hidden">
            <Image
              src="/quiz/v9/band-fork.webp"
              alt="A row of everyday forks and spoons from different lives, on cream"
              fill
              priority
              sizes="100vw"
              className="object-cover object-[50%_38%]"
            />
          </div>
          <AiLabel />
          {body}
          <p className="text-[13px] leading-[1.45] text-ink-muted">
            By continuing you agree to our{" "}
            <Link className="text-ink-secondary underline" href="/terms-and-conditions">
              Terms
            </Link>{" "}
            and{" "}
            <Link className="text-ink-secondary underline" href="/privacy-policy">
              Privacy Policy
            </Link>
            . We never sell your data. Photo is illustrative.
          </p>
        </>
      );
      break;

    case "echo-goal":
      reply("echo-goal", goalReply(answers));
      break;

    case "blockers":
      multi("blockers", "What usually gets in the way?", BLOCKER_OPTIONS, "Pick any.");
      break;

    case "echo-blocker":
      if (blocker) reply("echo-blocker", blocker);
      else {
        // Not reachable (Continue needs a pick); kept so the screen is never blank.
        body = <Question>No sticking point picked.</Question>;
        footer = continueButton();
      }
      break;

    case "day":
      multi("dayPatterns", "Which of these sound like your day?", DAY_OPTIONS, "Pick any.");
      break;

    case "echo-signals":
      reply("echo-signals", scoresReply(answers));
      break;

    case "history":
      single("history", "Have you tried keeping track of what you eat before?", HISTORY_OPTIONS);
      break;

    case "demo":
      reply("demo", demoReply(answers));
      break;

    case "gender":
      single("gender", "Your gender", GENDER_OPTIONS, "This helps set your daily targets.");
      break;

    case "numbers": {
      const dayField = (
        <input
          key="day"
          id="dob-day"
          className={INPUT_CLASS}
          inputMode="numeric"
          autoComplete="bday-day"
          aria-label="Day"
          maxLength={2}
          placeholder="Day"
          value={answers.dobDay}
          onChange={(event) => update({ dobDay: event.target.value.replace(/\D/g, "") })}
        />
      );
      const monthField = (
        <select
          key="month"
          id="dob-month"
          aria-label="Month"
          className={`${INPUT_CLASS} px-2.5`}
          value={answers.dobMonth}
          onChange={(event) => update({ dobMonth: event.target.value })}
        >
          <option value="" disabled>
            Month
          </option>
          {MONTHS.map((month, index) => (
            <option key={month} value={String(index + 1).padStart(2, "0")}>
              {month}
            </option>
          ))}
        </select>
      );
      const yearField = (
        <input
          key="year"
          id="dob-year"
          className={INPUT_CLASS}
          inputMode="numeric"
          autoComplete="bday-year"
          aria-label="Year"
          maxLength={4}
          placeholder="Year"
          value={answers.dobYear}
          onChange={(event) => update({ dobYear: event.target.value.replace(/\D/g, "") })}
        />
      );
      const usDates = monthFirst(country);
      body = (
        <>
          <Question>Your date of birth, height and weight</Question>
          <Sub>Used for your daily targets.</Sub>
          <div role="group" aria-labelledby="dob-label">
            <p id="dob-label" className="mb-1.5 text-[13px] text-ink-muted">
              Date of birth
            </p>
            <div className={`grid gap-2 ${usDates ? "grid-cols-[1.3fr_0.8fr_1fr]" : "grid-cols-[0.8fr_1.3fr_1fr]"}`}>
              {usDates ? [monthField, dayField, yearField] : [dayField, monthField, yearField]}
            </div>
          </div>
          {inline(numbersReply(answers))}
          <div>
            <div className="mb-1.5 flex items-center justify-between gap-2">
              <span className="text-[13px] text-ink-muted">Height</span>
              <UnitSwitch
                label="Height unit"
                value={answers.heightUnit}
                options={[
                  ["ft", "ft, in"],
                  ["cm", "cm"],
                ]}
                onChange={(heightUnit) => update({ heightUnit })}
              />
            </div>
            {answers.heightUnit === "cm" ? (
              <UnitField id="height-cm" label="Height in centimetres" unit="cm" value={answers.heightCm} onChange={(value) => update({ heightCm: value })} />
            ) : (
              <div className="flex gap-2">
                <UnitField id="feet" label="Feet" unit="ft" value={answers.feet} onChange={(feet) => update({ feet })} />
                <UnitField id="inches" label="Inches" unit="in" value={answers.inches} onChange={(inches) => update({ inches })} />
              </div>
            )}
          </div>
          <div>
            <div className="mb-1.5 flex items-center justify-between gap-2">
              <span className="text-[13px] text-ink-muted">Weight</span>
              <UnitSwitch
                label="Weight unit"
                value={answers.unit}
                options={[
                  ["imperial", "lb"],
                  ["stones", "st, lb"],
                  ["metric", "kg"],
                ]}
                onChange={(unit) => update({ unit, goalWeightText: "", goalStonePounds: "", goalWeightKg: undefined })}
              />
            </div>
            {answers.unit === "metric" ? (
              <UnitField id="weight-kg" label="Weight in kilograms" unit="kg" decimal value={answers.weightKg} onChange={(value) => update({ weightKg: value })} />
            ) : answers.unit === "stones" ? (
              <div className="flex gap-2">
                <UnitField id="stones" label="Stones" unit="st" value={answers.stones} onChange={(stones) => update({ stones })} />
                <UnitField id="stone-pounds" label="Pounds" unit="lb" value={answers.stonePounds} onChange={(stonePounds) => update({ stonePounds })} />
              </div>
            ) : (
              <UnitField id="pounds" label="Weight in pounds" unit="lb" decimal value={answers.pounds} onChange={(pounds) => update({ pounds })} />
            )}
          </div>
        </>
      );
      footer = continueButton();
      break;
    }

    case "stop-age":
      body = (
        <>
          <Question>PrepIt is for adults.</Question>
          <Sub>
            Thanks for your interest. PrepIt&apos;s plans are built for people aged 18 and over, so we can&apos;t make one for you.
          </Sub>
        </>
      );
      footer = (
        <button type="button" className={QUIZ_GHOST_BUTTON_CLASS} onClick={restart}>
          Back to the start
        </button>
      );
      break;

    case "safety":
      multi("safety", "Does any of this apply to you right now?", SAFETY_OPTIONS, "So your plan is safe for you.", inline(safetyReply(answers)));
      break;

    case "stop-ed":
      body = (
        <>
          <Question>Thanks for telling us.</Question>
          <Sub>PrepIt sets food targets, and that isn&apos;t the right kind of help while you&apos;re dealing with an eating disorder.</Sub>
          <Card>
            {country === "GB" ? (
              <p className="text-[15px] text-ink-secondary">
                Your doctor or a specialist service is a good next step. In the UK, Beat runs a free helpline and webchat at{" "}
                <a className="font-semibold text-ink underline" href="https://www.beateatingdisorders.org.uk" target="_blank" rel="noopener noreferrer">
                  beateatingdisorders.org.uk
                </a>
                .
              </p>
            ) : (
              <p className="text-[15px] text-ink-secondary">
                Your doctor or a specialist service is a good next step. In the US, ANAD runs a free eating disorder helpline on{" "}
                <a className="font-semibold text-ink underline" href="tel:+18883757767">
                  888-375-7767
                </a>{" "}
                and support groups at{" "}
                <a className="font-semibold text-ink underline" href="https://anad.org" target="_blank" rel="noopener noreferrer">
                  anad.org
                </a>
                . If you&apos;re in crisis, call or text 988.
              </p>
            )}
          </Card>
        </>
      );
      footer = (
        <button type="button" className={QUIZ_GHOST_BUTTON_CLASS} onClick={restart}>
          Back to the start
        </button>
      );
      break;

    case "goalweight": {
      const current = weightKg(answers);
      const isLb = answers.unit !== "metric";
      body = (
        <>
          <Question>What&apos;s your goal weight?</Question>
          {current !== null && <Sub>Now: {weightText(current, answers.unit)}</Sub>}
          <div>
            <FieldLabel htmlFor="goal-weight">Goal weight</FieldLabel>
            {answers.unit === "stones" ? (
              <div className="grid grid-cols-2 gap-2.5">
                <UnitField
                  id="goal-weight"
                  label="Goal weight, stones"
                  unit="st"
                  value={answers.goalWeightText}
                  onChange={(value) =>
                    update({ goalWeightText: value, goalWeightKg: goalKg(value, "stones", answers.goalStonePounds) })
                  }
                />
                <UnitField
                  id="goal-stone-pounds"
                  label="Goal weight, pounds"
                  unit="lb"
                  value={answers.goalStonePounds ?? ""}
                  onChange={(value) =>
                    update({ goalStonePounds: value, goalWeightKg: goalKg(answers.goalWeightText, "stones", value) })
                  }
                />
              </div>
            ) : (
              <UnitField
                id="goal-weight"
                label={`Goal weight in ${isLb ? "pounds" : "kilograms"}`}
                unit={isLb ? "lb" : "kg"}
                decimal
                value={answers.goalWeightText}
                onChange={(value) => update({ goalWeightText: value, goalWeightKg: goalKg(value, answers.unit) })}
              />
            )}
          </div>
          {heightCm(answers) !== null && inline(goalWeightReply(answers))}
        </>
      );
      footer = continueButton();
      break;
    }

    case "activity":
      body = (
        <>
          <Question>How active is your typical day?</Question>
          <Sub>Your job and everyday movement, not exercise.</Sub>
          <Options label="How active is your typical day?">
            {ACTIVITY_OPTIONS.map((option) => (
              <OptionButton
                key={option.value}
                option={option}
                selected={answers.activity === option.value}
                // Mostly sitting waits for Continue, so its line can be read.
                onClick={() => choose("activity", option.value, option.value === "mostly_sitting")}
              />
            ))}
          </Options>
          {inline(answers.activity === "mostly_sitting" ? SITTING_REPLY : "")}
        </>
      );
      if (answers.activity === "mostly_sitting") footer = continueButton();
      break;

    case "exercise":
      single("exercise", "How often do you exercise?", EXERCISE_OPTIONS, "Gym sessions, runs, classes.");
      break;

    case "diet":
      single("diet", "Which of these fits how you eat?", dietOptions(), "Plans leave out what you don't eat.");
      body = (
        <>
          {body}
          <details className="group border-t border-line pt-3 text-small text-ink-secondary">
            <summary className="flex cursor-pointer list-none gap-1 font-medium text-ink [&::-webkit-details-marker]:hidden">
              High protein, low carb or keto?
              <span aria-hidden className="text-ink-muted group-open:hidden">+</span>
              <span aria-hidden className="hidden text-ink-muted group-open:inline">−</span>
            </summary>
            <p className="mt-2 leading-[1.5]">
              They&apos;re goals, not rules about which foods you eat. Everyone gets a protein target from their weight and goal, and you can change your
              targets any time.
            </p>
          </details>
        </>
      );
      break;

    case "intol": {
      const flip = (key: "intolerances" | "rules", value: string) => {
        const list = answers[key];
        update({ [key]: list.includes(value) ? list.filter((v) => v !== value) : [...list, value], noFoodRules: false });
      };
      body = (
        <>
          <Question>Any allergies, intolerances or food rules?</Question>
          <Sub>Pick any.</Sub>
          <div role="group" aria-labelledby="allergies-label" className="flex flex-col gap-2">
            <p id="allergies-label" className="text-[12px] font-bold uppercase tracking-[0.1em] text-ink-muted">
              Allergies and intolerances
            </p>
            <div className="flex flex-wrap gap-2">
              {ALLERGENS.map(([value, label]) => (
                <Chip key={value} selected={answers.intolerances.includes(value)} onClick={() => flip("intolerances", value)}>
                  {label}
                </Chip>
              ))}
            </div>
          </div>
          <div role="group" aria-labelledby="rules-label" className="flex flex-col gap-2">
            <p id="rules-label" className="text-[12px] font-bold uppercase tracking-[0.1em] text-ink-muted">
              Religious or personal rules
            </p>
            <div className="flex flex-wrap gap-2">
              {foodRules().map((rule) => (
                <Chip key={rule.value} selected={answers.rules.includes(rule.value)} onClick={() => flip("rules", rule.value)}>
                  {rule.label}
                </Chip>
              ))}
            </div>
          </div>
          <div className="self-start">
            <Chip
              selected={answers.noFoodRules}
              onClick={() => update(answers.noFoodRules ? { noFoodRules: false } : { intolerances: [], rules: [], noFoodRules: true })}
            >
              None of these
            </Chip>
          </div>
        </>
      );
      footer = continueButton();
      break;
    }

    case "week":
      body = (
        <>
          <AiLabel>Your nutrition consultation</AiLabel>
          <Question>Your first 7 days</Question>
          <Sub>Three short sessions with your AI nutritionist, starting today.</Sub>
          <Timeline
            items={[
              {
                when: `Today, ${trialDay(1)}`,
                what: "Getting to know you",
                how: "A short chat about your routine and goals. About 5 minutes.",
                state: "now",
              },
              {
                when: "After about 3 days of meals",
                what: "What I've noticed so far",
                how: "The patterns in your real meals, and one focus you pick together.",
              },
              {
                when: `Around day 7, ${trialDay(7)}`,
                what: "Week-in-review",
                how: "How the week went for your Energy, Satiety and Mood, and what to try next.",
              },
            ]}
          />
        </>
      );
      footer = continueButton();
      break;

    case "echo-plans": {
      const leaveOut = leaveOutLine(answers);
      reply("echo-plans", PLANS_REPLY, leaveOut ? <InlineReply ai={false}>{leaveOut}</InlineReply> : undefined, "Build my starting plan");
      break;
    }

    case "loader":
      body = (
        <LoaderScreen
          onAnswer={(key, value) => update({ [key]: value })}
          onDone={() => next()}
        />
      );
      break;

    case "email":
      body = (
        <>
          <Eyebrow>Your plan is ready</Eyebrow>
          <Question>Where should we save your plan?</Question>
          <Sub>We&apos;ll save your answers to your account, so the app can skip its setup, and email you a copy of your plan.</Sub>
          <form
            id="email-form"
            noValidate
            onSubmit={(event) => {
              event.preventDefault();
              if (ok) void submitEmail();
            }}
            className="flex flex-col gap-4"
          >
            <div>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <input
                id="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="you@example.com"
                className={INPUT_CLASS}
                value={answers.email}
                aria-invalid={emailState === "invalid"}
                aria-describedby={emailState === "invalid" ? "email-error" : undefined}
                onChange={(event) => {
                  update({ email: event.target.value });
                  if (emailState === "invalid") setEmailState("idle");
                }}
              />
              {emailState === "invalid" && (
                <p id="email-error" role="alert" className="mt-1.5 text-small text-error">
                  Check your email address and try again.
                </p>
              )}
            </div>
            <label className="flex items-start gap-2.5 text-small text-ink-secondary">
              <input
                type="checkbox"
                className="mt-px size-5 flex-none accent-primary"
                checked={answers.marketingConsent}
                onChange={(event) => update({ marketingConsent: event.target.checked })}
              />
              {MARKETING_CONSENT_TEXT}
            </label>
          </form>
          <p className="text-[12.5px] leading-[1.45] text-ink-muted">
            We never sell your data. See our{" "}
            <Link className="text-ink-secondary underline" href="/privacy-policy">
              Privacy Policy
            </Link>
            .
          </p>
        </>
      );
      footer = (
        <button type="submit" form="email-form" className={QUIZ_BUTTON_CLASS} disabled={!ok || emailState === "saving"}>
          {emailState === "saving" ? "Saving…" : "Save my plan"}
        </button>
      );
      break;

    case "name":
      body = (
        <>
          <Question>What should your nutritionist call you?</Question>
          <form
            id="name-form"
            onSubmit={(event) => {
              event.preventDefault();
              submitName(false);
            }}
          >
            <FieldLabel htmlFor="first-name">First name</FieldLabel>
            <input
              id="first-name"
              autoComplete="given-name"
              maxLength={100}
              className={INPUT_CLASS}
              value={answers.firstName}
              onChange={(event) => update({ firstName: event.target.value })}
            />
          </form>
        </>
      );
      footer = (
        <>
          <button type="submit" form="name-form" className={QUIZ_BUTTON_CLASS}>
            Show my plan
          </button>
          <p className="mt-2.5 text-center">
            <button type="button" className="text-small text-ink-secondary underline underline-offset-4" onClick={() => submitName(true)}>
              Skip
            </button>
          </p>
        </>
      );
      break;

    case "result":
      body = <ResultScreen answers={answers} targets={targets} prices={prices} />;
      footer = (
        <>
          <QuizStartCta market={market} className={QUIZ_BUTTON_CLASS} trackingSource="quiz-result" onStart={startTrial} />
          {market === "web" && (
            <p className="mt-1.5 text-center text-[12.5px] text-ink-muted">{prices.free} today.{WEB_REMINDER_EMAIL_LIVE ? " Reminder email on day 4." : ""} Cancel any time.</p>
          )}
        </>
      );
      break;
  }

  // Screen widths: one column (wider on desktop), or text beside the visual on a wide screen.
  const width =
    layout === "split" ? "max-w-[520px] min-[900px]:max-w-[1180px]" : layout === "hero" ? "max-w-[520px] min-[900px]:max-w-[1180px]" : "max-w-[520px] min-[900px]:max-w-[620px]";
  const bodyLayout =
    layout === "split"
      ? "flex flex-col gap-[18px] min-[900px]:grid min-[900px]:grid-cols-[minmax(0,520px)_minmax(0,1fr)] min-[900px]:items-start min-[900px]:gap-x-[72px]"
      : layout === "hero"
        ? "flex flex-col gap-[18px] min-[900px]:py-6 min-[900px]:*:max-w-[520px]"
        : "flex flex-col gap-[18px]";

  return (
    // ph-no-capture: no autocapture or replay of the answers (health, diet, safety).
    <div className="quiz-v9 ph-no-capture relative flex min-h-dvh w-full flex-col overflow-x-clip bg-page text-ink">
      {layout === "hero" && (
        <div aria-hidden className="quiz-side-still pointer-events-none absolute top-0 left-[46%] right-0 hidden h-full max-h-[820px] min-[900px]:block">
          <Image src="/quiz/v9/side-fork.webp" alt="" fill priority sizes="54vw" className="object-cover object-[50%_45%]" />
        </div>
      )}
      <header className="sticky top-0 z-10 bg-page px-5 pb-2.5 pt-[18px] min-[900px]:px-12">
        <div className="mx-auto flex w-full max-w-[520px] flex-col gap-2.5 min-[900px]:max-w-[1180px] min-[900px]:flex-row min-[900px]:items-center min-[900px]:gap-8">
          <div className="flex min-h-8 items-center gap-3 min-[900px]:w-[200px] min-[900px]:flex-none">
            <button
              type="button"
              aria-label="Back"
              onClick={back}
              disabled={!history.length}
              className="-ml-1.5 grid size-11 place-items-center rounded-full text-ink focus-visible:outline-2 focus-visible:outline-focus disabled:invisible"
            >
              {BACK_ICON}
            </button>
            <Link href="/" aria-label="PrepIt home" className="text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus">
              <LongLogo className="h-[22px] w-auto" />
            </Link>
          </div>
          {showProgress && (
            <div
              className="flex gap-1.5 min-[900px]:mx-auto min-[900px]:max-w-[640px] min-[900px]:flex-1"
              aria-label={`${SECTIONS[section]}, section ${section + 1} of ${SECTIONS.length}`}
              role="img"
            >
              {SECTIONS.map((name, index) => (
                <div key={name} className="min-w-0 flex-1" aria-hidden>
                  <span
                    className={`mb-[6px] block truncate text-[10px] font-bold uppercase tracking-[0.1em] ${index === section ? "text-ink" : "text-ink-muted"}`}
                  >
                    {name}
                  </span>
                  <b className="block h-[3px] overflow-hidden rounded bg-surface-raised">
                    <i
                      className="block h-full bg-primary transition-[width] duration-500 motion-reduce:transition-none"
                      style={{ width: `${Math.round(bars[index] * 100)}%` }}
                    />
                  </b>
                </div>
              ))}
            </div>
          )}
          <span aria-hidden className="hidden min-[900px]:block min-[900px]:w-[200px] min-[900px]:flex-none" />
        </div>
      </header>
      <div className="relative flex-1 px-5 pb-5 pt-2 min-[900px]:px-12 min-[900px]:pt-10">
        {restored && (
          <div key={screen} className={`quiz-in mx-auto w-full ${width} ${bodyLayout}`}>
            {body}
          </div>
        )}
      </div>
      {restored && footer && (
        <div className="sticky bottom-0 z-10 bg-gradient-to-b from-page/0 to-page to-30% px-5 pb-[calc(18px+env(safe-area-inset-bottom,0px))] pt-3.5 min-[900px]:px-12 min-[900px]:pb-9">
          <div className={`mx-auto w-full ${width}`}>
            <div className={layout === "split" ? "min-[900px]:max-w-[520px]" : ""}>{footer}</div>
          </div>
        </div>
      )}
    </div>
  );
}
