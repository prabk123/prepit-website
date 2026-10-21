"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import DeviceFrame from "@/components/device/DeviceFrame";
import {
  Caption,
  Card,
  Chip,
  Eyebrow,
  FieldLabel,
  INPUT_CLASS,
  MEDIA,
  OptionButton,
  Options,
  QUIZ_BUTTON_CLASS,
  QUIZ_GHOST_BUTTON_CLASS,
  Question,
  REAL_SCREENS,
  ReplyCard,
  ReplyMedia,
  Shot,
  Sub,
  Timeline,
  UnitField,
} from "@/components/quiz/parts";
import LongLogo from "@/components/ui/LongLogo";
import QuizStartCta from "@/components/quiz/QuizStartCta";
import { appVideo } from "@/lib/captures";
import { readAttribution } from "@/lib/funnel/attributionStore";
import { writeBridgeHandoff } from "@/lib/funnel/bridgeHandoff";
import type { WebMarket } from "@/lib/markets";
import { trackQuizLead } from "@/lib/metaPixel";
import { fetchTargets, LeadApiError, saveLead } from "@/lib/quiz/leadApi";
import {
  ACTIVITY_OPTIONS,
  ageFrom,
  ALLERGENS,
  analyticsStepId,
  BLOCKER_OPTIONS,
  blockerReply,
  buildQuizProfile,
  canContinue,
  demoCopy,
  dietOptions,
  emptyAnswers,
  ENERGY_OPTIONS,
  EXERCISE_OPTIONS,
  foodRules,
  GENDER_OPTIONS,
  GOAL_OPTIONS,
  goalReply,
  goalWeightReply,
  heightCm,
  HISTORY_OPTIONS,
  HUNGER_OPTIONS,
  isStopScreen,
  leaveOutLine,
  MARKETING_CONSENT_TEXT,
  MEAL_HELP_OPTIONS,
  mediaPlan,
  MONTHS,
  MOOD_OPTIONS,
  nextScreen,
  type Option,
  planSummary,
  progress,
  QUIZ_FUNNEL_ID,
  QUIZ_FUNNEL_VERSION,
  type QuizAnswers,
  SAFETY_OPTIONS,
  safetyReply,
  type ScreenId,
  SECTIONS,
  sectionOf,
  signalsLine,
  STYLE_OPTIONS,
  type Targets,
  targetsRequest,
  toKg,
  trialDay,
  weightKg,
  weightText,
} from "@/lib/quiz/quiz";
import { getWebSessionId } from "@/lib/quiz/webSession";
import { trackWebFunnelEvent, WEB_FUNNEL_EVENTS } from "@/lib/webFunnelAnalytics";
import LoaderScreen from "./LoaderScreen";
import ResultScreen from "./ResultScreen";

/** Kept for this tab only, so a refresh or a Back from the bridge keeps the answers. */
const STORAGE_KEY = "prepit.quiz.v3";

type Saved = { answers: QuizAnswers; screen: ScreenId; history: ScreenId[] };

