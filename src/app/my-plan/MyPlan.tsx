"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import QuizStartCta from "@/components/quiz/QuizStartCta";
import { Card, CardTitle, Eyebrow, TargetTiles } from "@/components/quiz/parts";
import { useEmailToken } from "@/components/quiz/useEmailToken";
import { PRIMARY_BUTTON_CLASS, TEXT_BUTTON_CLASS } from "@/components/ui/buttons";
import type { WebMarket } from "@/lib/markets";
import { PRICES } from "@/lib/pricing";
import { fetchLeadPlan, LeadApiError, type LeadPlan } from "@/lib/quiz/leadApi";
import { dietLabelFor, goalLabelFor, QUIZ_FUNNEL_ID, savedPlanHeadline, weightText } from "@/lib/quiz/quiz";
import { trackWebFunnelEvent, WEB_FUNNEL_EVENTS } from "@/lib/webFunnelAnalytics";

type State = { status: "loading" } | { status: "ready"; plan: LeadPlan } | { status: "missing" } | { status: "error" };

/**
 * The plan saved at the quiz's email gate, from the token in the email's
 * link (`POST /web-leads/plan`). Nothing here is editable; "Start my free 7
 * days" goes to the bridge, where they sign in and the app finishes setup.
 */
export default function MyPlan({ market }: { market: WebMarket }) {
  const token = useEmailToken();
  const [fetched, setFetched] = useState<State>({ status: "loading" });
  const state: State = token === null ? { status: "missing" } : fetched;
  const tracked = useRef(false);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    fetchLeadPlan(token)
      .then((plan) => !cancelled && setFetched({ status: "ready", plan }))
      .catch((error) => !cancelled && setFetched({ status: error instanceof LeadApiError && error.status === 404 ? "missing" : "error" }));
    return () => {
      cancelled = true;
    };
  }, [token]);

  useEffect(() => {
    if (tracked.current || state.status === "loading") return;
    tracked.current = true;
    trackWebFunnelEvent(WEB_FUNNEL_EVENTS.leadPlanView, { funnel_id: QUIZ_FUNNEL_ID, found: state.status === "ready" });
  }, [state.status]);

  if (state.status === "loading") {
    return <p className="text-body text-ink-secondary" role="status">Loading your plan…</p>;
  }

  if (state.status !== "ready") {
    return (
      <div className="flex w-full max-w-md flex-col items-center gap-6 rounded-card border border-line bg-surface px-6 py-10 text-center sm:px-10">
        <h1 className="font-display text-title text-ink text-balance">
          {state.status === "missing" ? "This link has expired" : "We couldn't load your plan"}
        </h1>
        <p className="text-body text-ink-secondary">
          {state.status === "missing"
            ? "Plans from the quiz are kept for 30 days. Take the quiz again to get a new one."
            : "Something went wrong on our side. Try again in a minute."}
        </p>
        <Link href="/quiz" className={PRIMARY_BUTTON_CLASS}>
          Take the quiz
        </Link>
      </div>
    );
  }

  const { plan } = state;
  const goals = plan.plan?.nutritionalGoals;
  const targets =
    goals && [goals.calories, goals.protein, goals.carbs, goals.fats].every((v) => typeof v === "number")
      ? { calories: Math.round(goals.calories!), protein: Math.round(goals.protein!), carbs: Math.round(goals.carbs!), fats: Math.round(goals.fats!) }
      : null;
  const settings = plan.settings ?? {};
  const unit = settings.unit === "metric" ? "metric" : "imperial";
  const goalLabel = goalLabelFor(settings.goal);
  const details: [string, string][] = [];
  if (goalLabel) details.push(["Goal", goalLabel]);
  if (typeof settings.goalWeight === "number") details.push(["Goal weight", weightText(settings.goalWeight, unit)]);
  const diet = dietLabelFor(settings.diet);
  if (diet) details.push(["Eating pattern", diet]);
  if (settings.intolerances?.length) details.push(["Leaving out", settings.intolerances.join(", ")]);

  return (
    <div className="flex w-full max-w-[520px] flex-col gap-[18px]">
      <Eyebrow>Your plan</Eyebrow>
      <h1 className="font-display text-[32px] font-medium leading-[1.15] text-ink text-balance">
        {savedPlanHeadline(settings.goal, plan.firstName)}
      </h1>
      <p className="-mt-2 text-[16px] text-ink-secondary">Saved from your quiz answers. Your nutritionist starts from here in the app.</p>

      <Card>
        <CardTitle>Your daily targets</CardTitle>
        <p className="text-[15px] text-ink-secondary">Set from your answers. You can change them any time.</p>
        {targets ? (
          <TargetTiles targets={targets} proteinFirst={settings.goal === "gain muscle" || settings.goal === "fuel training"} />
        ) : (
          <p className="mt-2.5 rounded-[14px] bg-page px-3 py-2.5 text-small text-ink-secondary">
            Your nutritionist sets these with you in the app.
          </p>
        )}
      </Card>

      {details.length > 0 && (
        <Card>
          <CardTitle>What your plan knows</CardTitle>
          <dl className="mt-2 grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-1.5 text-[15px]">
            {details.map(([label, value]) => (
              <div key={label} className="contents">
                <dt className="text-ink-muted">{label}</dt>
                <dd className="m-0 text-ink">{value}</dd>
              </div>
            ))}
          </dl>
        </Card>
      )}

      {market === "web" && (
        <Card>
          <CardTitle>Your first 7 days are free</CardTitle>
          <p className="text-[15px] text-ink-secondary">
            Full access and your first session today, a reminder email on day 4, and your plan starts on day 8 if you keep it: {PRICES.annual} a
            year or {PRICES.monthly} a month. Cancel before then and you pay nothing.
          </p>
        </Card>
      )}

      <QuizStartCta market={market} className={PRIMARY_BUTTON_CLASS} trackingSource="my-plan" />
      <p className="-mt-2 text-center text-[12.5px] text-ink-muted">
        PrepIt is an iPhone app; Android is coming soon. PrepIt is a coach, not a doctor.
      </p>
      <p className="text-center">
        <Link href="/email-preferences" className={TEXT_BUTTON_CLASS}>
          Email preferences
        </Link>
      </p>
    </div>
  );
}
