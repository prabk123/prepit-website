"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useWebSession } from "@/components/account/useWebSession";
import AppStoreButton from "@/components/ui/AppStoreButton";
import SectionHeading from "@/components/ui/SectionHeading";
import { PRIMARY_BUTTON_CLASS, TEXT_BUTTON_CLASS } from "@/components/ui/buttons";
import { providerOf, signOutOfWebsite } from "@/lib/firebase/auth";
import { parseFunnelId } from "@/lib/funnel/params";
import { parsePlanId, type PlanId } from "@/lib/pricing";
import {
  hasPremium,
  loadCheckoutPlans,
  purchasesFor,
  toCheckoutFailure,
  waitForPremium,
  webBillingKeyProblem,
  type CheckoutFailure,
  type CheckoutPlan,
} from "@/lib/revenuecat/webBilling";
import { resetWebUser, trackWebFunnelEvent, WEB_FUNNEL_EVENTS } from "@/lib/webFunnelAnalytics";

const PROVIDER_NAMES = { google: "Google", apple: "Apple" } as const;

const FAILURE_MESSAGES: Record<CheckoutFailure, string | null> = {
  cancelled: null,
  already_purchased: "You already have this subscription.",
  payment_pending: "Your payment is still being confirmed. We'll unlock PrepIt as soon as it goes through.",
  network: "We couldn't reach the payment service. Check your connection and try again.",
  not_allowed: "This payment couldn't go through. Please try a different card or try again.",
  unknown:
    "Something went wrong with the payment. If you were charged, your subscription will show up shortly. Otherwise, please try again.",
};

type Plans =
  | { status: "loading" }
  | { status: "ready"; plans: CheckoutPlan[] }
  | { status: "already_subscribed" }
  /** The email belongs to a PrepIt account under the other provider: the bridge explains. */
  | { status: "email_in_use" }
  | { status: "no_trial_free_plans" }
  | { status: "error" };

function trialEndDate(days: number): string {
  const end = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  return end.toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" });
}