function readSaved(): Saved | null {
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<Saved>;
    if (!parsed.answers || !parsed.screen || !Array.isArray(parsed.history)) return null;
    // Never come back to a stop screen or the loader halfway.
    if (isStopScreen(parsed.screen)) return null;
    const screen = parsed.screen === "loader" ? "week" : parsed.screen;
    return { answers: { ...emptyAnswers(), ...parsed.answers }, screen, history: parsed.history.filter((id) => id !== "loader") };
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

/**
 * The web quiz (PRE-322) with its stop screens (PRE-329) and email gate
 * (PRE-327): one screen at a time, then the plan page, which hands the
 * answers to the bridge (/start, PRE-323) in this browser's storage.
 */
export default function Quiz({ country, market }: { country: string; market: WebMarket }) {
  const [answers, setAnswers] = useState<QuizAnswers>(emptyAnswers);
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
    const saved = readSaved();
    if (saved) {
      setAnswers(saved.answers);
      setScreen(saved.screen);
      setHistory(saved.history);
    }
    setRestored(true);
  }, []);

  useEffect(() => {
    if (restored) writeSaved({ answers, screen, history });
  }, [answers, screen, history, restored]);

  // Each screen: one step event (its id only), back to the top, focus on the question.
  // A stop screen sends no index either: where it falls would tell the two apart.
  useEffect(() => {
    if (!restored) return;
    trackWebFunnelEvent(WEB_FUNNEL_EVENTS.quizStepView, {
      funnel_id: QUIZ_FUNNEL_ID,
      step_id: analyticsStepId(screen),
      step_index: isStopScreen(screen) ? null : history.length,
    });
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
    setAnswers(emptyAnswers());
    setHistory([]);
    setFetched(null);
    leadSaved.current = false;
    setScreen("goal");
  };

  /** A single choice: mark it, then move on, as the app does. */
  const choose = (key: keyof QuizAnswers, value: string) => {
    const latest = { ...answers, [key]: value } as QuizAnswers;
    setAnswers(latest);
    if (advanceTimer.current) window.clearTimeout(advanceTimer.current);
    advanceTimer.current = window.setTimeout(() => next(latest), 180);
  };

  const toggle = (key: "blockers" | "safety", option: Option, options: Option[]) => {
    const current = answers[key];
    let values: string[];
    if (option.exclusive) values = current.includes(option.value) ? [] : [option.value];
    else {
      const exclusive = options.filter((o) => o.exclusive).map((o) => o.value);
      const kept = current.filter((v) => !exclusive.includes(v));
      values = kept.includes(option.value) ? kept.filter((v) => v !== option.value) : [...kept, option.value];
    }
    update({ [key]: values });
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
    trackWebFunnelEvent(WEB_FUNNEL_EVENTS.quizStartTrial, { funnel_id: QUIZ_FUNNEL_ID, market, targets_available: Boolean(targets) });
  };

  const ok = canContinue(screen, answers);
  const showProgress = screen !== "result" && !isStopScreen(screen);
  const bars = progress(screen, answers);
  const section = sectionOf(screen);

  let body: ReactNode = null;
  let footer: ReactNode = null;
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

  const plan = mediaPlan(answers);

  switch (screen) {
    case "goal":
      single("goal", "What do you want help with first?", GOAL_OPTIONS, "Answer a few quick questions and see what your first week with your AI nutritionist would focus on.");
      body = (
        <>
          <div className="-mb-1 aspect-[7/2] overflow-hidden rounded-[20px]">
            <Image
              src="/quiz/welcome-bowl.webp"
              alt="A bowl of Greek yogurt with berries, granola and pistachios"
              width={800}
              height={800}
              sizes="(min-width: 520px) 480px, 100vw"
              priority
              className="size-full object-cover object-[50%_46%]"
            />
          </div>
          <Eyebrow>Your AI nutritionist</Eyebrow>
          {body}
          <p className="text-[12.5px] leading-[1.45] text-ink-muted">
            By continuing you agree to our{" "}
            <Link className="text-ink-secondary underline" href="/terms-and-conditions">
              Terms
            </Link>{" "}
            and{" "}
            <Link className="text-ink-secondary underline" href="/privacy-policy">
              Privacy Policy
            </Link>
            . We never sell your data. Photos are illustrative.
          </p>
        </>
      );
      break;

    case "echo-goal": {
      const reply = goalReply(answers);
      body = (
        <>
          <Eyebrow>Your AI nutritionist</Eyebrow>
          <Question>{reply.headline}</Question>
          <Sub>{reply.body}</Sub>
          <ReplyMedia media={plan.goal} />
        </>
      );
      footer = continueButton();
      break;
    }

    case "blockers":
      body = (
        <>
          <Question>What usually gets in the way?</Question>
          <Sub>Pick all that apply.</Sub>
          <Options label="What usually gets in the way?">
            {BLOCKER_OPTIONS.map((option) => (
              <OptionButton
                key={option.value}
                option={option}
                multi
                selected={answers.blockers.includes(option.value)}
                onClick={() => toggle("blockers", option, BLOCKER_OPTIONS)}
              />
            ))}
          </Options>
        </>
      );
      footer = continueButton();
      break;

    case "echo-blocker": {
      const reply = blockerReply(answers);
      body = (
        <>
          <Question>{reply.headline}</Question>
          <Sub>{reply.body}</Sub>
          <ReplyMedia media={plan.blocker} />
        </>
      );
      footer = continueButton();
      break;
    }

    case "energy":
      single("energy", "How's your energy most afternoons?", ENERGY_OPTIONS);
      break;
    case "hunger":
      single("hunger", "How often are you hungry between meals?", HUNGER_OPTIONS);
      break;
    case "mood":
      single("mood", "Do you notice food changing how you feel?", MOOD_OPTIONS);
      break;

    case "echo-signals":
      body = (
        <>
          <Eyebrow>Your daily scores</Eyebrow>
          <Question>Three scores, every day: Energy, Satiety and Mood.</Question>
          <Sub>Each runs from 0 to 100 and moves with what you eat. No wearable needed.</Sub>
          <ReplyCard>
            <p>{signalsLine(answers)}</p>
          </ReplyCard>
          <ReplyMedia media={plan.signals} />
        </>
      );
      footer = continueButton();
      break;

    case "history":
      single("history", "Have you tried keeping track of what you eat before?", HISTORY_OPTIONS);
      break;

    case "demo": {
      const copy = demoCopy(answers);
      body = (
        <>
          <Question>{copy.headline}</Question>
          <Sub>{copy.body}</Sub>
          <div className="flex flex-col items-center gap-2">
            <DeviceFrame width={260} video={appVideo("03-log-typed", "Recording of typing lunch into PrepIt")} />
            <Caption>Real recording: typing lunch into PrepIt</Caption>
          </div>
        </>
      );
      footer = continueButton();
      break;
    }

    case "gender":
      single("gender", "Your gender", GENDER_OPTIONS, "This helps set your daily targets.");
      break;

    case "dob": {
      const age = ageFrom(answers);
      body = (
        <>
          <Question>When were you born?</Question>
          <Sub>Used for your daily targets.</Sub>
          <div className="flex gap-2">
            <div className="min-w-0 flex-[1.3]">
              <FieldLabel htmlFor="dob-month">Month</FieldLabel>
              <select
                id="dob-month"
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
            </div>
            <div className="min-w-0 flex-1">
              <FieldLabel htmlFor="dob-day">Day</FieldLabel>
              <input
                id="dob-day"
                className={INPUT_CLASS}
                inputMode="numeric"
                autoComplete="bday-day"
                maxLength={2}
                placeholder="DD"
                value={answers.dobDay}
                onChange={(event) => update({ dobDay: event.target.value.replace(/\D/g, "") })}
              />
            </div>
            <div className="min-w-0 flex-[1.4]">
              <FieldLabel htmlFor="dob-year">Year</FieldLabel>
              <input
                id="dob-year"
                className={INPUT_CLASS}
                inputMode="numeric"
                autoComplete="bday-year"
                maxLength={4}
                placeholder="YYYY"
                value={answers.dobYear}
                onChange={(event) => update({ dobYear: event.target.value.replace(/\D/g, "") })}
              />
            </div>
          </div>
          {age !== null && age >= 18 && age < 110 && (
            <ReplyCard>
              <p>Thanks. Targets for age {age} coming up.</p>
            </ReplyCard>
          )}
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

    case "hw": {
      const unitButton = (unit: QuizAnswers["unit"], label: string) => (
        <button
          type="button"
          aria-pressed={answers.unit === unit}
          onClick={() => update({ unit, goalWeightText: "", goalWeightKg: undefined })}
          className={`rounded-control px-3.5 py-[7px] text-small font-medium focus-visible:outline-2 focus-visible:outline-focus ${
            answers.unit === unit ? "bg-surface text-ink shadow-[0_1px_3px_rgb(0_0_0/0.12)]" : "text-ink-secondary"
          }`}
        >
          {label}
        </button>
      );
      const feetAndInches = (
        <div>
          <FieldLabel>Height</FieldLabel>
          <div className="flex gap-2">
            <UnitField id="feet" label="Feet" unit="ft" value={answers.feet} onChange={(feet) => update({ feet })} />
            <UnitField id="inches" label="Inches" unit="in" value={answers.inches} onChange={(inches) => update({ inches })} />
          </div>
        </div>
      );
      body = (
        <>
          <Question>Your height and weight</Question>
          <Sub>Used for your daily targets. Only you and your nutritionist see these.</Sub>
          <div role="group" aria-label="Units" className="inline-flex self-start rounded-control bg-[#e9e9ea] p-[3px]">
            {unitButton("imperial", "ft, lb")}
            {unitButton("metric", "cm, kg")}
            {unitButton("stones", "ft, st")}
          </div>
          {answers.unit === "metric" ? (
            <>
              <div>
                <FieldLabel htmlFor="height-cm">Height</FieldLabel>
                <UnitField id="height-cm" label="Height in centimetres" unit="cm" value={answers.heightCm} onChange={(heightCm) => update({ heightCm })} />
              </div>
              <div>
                <FieldLabel htmlFor="weight-kg">Weight</FieldLabel>
                <UnitField id="weight-kg" label="Weight in kilograms" unit="kg" decimal value={answers.weightKg} onChange={(weightKg) => update({ weightKg })} />
              </div>
            </>
          ) : answers.unit === "stones" ? (
            <>
              {feetAndInches}
              <div>
                <FieldLabel>Weight</FieldLabel>
                <div className="flex gap-2">
                  <UnitField id="stones" label="Stones" unit="st" value={answers.stones} onChange={(stones) => update({ stones })} />
                  <UnitField id="stone-pounds" label="Pounds" unit="lb" value={answers.stonePounds} onChange={(stonePounds) => update({ stonePounds })} />
                </div>
              </div>
            </>
          ) : (
            <>
              {feetAndInches}
              <div>
                <FieldLabel htmlFor="pounds">Weight</FieldLabel>
                <UnitField id="pounds" label="Weight in pounds" unit="lb" decimal value={answers.pounds} onChange={(pounds) => update({ pounds })} />
              </div>
            </>
          )}
        </>
      );
      footer = continueButton();
      break;
    }

    case "safety": {
      const reply = safetyReply(answers);
      body = (
        <>
          <Question>Does any of this apply to you right now?</Question>
          <Sub>So your plan is safe for you.</Sub>
          <Options label="Does any of this apply to you right now?">
            {SAFETY_OPTIONS.map((option) => (
              <OptionButton
                key={option.value}
                option={option}
                multi
                selected={answers.safety.includes(option.value)}
                onClick={() => toggle("safety", option, SAFETY_OPTIONS)}
              />
            ))}
          </Options>
          {reply && (
            <ReplyCard>
              <p>{reply}</p>
            </ReplyCard>
          )}
        </>
      );
      footer = continueButton();
      break;
    }

    case "stop-ed":
      body = (
        <>
          <Question>Thanks for telling us.</Question>
          <Sub>PrepIt sets food targets, and that isn&apos;t the right kind of help while you&apos;re dealing with an eating disorder.</Sub>
          <Card>
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
            <UnitField
              id="goal-weight"
              label={`Goal weight in ${isLb ? "pounds" : "kilograms"}`}
              unit={isLb ? "lb" : "kg"}
              decimal
              value={answers.goalWeightText}
              onChange={(value) => update({ goalWeightText: value, goalWeightKg: toKg(value, answers.unit) })}
            />
          </div>
          {heightCm(answers) !== null && (
            <ReplyCard>
              <p>{goalWeightReply(answers)}</p>
            </ReplyCard>
          )}
        </>
      );
      footer = continueButton();
      break;
    }

    case "activity":
      single("activity", "How active is your typical day?", ACTIVITY_OPTIONS, "Your job and everyday movement, not exercise.");
      break;
    case "exercise":
      single("exercise", "How often do you exercise?", EXERCISE_OPTIONS, "Gym sessions, runs, classes.");
      break;

    case "diet":
      body = (
        <>
          <Question>Which of these fits how you eat?</Question>
          <Sub>Plans leave out what you don&apos;t eat.</Sub>
          <Options label="Which of these fits how you eat?">
            {dietOptions().map((option) => (
              <OptionButton key={option.value} option={option} selected={answers.diet === option.value} onClick={() => update({ diet: option.value })} />
            ))}
          </Options>
          <details className="group rounded-button border border-line bg-surface px-3.5 py-0.5">
            <summary className="flex cursor-pointer list-none justify-between gap-3 py-[11px] text-[14.5px] font-semibold text-ink [&::-webkit-details-marker]:hidden">
              Where are high protein, low carb and keto?
              <span aria-hidden className="font-medium text-ink-muted group-open:hidden">+</span>
              <span aria-hidden className="hidden font-medium text-ink-muted group-open:inline">−</span>
            </summary>
            <div className="flex flex-col gap-2 pb-3 text-small text-ink-secondary">
              <p>
                They&apos;re goals, not rules about which foods you eat. Everyone gets a protein target from their weight and goal, and you can ask
                for higher-protein meals in any plan.
              </p>
              <p>PrepIt doesn&apos;t set low-carb or keto targets yet, so every plan includes some carbs.</p>
            </div>
          </details>
        </>
      );
      footer = continueButton();
      break;

    case "intol": {
      const none = !answers.intolerances.length && !answers.rules.length;
      const flip = (key: "intolerances" | "rules", value: string) => {
        const list = answers[key];
        update({ [key]: list.includes(value) ? list.filter((v) => v !== value) : [...list, value] });
      };
      body = (
        <>
          <Question>Any allergies, intolerances or food rules?</Question>
          <Sub>Select all that apply.</Sub>
          <div className="self-start">
            <Chip selected={none} onClick={() => update({ intolerances: [], rules: [] })}>
              None of these
            </Chip>
          </div>
          <div role="group" aria-labelledby="allergies-label" className="flex flex-col gap-1.5">
            <p id="allergies-label" className="text-[13px] text-ink-muted">
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
          <div role="group" aria-labelledby="rules-label" className="flex flex-col gap-1.5">
            <p id="rules-label" className="text-[13px] text-ink-muted">
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
        </>
      );
      footer = continueButton();
      break;
    }

    case "mealhelp":
      single("mealHelp", "Where would help with meals make the biggest difference?", MEAL_HELP_OPTIONS);
      break;

    case "echo-plans": {
      const leaveOut = leaveOutLine(answers);
      const first = MEDIA[plan.plans];
      body = (
        <>
          <Question>Your nutritionist plans your week. You just confirm.</Question>
          <Sub>A chat about your week, a day-by-day draft, then the grocery list with a cost estimate.</Sub>
          {leaveOut && (
            <ReplyCard>
              <p>{leaveOut}</p>
            </ReplyCard>
          )}
          <div className="grid grid-cols-2 items-start gap-2">
            <Shot src={first.src} alt={first.alt} width={first.width} height={first.height} />
            <Shot src="/quiz/grocery.webp" alt="The grocery list, by aisle" width={640} height={544} />
          </div>
          <Caption className="-mt-2">
            {plan.plans === "planHead" ? "Your week planned, and the grocery list by aisle." : "A meal changed by asking, and the grocery list by aisle."}{" "}
            {REAL_SCREENS}
          </Caption>
        </>
      );
      footer = continueButton();
      break;
    }

    case "style":
      single("style", "How do you like advice?", STYLE_OPTIONS);
      break;

    case "week":
      body = (
        <>
          <Eyebrow>Your nutrition consultation</Eyebrow>
          <Question>Your first 7 days</Question>
          <Sub>Three short sessions with your AI nutritionist, and your week planned whenever you want it.</Sub>
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
      footer = continueButton("Build my plan");
      break;

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
      body = <ResultScreen answers={answers} targets={targets} />;
      footer = (
        <>
          <QuizStartCta market={market} className={QUIZ_BUTTON_CLASS} trackingSource="quiz-result" onStart={startTrial} />
          {market === "web" && (
            <p className="mt-1.5 text-center text-[12.5px] text-ink-muted">$0 today. Reminder email on day 4. Cancel any time.</p>
          )}
        </>
      );
      break;
  }

  return (
    // ph-no-capture: no autocapture or replay of the answers (health, diet, safety).
    <div className="ph-no-capture mx-auto flex min-h-dvh w-full max-w-[520px] flex-col bg-page text-ink">
      <header className="sticky top-0 z-10 bg-page px-5 pb-2.5 pt-[18px]">
        <div className="flex min-h-8 items-center gap-3">
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
          <div className="mt-2.5 flex gap-1.5" aria-label={`${SECTIONS[section]}, section ${section + 1} of ${SECTIONS.length}`} role="img">
            {SECTIONS.map((name, index) => (
              <div key={name} className="min-w-0 flex-1" aria-hidden>
                <span
                  className={`mb-[5px] block truncate text-[11px] uppercase tracking-[0.06em] ${index === section ? "text-ink" : "text-ink-faint"}`}
                >
                  {name}
                </span>
                <b className="block h-1 overflow-hidden rounded bg-line">
                  <i
                    className="block h-full bg-primary transition-[width] duration-300 motion-reduce:transition-none"
                    style={{ width: `${Math.round(bars[index] * 100)}%` }}
                  />
                </b>
              </div>
            ))}
          </div>
        )}
      </header>
      <div className="flex flex-1 flex-col gap-[18px] px-5 pb-5 pt-2">{restored ? body : null}</div>
      {restored && footer && (
        <div className="sticky bottom-0 z-10 bg-gradient-to-b from-page/0 to-page to-30% px-5 pb-[calc(18px+env(safe-area-inset-bottom,0px))] pt-3.5">
          {footer}
        </div>
      )}
    </div>
  );
}