export default function Checkout() {
  const params = useSearchParams();
  const router = useRouter();
  const funnelId = parseFunnelId(params.get("funnel"));
  const requestedPlan = parsePlanId(params.get("plan"));
  const { session, reloadAccount } = useWebSession();
  const keyProblem = webBillingKeyProblem();

  const [plansState, setPlans] = useState<{ key: string; plans: Plans } | null>(null);
  const [selected, setSelected] = useState<PlanId>(requestedPlan ?? "annual");
  const [paying, setPaying] = useState<"idle" | "paying" | "confirming">("idle");
  const [failure, setFailure] = useState<CheckoutFailure | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const paywallTracked = useRef(false);

  const uid = session.status === "signedIn" ? session.user.uid : null;
  const account = session.status === "signedIn" ? session.account : null;
  const summary = account?.status === "ready" ? account.summary : null;
  const plansKey = uid && summary ? `${uid}:${summary.hasUsedTrial}:${summary.isSubscribed}:${reloadKey}` : null;
  const plans: Plans = useMemo(
    () => (plansState && plansState.key === plansKey ? plansState.plans : { status: "loading" }),
    [plansState, plansKey],
  );

  // Signed out: sign in first, then come back here with the same plan.
  useEffect(() => {
    if (session.status !== "signedOut") return;
    const back = `/checkout?${params.toString()}`;
    const query = new URLSearchParams({ ...(requestedPlan ? { plan: requestedPlan } : {}), funnel: funnelId, next: back });
    router.replace(`/signin?${query}`);
  }, [session.status, params, requestedPlan, funnelId, router]);

  useEffect(() => {
    if (!uid || !summary || !plansKey || keyProblem) return;
    let cancelled = false;
    const done = (next: Plans) => {
      if (!cancelled) setPlans({ key: plansKey, plans: next });
    };
    if (summary.emailInUse) {
      done({ status: "email_in_use" });
      return;
    }
    if (summary.isSubscribed) {
      done({ status: "already_subscribed" });
      return;
    }
    (async () => {
      try {
        // Premium from any store (an App Store subscription, or a web
        // purchase made before the account existed) means no checkout.
        const purchases = await purchasesFor(uid);
        if (hasPremium(await purchases.getCustomerInfo())) return done({ status: "already_subscribed" });
        const result = await loadCheckoutPlans(uid, summary.hasUsedTrial);
        done(result.status === "ready" ? { status: "ready", plans: result.plans } : result);
      } catch {
        done({ status: "error" });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [uid, summary, plansKey, keyProblem]);

  const context = useMemo(() => ({ funnel_id: funnelId }), [funnelId]);

  useEffect(() => {
    if (paywallTracked.current) return;
    const unavailable =
      keyProblem ??
      (plans.status === "already_subscribed" || plans.status === "no_trial_free_plans" || plans.status === "email_in_use"
        ? plans.status
        : null);
    if (unavailable) {
      paywallTracked.current = true;
      trackWebFunnelEvent(WEB_FUNNEL_EVENTS.checkoutUnavailable, { ...context, reason: unavailable });
    } else if (plans.status === "ready") {
      paywallTracked.current = true;
      trackWebFunnelEvent(WEB_FUNNEL_EVENTS.paywallView, {
        ...context,
        plan: selected,
        has_trial: plans.plans.some((plan) => plan.trialDays !== null),
      });
    }
  }, [plans, keyProblem, context, selected]);

  const provider = session.status === "signedIn" ? providerOf(session.user) : null;
  const welcomePath = (pending: boolean) =>
    `/welcome?${new URLSearchParams({ ...(provider ? { provider } : {}), ...(pending ? { pending: "1" } : {}) })}`;

  useEffect(() => {
    if (plans.status === "already_subscribed") router.replace(welcomePath(false));
    if (plans.status === "email_in_use") {
      router.replace(`/signin?${new URLSearchParams({ ...(requestedPlan ? { plan: requestedPlan } : {}), funnel: funnelId })}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plans.status]);

  if (keyProblem) {
    return (
      <SectionHeading
        as="h1"
        size="title"
        align="center"
        title="Checkout isn't available right now"
        lead="Please try again later, or get PrepIt from the App Store."
      />
    );
  }

  if (session.status !== "signedIn" || account?.status === "loading" || plans.status === "loading" || plans.status === "already_subscribed" || plans.status === "email_in_use") {
    return <p className="text-body text-ink-secondary">Loading your plans…</p>;
  }

  if (account?.status === "error" || plans.status === "error") {
    return (
      <>
        <SectionHeading as="h1" size="title" align="center" title="We couldn't load the plans" lead="Please try again in a moment." />
        <button
          type="button"
          className={PRIMARY_BUTTON_CLASS}
          onClick={() => {
            reloadAccount();
            setReloadKey((key) => key + 1);
          }}
        >
          Try again
        </button>
      </>
    );
  }

  if (plans.status === "no_trial_free_plans") {
    return (
      <>
        <SectionHeading
          as="h1"
          size="title"
          align="center"
          title="You've had your free trial"
          lead="Subscribing again on the website isn't available yet. You can subscribe in the PrepIt app."
        />
        <div className="flex justify-center">
          <AppStoreButton trackingSource="checkout-trial-used" />
        </div>
      </>
    );
  }

  const plan = plans.plans.find((candidate) => candidate.id === selected) ?? plans.plans[0];
  const signedInUser = session.user;

  async function pay() {
    setFailure(null);
    setPaying("paying");
    trackWebFunnelEvent(WEB_FUNNEL_EVENTS.checkoutStart, { ...context, plan: plan.id, has_trial: plan.trialDays !== null });
    try {
      const purchases = await purchasesFor(signedInUser.uid);
      const result = await purchases.purchase({
        rcPackage: plan.rcPackage,
        purchaseOption: plan.option,
        customerEmail: signedInUser.email ?? undefined,
        metadata: { funnel_id: funnelId },
        skipSuccessPage: true,
      });
      setPaying("confirming");
      const unlocked = await waitForPremium(signedInUser.uid, result.customerInfo);
      trackWebFunnelEvent(WEB_FUNNEL_EVENTS.checkoutSuccess, {
        ...context,
        plan: plan.id,
        has_trial: plan.trialDays !== null,
        entitlement_confirmed: unlocked,
      });
      router.push(welcomePath(!unlocked));
    } catch (error) {
      const { code, rcErrorCode } = await toCheckoutFailure(error);
      trackWebFunnelEvent(WEB_FUNNEL_EVENTS.checkoutFailed, {
        ...context,
        plan: plan.id,
        reason: code,
        rc_error_code: rcErrorCode,
      });
      if (code === "already_purchased") {
        router.push(welcomePath(false));
        return;
      }
      setFailure(code);
      setPaying("idle");
    }
  }

  const trial = plan.trialDays;

  // Which account is paying, so an old session on the wrong account is visible.
  const signedInAs = (
    <p className="ph-no-capture text-small text-ink-muted">
      Paying for the PrepIt account signed in{provider ? ` with ${PROVIDER_NAMES[provider]}` : ""}
      {signedInUser.email ? ` as ${signedInUser.email}` : ""}.{" "}
      <button
        type="button"
        className={TEXT_BUTTON_CLASS}
        onClick={() => {
          void signOutOfWebsite().then(resetWebUser);
        }}
      >
        Not you? Sign out
      </button>
    </p>
  );
  const priceLine = `${plan.price} a ${plan.period}`;
  const message = failure ? FAILURE_MESSAGES[failure] : null;

  return (
    <>
      <SectionHeading
        as="h1"
        size="title"
        align="center"
        title={trial ? `Start your ${trial}-day free trial` : "Choose your plan"}
        lead={trial ? "You won't be charged today. Cancel any time before the trial ends." : undefined}
      />
      <fieldset className="flex w-full flex-col gap-3 text-left">
        <legend className="sr-only">Plan</legend>
        {plans.plans.map((option) => {
          const checked = option.id === plan.id;
          return (
            <label
              key={option.id}
              className={`flex cursor-pointer items-center gap-4 rounded-tile border bg-surface p-5 transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-4 has-[:focus-visible]:outline-focus ${
                checked ? "border-2 border-primary" : "border-line-strong hover:bg-surface-raised"
              }`}
            >
              <input
                type="radio"
                name="plan"
                value={option.id}
                checked={checked}
                onChange={() => setSelected(option.id)}
                className="sr-only"
              />
              <span
                aria-hidden
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${checked ? "border-primary" : "border-line-strong"}`}
              >
                {checked && <span className="h-2.5 w-2.5 rounded-full bg-primary" />}
              </span>
              <span className="flex flex-1 flex-col gap-1">
                <span className="text-body font-bold text-ink">{option.id === "annual" ? "Annual" : "Monthly"}</span>
                <span className="text-small text-ink-muted">
                  {option.price} a {option.period}
                  {option.pricePerWeek ? `, ${option.pricePerWeek} a week` : ""}
                </span>
              </span>
              {option.id === "annual" && (
                <span className="rounded-control bg-surface-raised px-3 py-1 text-small font-medium text-accent-text">
                  Best value
                </span>
              )}
            </label>
          );
        })}
      </fieldset>
      <div className="flex w-full flex-col gap-3">
        <button type="button" className={PRIMARY_BUTTON_CLASS} disabled={paying !== "idle"} onClick={() => void pay()}>
          {paying === "confirming"
            ? "Confirming your subscription…"
            : paying === "paying"
              ? "Opening checkout…"
              : trial
                ? "Start free trial"
                : "Subscribe"}
        </button>
        <p role="status" aria-live="polite" className={message ? "text-small text-error" : "sr-only"}>
          {message ?? ""}
        </p>
      </div>
      {signedInAs}
      <p className="text-small text-ink-muted">
        {trial
          ? `Free for ${trial} days, then ${priceLine} from ${trialEndDate(trial)}. `
          : `${priceLine}, charged today. `}
        Renews automatically until you cancel. Cancel any time at tryprepit.app/account
        {trial ? " before the trial ends and you won't be charged" : ""}. See our{" "}
        <Link href="/terms-and-conditions" className="underline underline-offset-4 hover:text-ink">
          Terms
        </Link>
        ,{" "}
        <Link href="/subscription-policy" className="underline underline-offset-4 hover:text-ink">
          Subscription policy
        </Link>{" "}
        and{" "}
        <Link href="/refund-policy" className="underline underline-offset-4 hover:text-ink">
          Refund policy
        </Link>
        .
      </p>
    </>
  );
}
